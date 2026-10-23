import '@testing-library/jest-dom/vitest';

// jsdom n'implémente pas la mise en page : `scrollIntoView` n'existe pas, et
// tout composant qui fait défiler jusqu'au dernier message tombe au montage.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
