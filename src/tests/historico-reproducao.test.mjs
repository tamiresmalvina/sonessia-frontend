import test from "node:test";
import assert from "node:assert/strict";

import { historicoReproducaoService } from "../services/historico-reproducao.service.js";
import { iniciarReproducaoComHistorico } from "../services/iniciar-reproducao-com-historico.js";
import { criarControladorReproducaoAudio } from "../services/reprodutor-audio.js";

function criarAudioFalso(url) {
  return {
    url,
    paused: true,
    readyState: 1,
    volume: 1,
    async play() { this.paused = false; },
    pause() { this.paused = true; },
    addEventListener() {},
    removeEventListener() {},
    removeAttribute() {},
    load() {},
  };
}

function criarOpcoes(iniciar, substituir = {}) {
  return {
    iniciar,
    registrar: async () => {},
    token: "token-usuario",
    idAmbienteSonoro: "ambiente-1",
    chaveSessao: 1,
    sessaoVigente: () => true,
    registrosPendentes: new Map(),
    ...substituir,
  };
}

test("registra somente depois que o controlador confirma início bem-sucedido", async () => {
  let registrada;
  let resolverRegistro;
  const registroConcluido = new Promise((resolve) => { resolverRegistro = resolve; });

  const iniciou = await iniciarReproducaoComHistorico(criarOpcoes(
    async () => true,
    {
      registrar: async (token, idAmbienteSonoro) => {
        registrada = { token, idAmbienteSonoro };
        resolverRegistro();
      },
    },
  ));

  await registroConcluido;
  assert.equal(iniciou, true);
  assert.deepEqual(registrada, { token: "token-usuario", idAmbienteSonoro: "ambiente-1" });
});

test("não registra quando a composição falha", async () => {
  let chamadasRegistro = 0;
  const iniciou = await iniciarReproducaoComHistorico(criarOpcoes(
    async () => false,
    { registrar: async () => { chamadasRegistro += 1; } },
  ));

  assert.equal(iniciou, false);
  assert.equal(chamadasRegistro, 0);
});

test("pausar e retomar não registram de novo, e trocar de ambiente registra o novo", async () => {
  const controlador = criarControladorReproducaoAudio(criarAudioFalso);
  const chamadasRegistro = [];
  const opcoes = (idAmbienteSonoro, audios) => criarOpcoes(
    () => controlador.reproduzirComposicao(audios),
    {
      idAmbienteSonoro,
      registrar: async (_token, id) => { chamadasRegistro.push(id); },
    },
  );

  await iniciarReproducaoComHistorico(opcoes("ambiente-1", [
    { idAudio: "audio-1", arquivo: "https://audio.test/1.mp3", volume: 50 },
  ]));
  await new Promise((resolve) => setImmediate(resolve));
  await controlador.reproduzirPausar();
  await controlador.reproduzirPausar();
  await new Promise((resolve) => setImmediate(resolve));

  await iniciarReproducaoComHistorico(opcoes("ambiente-2", [
    { idAudio: "audio-2", arquivo: "https://audio.test/2.mp3", volume: 50 },
  ]));
  await new Promise((resolve) => setImmediate(resolve));

  assert.deepEqual(chamadasRegistro, ["ambiente-1", "ambiente-2"]);
  controlador.destruir();
});

test("não chama API sem usuário autenticado ou se a sessão mudou durante o início", async () => {
  let chamadasRegistro = 0;
  const iniciouDeslogado = await iniciarReproducaoComHistorico(criarOpcoes(
    async () => true,
    { token: null, registrar: async () => { chamadasRegistro += 1; } },
  ));
  const iniciouSessaoAntiga = await iniciarReproducaoComHistorico(criarOpcoes(
    async () => true,
    { sessaoVigente: () => false, registrar: async () => { chamadasRegistro += 1; } },
  ));

  assert.equal(iniciouDeslogado, true);
  assert.equal(iniciouSessaoAntiga, true);
  assert.equal(chamadasRegistro, 0);
});

test("falha da API não altera o resultado da reprodução", async () => {
  const iniciou = await iniciarReproducaoComHistorico(criarOpcoes(
    async () => true,
    { registrar: async () => { throw new Error("API indisponível"); } },
  ));

  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(iniciou, true);
});

test("coalesce chamadas de registro concorrentes para o mesmo ambiente e sessão", async () => {
  let chamadasRegistro = 0;
  let concluirRegistro;
  const bloqueioRegistro = new Promise((resolve) => { concluirRegistro = resolve; });
  const registrosPendentes = new Map();
  const opcoes = criarOpcoes(
    async () => true,
    {
      registrosPendentes,
      registrar: async () => {
        chamadasRegistro += 1;
        await bloqueioRegistro;
      },
    },
  );

  await Promise.all([
    iniciarReproducaoComHistorico(opcoes),
    iniciarReproducaoComHistorico(opcoes),
  ]);
  await new Promise((resolve) => setImmediate(resolve));
  concluirRegistro();
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(chamadasRegistro, 1);
});

test("service envia POST autenticado com somente o identificador do ambiente", async () => {
  const fetchOriginal = globalThis.fetch;
  let requisicao;
  globalThis.fetch = async (url, opcoes) => {
    requisicao = { url, opcoes };
    return {
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({ mensagem: "ok" }),
    };
  };

  try {
    await historicoReproducaoService.registrar("token-123", "ambiente-123");
    assert.equal(new URL(requisicao.url).pathname, "/historico-reproducoes");
    assert.equal(requisicao.opcoes.method, "POST");
    assert.equal(requisicao.opcoes.headers.Authorization, "Bearer token-123");
    assert.deepEqual(JSON.parse(requisicao.opcoes.body), { idAmbienteSonoro: "ambiente-123" });
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});
