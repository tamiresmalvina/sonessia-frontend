import test from "node:test";
import assert from "node:assert/strict";

test("listarAudios preserva o DTO real retornado por GET /audios", async () => {
  const respostaOriginal = globalThis.fetch;
  const payload = {
    audios: [
      {
        idAudio: "audio-1",
        titulo: "Chuva",
        tituloOriginal: "Rain",
        descricao: null,
        categoria: "Natureza",
        icone: "cloud-rain",
        arquivo: "https://cdn.example.test/chuva.mp3",
        fonte: "Acervo",
        licenca: "CC0",
      },
    ],
  };
  let chamada;
  globalThis.fetch = async (url, opcoes) => {
    chamada = { url, opcoes };
    return {
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => payload,
    };
  };

  try {
    const { audioService } = await import("../services/sons.service.js");
    const resposta = await audioService.listarAudios();

    assert.equal(new URL(chamada.url).pathname, "/audios");
    assert.equal(chamada.opcoes.method, "GET");
    assert.deepEqual(resposta, payload);
  } finally {
    globalThis.fetch = respostaOriginal;
  }
});

test("listarAmbientesPublicos preserva o envelope { ambientes } da API", async () => {
  const respostaOriginal = globalThis.fetch;
  const payload = {
    ambientes: [
      {
        idAmbienteSonoro: "ambiente-1",
        nome: "Foco",
        audios: [
          {
            idAudio: "audio-1",
            titulo: "Chuva",
            arquivo: "https://cdn.example.test/chuva.mp3",
            volume: 35,
          },
        ],
      },
    ],
  };
  let chamada;
  globalThis.fetch = async (url, opcoes) => {
    chamada = { url, opcoes };
    return {
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => payload,
    };
  };

  try {
    const { ambienteService } = await import("../services/sons.service.js");
    const resposta = await ambienteService.listarAmbientesPublicos();

    assert.equal(new URL(chamada.url).pathname, "/ambientes-sonoros/publicos");
    assert.equal(chamada.opcoes.method, "GET");
    assert.deepEqual(resposta, payload);
  } finally {
    globalThis.fetch = respostaOriginal;
  }
});

test("audioService envia cadastro como multipart sem definir manualmente o boundary", async () => {
  const chamadas = [];
  const respostaOriginal = globalThis.fetch;
  globalThis.fetch = async (url, opcoes) => {
    chamadas.push({ url, opcoes });
    return {
      ok: true,
      status: 201,
      headers: { get: () => "application/json" },
      json: async () => ({ audio: { idAudio: "audio-1", icone: "cloud-rain" } }),
    };
  };

  try {
    const { audioService } = await import("../services/sons.service.js");
    const arquivo = new File(["dados de áudio"], "chuva.mp3", { type: "audio/mpeg" });
    const metadados = {
      titulo: "Chuva",
      tituloOriginal: "Rain",
      categoria: "Natureza",
      fonte: "Domínio público",
      licenca: "CC0",
      icone: "cloud-rain",
    };
    const resposta = await audioService.criarAudio("jwt-admin", metadados, arquivo);
    const { url, opcoes } = chamadas[0];
    const formulario = opcoes.body;

    assert.equal(new URL(url).pathname, "/audios");
    assert.equal(opcoes.method, "POST");
    assert.equal(opcoes.headers.Authorization, "Bearer jwt-admin");
    assert.equal(opcoes.headers["Content-Type"], undefined);
    assert.ok(formulario instanceof FormData);
    assert.deepEqual(JSON.parse(formulario.get("metadados")), metadados);
    assert.equal(formulario.get("arquivo").name, "chuva.mp3");
    assert.equal(resposta.audio.icone, "cloud-rain");
  } finally {
    globalThis.fetch = respostaOriginal;
  }
});

test("audioService mantém cadastro sem ícone e envia atualização ou remoção pelo PATCH", async () => {
  const chamadas = [];
  const respostaOriginal = globalThis.fetch;
  globalThis.fetch = async (url, opcoes) => {
    chamadas.push({ url, opcoes });
    return {
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({ audio: { idAudio: "audio-1", icone: null } }),
    };
  };

  try {
    const { audioService } = await import("../services/sons.service.js");
    const arquivo = new File(["dados de áudio"], "som.mp3", { type: "audio/mpeg" });
    await audioService.criarAudio("jwt-admin", { titulo: "Som", icone: null }, arquivo);
    await audioService.atualizarAudio("jwt-admin", "audio-1", { icone: "guitar-electric" });
    const resposta = await audioService.atualizarAudio("jwt-admin", "audio-1", { icone: null });

    assert.deepEqual(JSON.parse(chamadas[0].opcoes.body.get("metadados")), {
      titulo: "Som",
      icone: null,
    });
    assert.equal(chamadas[1].opcoes.method, "PATCH");
    assert.equal(new URL(chamadas[1].url).pathname, "/audios/audio-1");
    assert.deepEqual(JSON.parse(chamadas[1].opcoes.body), { icone: "guitar-electric" });
    assert.deepEqual(JSON.parse(chamadas[2].opcoes.body), { icone: null });
    assert.equal(resposta.audio.icone, null);
  } finally {
    globalThis.fetch = respostaOriginal;
  }
});

