import test from 'node:test';
import assert from 'node:assert/strict';

function configurarWindow(armazenamento = new Map()) {
  const listeners = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (chave) => armazenamento.get(chave) ?? null,
      setItem: (chave, valor) => armazenamento.set(chave, valor),
      removeItem: (chave) => armazenamento.delete(chave),
    },
    addEventListener: (nome, fn) => listeners.set(nome, [...(listeners.get(nome) || []), fn]),
    removeEventListener: (nome, fn) => listeners.set(nome, (listeners.get(nome) || []).filter((item) => item !== fn)),
    dispatchEvent: (evento) => {
      for (const fn of listeners.get(evento.type) || []) fn(evento);
      return true;
    },
  };
  return armazenamento;
}

test('espera de logout persiste um prazo absoluto e não reinicia ao solicitar novamente', async () => {
  configurarWindow();
  const fluxo = await import('../utils/exclusaoContaSuccess.js');
  fluxo.limparEsperaLogoutExclusao();
  const inicial = fluxo.iniciarEsperaLogoutExclusao('2026-12-27T14:30:00.000Z', 100_000);
  const repetido = fluxo.iniciarEsperaLogoutExclusao('2027-01-01T00:00:00.000Z', 110_000);
  assert.equal(inicial.prazoLogoutEm, 130_000);
  assert.deepEqual(repetido, inicial);
  assert.equal(fluxo.calcularSegundosRestantes(inicial.prazoLogoutEm, 110_000), 20);
  assert.equal(fluxo.calcularSegundosRestantes(inicial.prazoLogoutEm, 130_001), 0);
  fluxo.limparEsperaLogoutExclusao();
  assert.equal(fluxo.obterEsperaLogoutExclusao(), null);
});

test('recarregar lê a data limite e a data de exclusão do armazenamento', async () => {
  const armazenamento = configurarWindow();
  const fluxo = await import('../utils/exclusaoContaSuccess.js');
  fluxo.limparEsperaLogoutExclusao();
  fluxo.iniciarEsperaLogoutExclusao('2026-12-27T14:30:00.000Z', 500_000);
  globalThis.window = {
    ...globalThis.window,
    localStorage: {
      getItem: (chave) => armazenamento.get(chave) ?? null,
      setItem: (chave, valor) => armazenamento.set(chave, valor),
      removeItem: (chave) => armazenamento.delete(chave),
    },
  };
  assert.deepEqual(fluxo.obterEsperaLogoutExclusao(), {
    prazoLogoutEm: 530_000,
    exclusaoDefinitivaEm: '2026-12-27T14:30:00.000Z',
  });
});
