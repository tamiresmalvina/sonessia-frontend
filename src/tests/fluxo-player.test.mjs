import test from "node:test";
import assert from "node:assert/strict";

import { ambienteService } from "../services/sons.service.js";
import { criarControladorReproducaoAudio } from "../services/reprodutor-audio.js";

function criarAudioFalso(url) {
  return {
    url,
    loop: false,
    preload: "",
    volume: 1,
    paused: true,
    readyState: 1,
    currentTime: 0,
    chamadasPlay: 0,
    chamadasPause: 0,
    erroPlay: false,
    ouvintes: new Map(),
    async play() {
      this.chamadasPlay += 1;
      if (this.erroPlay) throw new Error("Falha de reprodução");
      this.paused = false;
    },
    pause() {
      this.chamadasPause += 1;
      this.paused = true;
    },
    addEventListener(tipo, callback) {
      this.ouvintes.set(tipo, callback);
    },
    removeEventListener(tipo) {
      this.ouvintes.delete(tipo);
    },
    removeAttribute() {},
    load() {},
  };
}

test("carregamento correto de ambiente personalizado via endpoint autenticado", async () => {
  const fetchOriginal = globalThis.fetch;
  const mockPersonalizado = {
    ambiente: {
      idAmbienteSonoro: "amb-personalizado-1",
      nome: "Minha Leitura",
      origem: "PERSONALIZADO",
      audios: [
        { idAudio: "audio-p1", titulo: "Vento Leve", arquivo: "https://cdn.example.test/vento.mp3", volume: 50 },
      ],
    },
  };

  let chamadaUrl = "";
  let chamadaHeaders = {};

  globalThis.fetch = async (url, opcoes) => {
    chamadaUrl = url;
    chamadaHeaders = opcoes.headers || {};
    return {
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => mockPersonalizado,
    };
  };

  try {
    const res = await ambienteService.obterAmbiente("token-usuario-123", "amb-personalizado-1");
    assert.equal(new URL(chamadaUrl).pathname, "/ambientes-sonoros/amb-personalizado-1");
    assert.equal(chamadaHeaders.Authorization, "Bearer token-usuario-123");
    assert.equal(res.ambiente.idAmbienteSonoro, "amb-personalizado-1");
    assert.equal(res.ambiente.origem, "PERSONALIZADO");
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test("carregamento correto de ambiente da plataforma via endpoint público", async () => {
  const fetchOriginal = globalThis.fetch;
  const mockPlataforma = {
    ambiente: {
      idAmbienteSonoro: "amb-plataforma-1",
      nome: "Ruído para mascaramento",
      origem: "PRE_CONFIGURADO",
      publicado: true,
      audios: [
        { idAudio: "audio-1", titulo: "Ruído branco", arquivo: "https://cdn.example.test/branco.mp3", volume: 70 },
      ],
    },
  };

  let chamadaUrl = "";

  globalThis.fetch = async (url) => {
    chamadaUrl = url;
    return {
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => mockPlataforma,
    };
  };

  try {
    const res = await ambienteService.obterAmbientePublico("amb-plataforma-1");
    assert.equal(new URL(chamadaUrl).pathname, "/ambientes-sonoros/publicos/amb-plataforma-1");
    assert.equal(res.ambiente.idAmbienteSonoro, "amb-plataforma-1");
    assert.equal(res.ambiente.publicado, true);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test("lógica unificada de busca encontra ambiente personalizado e plataforma sem erro 'Ambiente não encontrado'", async () => {
  const fetchOriginal = globalThis.fetch;

  // Função simulando a lógica de busca do PlayerContext / TelaPlayer
  async function buscarAmbiente(token, id) {
    let resposta = null;
    if (token) {
      try {
        resposta = await ambienteService.obterAmbiente(token, id);
      } catch {
        // Fallback para público
      }
    }
    if (!resposta?.ambiente) {
      resposta = await ambienteService.obterAmbientePublico(id);
    }
    if (!resposta?.ambiente) {
      throw new Error("Ambiente sonoro não encontrado.");
    }
    return resposta.ambiente;
  }

  globalThis.fetch = async (url, opcoes) => {
    const parsed = new URL(url);
    // Se for rota personalizada:
    if (parsed.pathname === "/ambientes-sonoros/amb-user" && opcoes?.headers?.Authorization) {
      return {
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({
          ambiente: { idAmbienteSonoro: "amb-user", nome: "Ambiente do Usuário", origem: "PERSONALIZADO", audios: [] },
        }),
      };
    }
    // Se tentar rota personalizada para ambiente da plataforma, retorna 404
    if (parsed.pathname === "/ambientes-sonoros/amb-plat") {
      return {
        ok: false,
        status: 404,
        headers: { get: () => "application/json" },
        json: async () => ({ codigo: "AMBIENTE_NAO_ENCONTRADO", mensagem: "Não encontrado." }),
      };
    }
    // Rota pública para plataforma
    if (parsed.pathname === "/ambientes-sonoros/publicos/amb-plat") {
      return {
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({
          ambiente: { idAmbienteSonoro: "amb-plat", nome: "Ambiente da Plataforma", origem: "PRE_CONFIGURADO", audios: [] },
        }),
      };
    }
    return {
      ok: false,
      status: 404,
      headers: { get: () => "application/json" },
      json: async () => ({ codigo: "AMBIENTE_NAO_ENCONTRADO", mensagem: "Não encontrado." }),
    };
  };

  try {
    const ambUser = await buscarAmbiente("token-valido", "amb-user");
    assert.equal(ambUser.idAmbienteSonoro, "amb-user");
    assert.equal(ambUser.origem, "PERSONALIZADO");

    const ambPlat = await buscarAmbiente("token-valido", "amb-plat");
    assert.equal(ambPlat.idAmbienteSonoro, "amb-plat");
    assert.equal(ambPlat.origem, "PRE_CONFIGURADO");

    await assert.rejects(
      async () => buscarAmbiente("token-valido", "amb-inexistente"),
      /não encontrado|Ocorreu um erro/i
    );
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test("fluxo do controlador: iniciar reprodução, pausar, retomar e encerrar reprodução", async () => {
  const elementos = new Map();
  const controlador = criarControladorReproducaoAudio((url) => {
    const audio = criarAudioFalso(url);
    elementos.set(url, audio);
    return audio;
  });

  const audiosComposicao = [
    { idAudio: "audio-a", arquivo: "https://cdn.example.test/a.mp3", volume: 50 },
    { idAudio: "audio-b", arquivo: "https://cdn.example.test/b.mp3", volume: 75 },
  ];

  // 1. Iniciar composição
  await controlador.reproduzirComposicao(audiosComposicao);
  const snap1 = controlador.getSnapshot();
  assert.equal(snap1.tocando, true);
  assert.equal(snap1.sonsAtivos, 2);
  assert.equal(elementos.get("https://cdn.example.test/a.mp3").paused, false);
  assert.equal(elementos.get("https://cdn.example.test/b.mp3").paused, false);

  // 2. Pausar
  await controlador.reproduzirPausar();
  const snap2 = controlador.getSnapshot();
  assert.equal(snap2.tocando, false);
  assert.equal(elementos.get("https://cdn.example.test/a.mp3").paused, true);

  // 3. Retomar
  await controlador.reproduzirPausar();
  const snap3 = controlador.getSnapshot();
  assert.equal(snap3.tocando, true);
  assert.equal(elementos.get("https://cdn.example.test/a.mp3").paused, false);

  // 4. Encerrar reprodução (limpar tudo)
  controlador.limparTudo();
  const snap4 = controlador.getSnapshot();
  assert.equal(snap4.tocando, false);
  assert.equal(snap4.sonsAtivos, 0);
  assert.equal(elementos.get("https://cdn.example.test/a.mp3").paused, true);

  // 5. Destruição
  controlador.destruir();
  const snapFinal = controlador.getSnapshot();
  assert.equal(snapFinal.tocando, false);
  assert.equal(snapFinal.sonsAtivos, 0);
});