test("ambienteService envia o CRUD administrativo com autenticação", async () => {
  const chamadas = [];
  const respostaOriginal = globalThis.fetch;
  globalThis.fetch = async (url, opcoes) => {
    chamadas.push({ url, opcoes });
    return {
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({
        ambientes: [],
        ambiente: {
          idAmbienteSonoro: "ambiente-1",
          publicado: false,
          audios: [],
        },
        mensagem: "Operação realizada.",
      }),
    };
  };

  try {
    const { ambienteService } = await import("../services/sons.service.js");

    await ambienteService.listarAmbientesPreConfigurados("jwt-admin");
    await ambienteService.criarAmbientePreConfigurado("jwt-admin", {
      nome: "Foco",
      idCategoria: "00000000-0000-4000-8000-000000000002",
      audios: [{ idAudio: "audio-1", volume: 60 }],
    });
    await ambienteService.atualizarAmbientePreConfigurado(
      "jwt-admin",
      "ambiente-1",
      { nome: "Foco intenso", audios: [{ idAudio: "audio-1", volume: 70 }] },
    );
    await ambienteService.alterarPublicacaoAmbientePreConfigurado(
      "jwt-admin",
      "ambiente-1",
      true,
    );
    await ambienteService.excluirAmbientePreConfigurado("jwt-admin", "ambiente-1");

    assert.equal(new URL(chamadas[0].url).pathname, "/ambientes-sonoros/pre-configurados");
    assert.equal(chamadas[0].opcoes.method, "GET");
    assert.equal(chamadas[0].opcoes.headers.Authorization, "Bearer jwt-admin");
    assert.equal(chamadas[1].opcoes.method, "POST");
    assert.equal(chamadas[2].opcoes.method, "PATCH");
    assert.deepEqual(JSON.parse(chamadas[2].opcoes.body), {
      nome: "Foco intenso",
      audios: [{ idAudio: "audio-1", volume: 70 }],
    });
    assert.equal(
      new URL(chamadas[3].url).pathname,
      "/ambientes-sonoros/pre-configurados/ambiente-1/publicacao",
    );
    assert.deepEqual(JSON.parse(chamadas[3].opcoes.body), { publicado: true });
    assert.equal(chamadas[4].opcoes.method, "DELETE");
  } finally {
    globalThis.fetch = respostaOriginal;
  }
});

test("ambienteService.obterAmbientePublico consulta endpoint público sem autenticação", async () => {
  const respostaOriginal = globalThis.fetch;
  const payload = {
    ambiente: {
      idAmbienteSonoro: "ambiente-123",
      nome: "Ruído para mascaramento",
      categoria: "Mascaramento",
      audios: [
        { idAudio: "audio-1", titulo: "Ruído branco", arquivo: "https://cdn.example.test/branco.mp3", volume: 70 },
        { idAudio: "audio-2", titulo: "Ventilador", arquivo: "https://cdn.example.test/ventilador.mp3", volume: 50 },
      ],
    },
  };
  let chamada;
  globalThis.fetch = async (url, opcoes) => {
    chamada = { url, opcoes };
    return {
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => payload,
    };
  };

  try {
    const { ambienteService } = await import("../services/sons.service.js");
    const resposta = await ambienteService.obterAmbientePublico("ambiente-123");

    assert.equal(new URL(chamada.url).pathname, "/ambientes-sonoros/publicos/ambiente-123");
    assert.equal(chamada.opcoes.method, "GET");
    assert.equal(chamada.opcoes.headers?.Authorization, undefined);
    assert.deepEqual(resposta, payload);
  } finally {
    globalThis.fetch = respostaOriginal;
  }
});

test("ambienteService.obterAmbiente consulta endpoint autenticado com token", async () => {
  const respostaOriginal = globalThis.fetch;
  const payload = {
    ambiente: {
      idAmbienteSonoro: "ambiente-user-1",
      nome: "Meu Ambiente Personalizado",
      origem: "PERSONALIZADO",
      audios: [
        { idAudio: "audio-1", titulo: "Chuva", arquivo: "https://cdn.example.test/chuva.mp3", volume: 60 },
      ],
    },
  };
  let chamada;
  globalThis.fetch = async (url, opcoes) => {
    chamada = { url, opcoes };
    return {
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => payload,
    };
  };

  try {
    const { ambienteService } = await import("../services/sons.service.js");
    const resposta = await ambienteService.obterAmbiente("jwt-token-user", "ambiente-user-1");

    assert.equal(new URL(chamada.url).pathname, "/ambientes-sonoros/ambiente-user-1");
    assert.equal(chamada.opcoes.method, "GET");
    assert.equal(chamada.opcoes.headers?.Authorization, "Bearer jwt-token-user");
    assert.deepEqual(resposta, payload);
  } finally {
    globalThis.fetch = respostaOriginal;
  }
});
