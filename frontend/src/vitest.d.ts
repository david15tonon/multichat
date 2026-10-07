// Les matchers de jest-dom (toBeInTheDocument…) sont ajoutés à l'exécution par
// vitest.setup.ts, qui est hors du `include` de tsconfig. Cette référence les
// rend visibles au type-check sans élargir le périmètre de compilation.
import '@testing-library/jest-dom/vitest';
