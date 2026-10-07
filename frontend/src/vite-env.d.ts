/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base de l'API backend, sans slash final. Ex. http://127.0.0.1:8000 */
  readonly VITE_API_URL?: string;
  /** Base WebSocket. Déduite de VITE_API_URL si absente. */
  readonly VITE_WS_URL?: string;
  readonly VITE_ENABLE_TRANSLATION?: string;
  readonly VITE_ENABLE_VIDEO_CALLS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
