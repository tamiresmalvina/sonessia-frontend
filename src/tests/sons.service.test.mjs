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
