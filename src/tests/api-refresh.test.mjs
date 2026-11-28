import test from 'node:test';
import assert from 'node:assert/strict';

class StorageFalso {
  #valores = new Map();
  getItem(chave) { return this.#valores.get(chave) ?? null; }
  setItem(chave, valor) { this.#valores.set(chave, String(valor)); }
  removeItem(chave) { this.#valores.delete(chave); }
}

globalThis.localStorage = new StorageFalso();
globalThis.sessionStorage = new StorageFalso();

const { requisicaoApi } = await import('../services/api.js');
const { requisicaoApi: requisicaoApiOutraAba } = await import('../services/api.js?aba=2');
const { limparAutenticacao, obterTokenArmazenado, salvarAutenticacao } =
  await import('../services/auth-session.js');

const usuario = { id: 'u1', nome: 'Usuário de teste', perfil: 'COMUM' };

function resposta(status, dados = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (nome) => nome.toLowerCase() === 'content-type' ? 'application/json' : null },
    json: async () => dados,
  };
}

test('renova em um 401 e repete uma vez usando o token novo', async () => {
  limparAutenticacao();
  salvarAutenticacao('token-antigo', usuario, true);
  const chamadas = [];
  globalThis.fetch = async (url, opcoes) => {
    chamadas.push({ url, opcoes });
    if (url.endsWith('/autenticacao/renovar-sessao')) {
      return resposta(200, { tokenAcesso: 'token-novo', usuario });
    }
    return opcoes.headers.Authorization === 'Bearer token-antigo'
      ? resposta(401, { erro: { mensagem: 'Token expirado.' } })
      : resposta(200, { sucesso: true });
  };

  const resultado = await requisicaoApi('/recurso', {
    headers: { Authorization: 'Bearer token-antigo' },
  });

  assert.deepEqual(resultado, { sucesso: true });
  assert.equal(chamadas.length, 3);
  assert.equal(chamadas[1].opcoes.credentials, 'include');
  assert.equal(chamadas[1].opcoes.method, 'POST');
  assert.equal(chamadas[2].opcoes.headers.Authorization, 'Bearer token-novo');
  assert.equal(obterTokenArmazenado(), 'token-novo');
  assert.equal(localStorage.getItem('sonessia_lembrar_me'), 'true');
});

test('compartilha uma única renovação entre respostas 401 simultâneas', async () => {
  limparAutenticacao();
  salvarAutenticacao('token-antigo-concorrente', usuario, false);
  let quantidadeRenovacoes = 0;
  const chamadasOriginais = new Map();
  globalThis.fetch = async (url, opcoes) => {
    if (url.endsWith('/autenticacao/renovar-sessao')) {
      quantidadeRenovacoes += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return resposta(200, { tokenAcesso: 'token-novo-concorrente', usuario });
    }

    const quantidade = (chamadasOriginais.get(url) || 0) + 1;
    chamadasOriginais.set(url, quantidade);
    if (opcoes.headers.Authorization === 'Bearer token-antigo-concorrente') {
      return resposta(401, { erro: { mensagem: 'Token expirado.' } });
    }
    return resposta(200, { url });
  };

  const [a, b] = await Promise.all([
    requisicaoApi('/recurso-a', { headers: { Authorization: 'Bearer token-antigo-concorrente' } }),
    requisicaoApi('/recurso-b', { headers: { Authorization: 'Bearer token-antigo-concorrente' } }),
  ]);

  assert.equal(quantidadeRenovacoes, 1);
  assert.deepEqual(a, { url: 'http://localhost:3000/recurso-a' });
  assert.deepEqual(b, { url: 'http://localhost:3000/recurso-b' });
  assert.equal(chamadasOriginais.get('http://localhost:3000/recurso-a'), 2);
  assert.equal(chamadasOriginais.get('http://localhost:3000/recurso-b'), 2);
  assert.equal(obterTokenArmazenado(), 'token-novo-concorrente');
  assert.equal(sessionStorage.getItem('sonessia_token'), 'token-novo-concorrente');
});

test('compartilha a rotação do refresh entre abas quando Web Locks está disponível', async () => {
  limparAutenticacao();
  salvarAutenticacao('token-antigo-duas-abas', usuario, true);
  let quantidadeRenovacoes = 0;
  let filaLocks = Promise.resolve();
  const navigatorOriginal = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      locks: {
        request: (_nome, callback) => {
          const anterior = filaLocks;
          let liberar;
          filaLocks = new Promise((resolve) => { liberar = resolve; });
          return anterior.then(callback).finally(liberar);
        },
      },
    },
  });

  globalThis.fetch = async (url, opcoes) => {
    if (url.endsWith('/autenticacao/renovar-sessao')) {
      quantidadeRenovacoes += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return resposta(200, { tokenAcesso: 'token-novo-duas-abas', usuario });
    }
    return opcoes.headers.Authorization === 'Bearer token-antigo-duas-abas'
      ? resposta(401, { erro: { mensagem: 'Token expirado.' } })
      : resposta(200, { sucesso: true });
  };

  try {
    const [resultadoAbaUm, resultadoAbaDois] = await Promise.all([
      requisicaoApi('/recurso-aba-um', {
        headers: { Authorization: 'Bearer token-antigo-duas-abas' },
      }),
      requisicaoApiOutraAba('/recurso-aba-dois', {
        headers: { Authorization: 'Bearer token-antigo-duas-abas' },
      }),
    ]);

    assert.equal(quantidadeRenovacoes, 1);
    assert.deepEqual(resultadoAbaUm, { sucesso: true });
    assert.deepEqual(resultadoAbaDois, { sucesso: true });
    assert.equal(obterTokenArmazenado(), 'token-novo-duas-abas');
  } finally {
    if (navigatorOriginal) {
      Object.defineProperty(globalThis, 'navigator', navigatorOriginal);
    } else {
      delete globalThis.navigator;
    }
  }
});

