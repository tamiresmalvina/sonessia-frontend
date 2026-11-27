import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calcularSegundosRestantes,
  iniciarPrazoSaidaEmail,
  obterPrazoSaidaEmail,
  limparPrazoSaidaEmail,
} from '../utils/emailAlteradoSuccess.js';

function configurarArmazenamento() {
  const valores = new Map();
  globalThis.window = {
    localStorage: {
      setItem: (chave, valor) => valores.set(chave, String(valor)),
      getItem: (chave) => valores.get(chave) ?? null,
      removeItem: (chave) => valores.delete(chave),
    },
    dispatchEvent: () => true,
  };
  return valores;
}

test('prazo da saída permanece o mesmo ao recuperar o estado após remontagem', () => {
  configurarArmazenamento();
  const prazoOriginal = 1_900_000_000_000;
  iniciarPrazoSaidaEmail(prazoOriginal);

  assert.equal(obterPrazoSaidaEmail(), prazoOriginal);
  assert.equal(obterPrazoSaidaEmail(), prazoOriginal);
  assert.equal(calcularSegundosRestantes(prazoOriginal, prazoOriginal - 30_000), 30);
  assert.equal(calcularSegundosRestantes(prazoOriginal, prazoOriginal - 1_000), 1);
  assert.equal(calcularSegundosRestantes(prazoOriginal, prazoOriginal), 0);
});

test('logout limpa o prazo persistido para não bloquear uma próxima autenticação', () => {
  configurarArmazenamento();
  iniciarPrazoSaidaEmail(1_900_000_000_000);
  limparPrazoSaidaEmail();

  assert.equal(obterPrazoSaidaEmail(), null);
});
