import type { ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { theme } from '../styles/theme';

/**
 * Force le thème clair sur son sous-arbre.
 *
 * Les écrans d'authentification sont déjà posés sur un aplat de couleur vive
 * qui fait leur identité : les assombrir n'apporte rien et abîme le contraste
 * des cartes blanches qu'ils portent. La landing page relève du même cas, en
 * plus net : elle n'offre aucune bascule à son visiteur, et quatorze de ses
 * couleurs sont écrites en dur (maquette du hero, bandeau des chiffres) sur
 * l'hypothèse d'une surface claire — l'inversion les laissait sur place.
 *
 * La préférence de l'utilisateur reste mémorisée et s'applique partout
 * ailleurs dès la connexion.
 */
export function LightOnly({ children }: { children: ReactNode }) {
  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>;
}
