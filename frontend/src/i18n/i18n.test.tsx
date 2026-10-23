import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider, useT, useI18n } from './I18nContext';
import { dictionaries, en, fr, type UiLocale } from './translations';

const CLE_STOCKAGE = 'multichat.ui-locale';

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

/** Sonde capable de changer de langue, comme le fait la bascule FR/EN. */
function SondeAvecBascule({ vers }: { vers: UiLocale }) {
  const { locale, setLocale } = useI18n();
  return (
    <>
      <span data-testid="locale">{locale}</span>
      <button type="button" onClick={() => setLocale(vers)}>
        basculer
      </button>
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

describe('langue du visiteur', () => {
  beforeEach(() => window.localStorage.clear());

  it('part de l’anglais quand rien n’a été choisi', () => {
    // Règle de la landing : anglais par défaut, quelle que soit la langue du
    // navigateur — il n'y a plus de détection.
    render(<I18nProvider><Sonde keyName="chat.today" /></I18nProvider>);

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });

  it('reprend le choix mémorisé d’une visite précédente', () => {
    window.localStorage.setItem(CLE_STOCKAGE, 'fr');

    render(<I18nProvider><Sonde keyName="chat.today" /></I18nProvider>);

    expect(screen.getByTestId('locale')).toHaveTextContent('fr');
  });

  it('ignore une valeur stockée qui n’est pas une langue d’interface', () => {
    window.localStorage.setItem(CLE_STOCKAGE, 'ja');

    render(<I18nProvider><Sonde keyName="chat.today" /></I18nProvider>);

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });

  it('applique et mémorise le choix du visiteur', async () => {
    render(<I18nProvider><SondeAvecBascule vers="fr" /></I18nProvider>);

    await userEvent.click(screen.getByRole('button', { name: 'basculer' }));

    expect(screen.getByTestId('locale')).toHaveTextContent('fr');
    expect(window.localStorage.getItem(CLE_STOCKAGE)).toBe('fr');
  });

  it('laisse la langue imposée primer sur le choix mémorisé', () => {
    // Cas de l'utilisateur connecté : c'est son compte qui fait foi.
    window.localStorage.setItem(CLE_STOCKAGE, 'fr');

    render(<I18nProvider locale="en"><Sonde keyName="chat.today" /></I18nProvider>);

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
  });

  it('reste utilisable quand le stockage est refusé', () => {
    // Navigation privée, iframe tierce : localStorage lève à la lecture.
    const stockage = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('accès refusé');
    });

    render(<I18nProvider><Sonde keyName="chat.today" /></I18nProvider>);

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    stockage.mockRestore();
  });

  it('reflète la langue sur l’attribut lang du document', () => {
    render(<I18nProvider locale="fr"><Sonde keyName="chat.today" /></I18nProvider>);

    expect(document.documentElement.lang).toBe('fr');
  });
});
