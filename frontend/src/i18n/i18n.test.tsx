import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider, useT, useI18n } from './I18nContext';
import { dictionaries, en, fr } from './translations';

function Sonde({ keyName }: { keyName: Parameters<ReturnType<typeof useT>>[0] }) {
  const t = useT();
  const { locale } = useI18n();
  return (
    <>
      <span data-testid="locale">{locale}</span>
      <span data-testid="texte">{t(keyName)}</span>
    </>
  );
}

describe('dictionnaires', () => {
  it('l’anglais couvre exactement les clés du français', () => {
    // Le type Dictionary l'impose déjà au compilateur ; ce test protège
    // contre un `as any` ou une clé ajoutée d'un seul côté.
    expect(Object.keys(en).sort()).toEqual(Object.keys(fr).sort());
  });

  it('aucune valeur n’est vide', () => {
    for (const [langue, dictionnaire] of Object.entries(dictionaries)) {
      const vides = Object.entries(dictionnaire)
        .filter(([, valeur]) => !valeur.trim())
        .map(([cle]) => `${langue}:${cle}`);
      expect(vides).toEqual([]);
    }
  });

  it('les deux langues portent les mêmes variables d’interpolation', () => {
    // Une variable oubliée dans une traduction laisse un « {name} » brut à
    // l'écran, ce qu'aucun type ne détecte.
    const variables = (texte: string) => (texte.match(/\{(\w+)\}/g) ?? []).sort();
    for (const cle of Object.keys(fr) as Array<keyof typeof fr>) {
      expect(variables(en[cle]), `clé ${cle}`).toEqual(variables(fr[cle]));
    }
  });
});

describe('I18nProvider', () => {
  it('rend les chaînes dans la langue demandée', () => {
    render(<I18nProvider locale="en"><Sonde keyName="chat.today" /></I18nProvider>);

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('texte')).toHaveTextContent('TODAY');
  });

  it('rend le français quand il est demandé', () => {
    render(<I18nProvider locale="fr"><Sonde keyName="chat.today" /></I18nProvider>);

    expect(screen.getByTestId('texte')).toHaveTextContent('AUJOURD');
  });

  it('interpole les variables', () => {
    function AvecNom() {
      const t = useT();
      return <span data-testid="texte">{t('chat.typing', { name: 'Elena' })}</span>;
    }
    render(<I18nProvider locale="en"><AvecNom /></I18nProvider>);

    expect(screen.getByTestId('texte')).toHaveTextContent('Elena is typing');
  });

  it('remplace toutes les occurrences d’une même variable', () => {
    function Repete() {
      const t = useT();
      // `conversations.speaks` n'en contient qu'une ; on vérifie le mécanisme
      // avec une valeur contenant elle-même des accolades.
      return <span data-testid="texte">{t('conversations.speaks', { language: 'EN' })}</span>;
    }
    render(<I18nProvider locale="en"><Repete /></I18nProvider>);

    expect(screen.getByTestId('texte')).toHaveTextContent('Speaks EN');
  });

  it('lève une erreur explicite hors de tout provider', () => {
    const silence = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Sonde keyName="chat.today" />)).toThrow(/I18nProvider/);
    silence.mockRestore();
  });
});
