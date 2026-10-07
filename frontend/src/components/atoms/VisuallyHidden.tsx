import styled from 'styled-components';

/**
 * Masque un texte visuellement tout en le laissant accessible aux lecteurs
 * d'écran. Utilisé pour nommer les boutons icon-only (connexion sociale),
 * qui autrement sont annoncés comme « bouton » sans plus de précision.
 */
export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
