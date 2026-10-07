// Le thème est la source de vérité unique : `theme.ts` exporte déjà
// `export type Theme = typeof theme`. On en dérive l'interface de
// styled-components au lieu de la redéclarer à la main, ce qui rendait la
// dérive entre les deux structurellement possible (et effective).
import 'styled-components';
import type { Theme } from './styles/theme';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends Theme {}
}
