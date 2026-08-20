import '@testing-library/jest-dom/vitest';
import { configure } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { resetCategoryFixtures, resetTicketFixtures, server } from './server';

// Este ambiente de sandbox é mais lento que uma máquina de dev comum — o default
// de 1000ms do RTL fica flaky para telas que disparam 2+ queries (chamados + categorias).
configure({ asyncUtilTimeout: 4000 });

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  resetTicketFixtures();
  resetCategoryFixtures();
});
afterAll(() => server.close());