test('se a renovação falhar, limpa a sessão e não repete a chamada original', async () => {
  limparAutenticacao();
  salvarAutenticacao('token-invalido', usuario, true);
  let chamadasOriginais = 0;
  globalThis.fetch = async (url) => {
    if (url.endsWith('/autenticacao/renovar-sessao')) {
      return resposta(401, { erro: { mensagem: 'Refresh inválido.' } });
    }
    chamadasOriginais += 1;
    return resposta(401, { erro: { mensagem: 'Token expirado.' } });
  };

  await assert.rejects(
    requisicaoApi('/recurso', { headers: { Authorization: 'Bearer token-invalido' } }),
    /Token expirado/,
  );
  assert.equal(chamadasOriginais, 1);
  assert.equal(obterTokenArmazenado(), null);
  assert.equal(localStorage.getItem('sonessia_usuario'), null);
});

test('não entra em loop se a chamada repetida ainda retornar 401', async () => {
  limparAutenticacao();
  salvarAutenticacao('token-que-expirou', usuario, false);
  let chamadasOriginais = 0;
  globalThis.fetch = async (url) => {
    if (url.endsWith('/autenticacao/renovar-sessao')) {
      return resposta(200, { tokenAcesso: 'token-ainda-rejeitado', usuario });
    }
    chamadasOriginais += 1;
    return resposta(401, { erro: { mensagem: 'Não autorizado.' } });
  };

  await assert.rejects(
    requisicaoApi('/recurso', { headers: { Authorization: 'Bearer token-que-expirou' } }),
    /Não autorizado/,
  );
  assert.equal(chamadasOriginais, 2);
  assert.equal(obterTokenArmazenado(), null);
});

test('repete upload FormData sem alterar o corpo nem definir Content-Type manualmente', async () => {
  limparAutenticacao();
  salvarAutenticacao('token-upload-antigo', usuario, true);
  const formulario = new FormData();
  formulario.set('arquivo', new Blob(['áudio']), 'audio.wav');
  const chamadas = [];
  globalThis.fetch = async (url, opcoes) => {
    chamadas.push({ url, opcoes });
    if (url.endsWith('/autenticacao/renovar-sessao')) {
      return resposta(200, { tokenAcesso: 'token-upload-novo', usuario });
    }
    return chamadas.filter((chamada) => !chamada.url.endsWith('/autenticacao/renovar-sessao')).length === 1
      ? resposta(401, { erro: { mensagem: 'Token expirado.' } })
      : resposta(201, { enviado: true });
  };

  const resultado = await requisicaoApi('/upload', {
    method: 'POST',
    headers: { Authorization: 'Bearer token-upload-antigo' },
    body: formulario,
  });

  const chamadasUpload = chamadas.filter((chamada) => !chamada.url.endsWith('/autenticacao/renovar-sessao'));
  assert.deepEqual(resultado, { enviado: true });
  assert.equal(chamadasUpload.length, 2);
  assert.equal(chamadasUpload[0].opcoes.body, formulario);
  assert.equal(chamadasUpload[1].opcoes.body, formulario);
  assert.equal(chamadasUpload[1].opcoes.headers.Authorization, 'Bearer token-upload-novo');
  assert.equal('Content-Type' in chamadasUpload[0].opcoes.headers, false);
});
