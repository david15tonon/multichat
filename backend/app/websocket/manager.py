"""Gestion des connexions WebSocket, avec relais Redis entre instances.

Pourquoi un relais : en serverless, une connexion est épinglée à une instance,
et rien ne garantit que deux utilisateurs atterrissent sur la même. Un
gestionnaire purement en mémoire fait donc disparaître les messages entre
instances — la documentation Vercel l'énonce explicitement.

Le découpage :
  - les WebSockets eux-mêmes restent LOCAUX (un socket n'est pas sérialisable) ;
  - la présence et l'appartenance aux conversations vivent dans Redis ;
  - l'envoi passe par un canal Redis : chaque instance reçoit la publication et
    sert les sockets qu'elle détient.

Sans `REDIS_URL`, tout retombe sur un fonctionnement purement en mémoire :
le développement local n'a besoin d'aucune infrastructure.
"""

from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Optional, Set
from uuid import UUID

from fastapi import WebSocket

from app.core.config import settings

logger = logging.getLogger(__name__)

CHANNEL = "multichat:deliver"
PRESENCE_KEY = "multichat:online:{user_id}"
# Dépasse largement l'intervalle de heartbeat du client (25 s) : si une
# instance meurt sans se déconnecter proprement, la présence expire d'elle-même.
PRESENCE_TTL_SECONDS = 90
ROOM_KEY = "multichat:conv:{conversation_id}"
ROOM_TTL_SECONDS = 60 * 60 * 24


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class ConnectionManager:
    """Connexions WebSocket, locales et distribuées."""

    def __init__(self) -> None:
        # Sockets détenus par CETTE instance.
        self.active_connections: Dict[UUID, Set[WebSocket]] = {}
        # Repli utilisé uniquement quand Redis n'est pas configuré.
        self.conversation_participants: Dict[UUID, Set[UUID]] = {}
        self._redis = None
        self._subscriber_task: Optional[asyncio.Task] = None

    # ------------------------------------------------------------------ Redis

    @property
    def distributed(self) -> bool:
        return self._redis is not None

    async def startup(self) -> None:
        """Ouvre Redis et lance l'abonnement. Sans URL, on reste en mémoire."""
        if not settings.REDIS_URL:
            logger.info("REDIS_URL absente : gestionnaire en mémoire (mono-instance).")
            return

        try:
            from redis.asyncio import from_url

            self._redis = from_url(settings.REDIS_URL, decode_responses=True)
            await self._redis.ping()
            self._subscriber_task = asyncio.create_task(self._subscribe())
            logger.info("Relais Redis actif : diffusion entre instances opérationnelle.")
        except Exception as exc:
            # Un Redis injoignable ne doit pas empêcher le serveur de démarrer :
            # la messagerie fonctionne, seule la diffusion inter-instances tombe.
            self._redis = None
            logger.warning("Redis injoignable (%s) : repli en mémoire.", exc)

    async def shutdown(self) -> None:
        if self._subscriber_task:
            self._subscriber_task.cancel()
            self._subscriber_task = None
        if self._redis:
            await self._redis.aclose()
            self._redis = None

    async def _subscribe(self) -> None:
        """Sert aux sockets locaux tout ce qui est publié sur le canal."""
        pubsub = self._redis.pubsub()
        await pubsub.subscribe(CHANNEL)
        try:
            async for event in pubsub.listen():
                if event.get("type") != "message":
                    continue
                try:
                    payload = json.loads(event["data"])
                    await self._deliver_local(
                        payload["message"], UUID(payload["target"])
                    )
                except Exception as exc:
                    logger.warning("Événement Redis illisible : %s", exc)
        except asyncio.CancelledError:
            await pubsub.unsubscribe(CHANNEL)
            raise

    # ------------------------------------------------------------ connexions

    async def connect(self, websocket: WebSocket, user_id: UUID) -> None:
        await websocket.accept()
        self.active_connections.setdefault(user_id, set()).add(websocket)
        await self._mark_present(user_id)
        await self.broadcast_user_status(user_id, is_online=True)

    async def disconnect_async(self, websocket: WebSocket, user_id: UUID) -> None:
        sockets = self.active_connections.get(user_id)
        if not sockets:
            return

        sockets.discard(websocket)
        if sockets:
            return

        del self.active_connections[user_id]
        await self._mark_absent(user_id)
        await self.broadcast_user_status(user_id, is_online=False)

    def disconnect(self, websocket: WebSocket, user_id: UUID) -> None:
        """Variante synchrone, conservée pour les appelants existants."""
        asyncio.create_task(self.disconnect_async(websocket, user_id))

    async def _mark_present(self, user_id: UUID) -> None:
        if self._redis:
            await self._redis.set(
                PRESENCE_KEY.format(user_id=user_id), "1", ex=PRESENCE_TTL_SECONDS
            )

    async def _mark_absent(self, user_id: UUID) -> None:
        if self._redis:
            await self._redis.delete(PRESENCE_KEY.format(user_id=user_id))

    async def refresh_presence(self, user_id: UUID) -> None:
        """Appelée à chaque heartbeat : repousse l'expiration de la présence."""
        if self._redis and user_id in self.active_connections:
            await self._redis.expire(
                PRESENCE_KEY.format(user_id=user_id), PRESENCE_TTL_SECONDS
            )

    async def is_user_online(self, user_id: UUID) -> bool:
        if self._redis:
            return bool(await self._redis.exists(PRESENCE_KEY.format(user_id=user_id)))
        return bool(self.active_connections.get(user_id))

    # --------------------------------------------------------------- envois

    async def _deliver_local(self, message: dict, user_id: UUID) -> None:
        """Sert les sockets de cette instance, en purgeant les morts."""
        sockets = self.active_connections.get(user_id)
        if not sockets:
            return

        perdus = set()
        for connection in sockets:
            try:
                await connection.send_json(message)
            except Exception:
                perdus.add(connection)

        for connection in perdus:
            sockets.discard(connection)

    async def send_personal_message(self, message: dict, user_id: UUID) -> None:
        if self._redis:
            # Publié pour TOUTES les instances : seule celle qui détient le
            # socket servira réellement, les autres n'ont rien à livrer.
            await self._redis.publish(
                CHANNEL, json.dumps({"target": str(user_id), "message": message})
            )
        else:
            await self._deliver_local(message, user_id)

    async def send_to_conversation(
        self,
        message: dict,
        conversation_id: UUID,
        exclude_user: Optional[UUID] = None,
    ) -> None:
        for user_id in await self.conversation_members(conversation_id):
            if exclude_user and user_id == exclude_user:
                continue
            await self.send_personal_message(message, user_id)

    # ------------------------------------------------------------- salons

    async def conversation_members(self, conversation_id: UUID) -> Set[UUID]:
        if self._redis:
            membres = await self._redis.smembers(
                ROOM_KEY.format(conversation_id=conversation_id)
            )
            return {UUID(m) for m in membres}
        return set(self.conversation_participants.get(conversation_id, set()))

    async def join_conversation(self, user_id: UUID, conversation_id: UUID) -> None:
        if self._redis:
            cle = ROOM_KEY.format(conversation_id=conversation_id)
            await self._redis.sadd(cle, str(user_id))
            await self._redis.expire(cle, ROOM_TTL_SECONDS)
        else:
            self.conversation_participants.setdefault(conversation_id, set()).add(user_id)

    async def leave_conversation(self, user_id: UUID, conversation_id: UUID) -> None:
        if self._redis:
            await self._redis.srem(
                ROOM_KEY.format(conversation_id=conversation_id), str(user_id)
            )
        else:
            salon = self.conversation_participants.get(conversation_id)
            if salon:
                salon.discard(user_id)
                if not salon:
                    del self.conversation_participants[conversation_id]

    # --------------------------------------------------------- diffusions

    async def broadcast_user_status(self, user_id: UUID, is_online: bool) -> None:
        message = {
            "type": "user_status",
            "data": {
                "user_id": str(user_id),
                "is_online": is_online,
                "timestamp": _now(),
            },
        }
        # En mode distribué on ne connaît pas l'ensemble des connectés : on
        # prévient les sockets locaux, et les autres instances apprendront la
        # présence au prochain chargement des conversations.
        for uid in list(self.active_connections.keys()):
            await self._deliver_local(message, uid)

    async def broadcast_typing_indicator(
        self, user_id: UUID, conversation_id: UUID, is_typing: bool
    ) -> None:
        await self.send_to_conversation(
            {
                "type": "typing",
                "data": {
                    "user_id": str(user_id),
                    "conversation_id": str(conversation_id),
                    "is_typing": is_typing,
                    "timestamp": _now(),
                },
            },
            conversation_id,
            exclude_user=user_id,
        )

    async def broadcast_read_receipt(
        self, user_id: UUID, message_id: UUID, conversation_id: UUID
    ) -> None:
        await self.send_to_conversation(
            {
                "type": "read",
                "data": {
                    "user_id": str(user_id),
                    "message_id": str(message_id),
                    "conversation_id": str(conversation_id),
                    "read_at": _now(),
                },
            },
            conversation_id,
            exclude_user=user_id,
        )

    async def broadcast_message(
        self, message_data: dict, conversation_id: UUID, sender_id: UUID
    ) -> None:
        # Envoyé à tous, émetteur compris : ses autres appareils doivent voir
        # le message. Le client déduplique sur l'identifiant.
        await self.send_to_conversation(
            {"type": "message", "data": message_data}, conversation_id
        )


manager = ConnectionManager()
