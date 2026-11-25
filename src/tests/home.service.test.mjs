import test from "node:test";
import assert from "node:assert/strict";

import { carregarDadosHome } from "../services/home.service.js";

function respostaJson(dados, ok = true) {
  return {
    ok,
    status: ok ? 200 : 500,
    headers: { get: () => "application/json" },
    json: async () => dados,
  };
}

test("carrega recentes, ambientes e coleções pelos três endpoints reais e compartilha consultas concorrentes", async () => {
  const fetchOriginal = globalThis.fetch;
  const chamadas = [];
  const ambienteRecente = {
    idAmbienteSonoro: "ambiente-real",
    nome: "Chuva para foco",
    imagem: "https://cdn.example.test/capa.jpg",
    ultimaReproducao: "2026-11-25T12:00:00.000Z",
    audios: [{ idAudio: "audio-real", titulo: "Chuva", volume: 60 }],
  };

  globalThis.fetch = async (url, opcoes) => {
    const caminho = new URL(url).pathname;
    chamadas.push({ caminho, authorization: opcoes.headers.Authorization });
    if (caminho === "/historico-reproducoes/recentes") {
      return respostaJson({ ambientes: [ambienteRecente] });
    }
    if (caminho === "/ambientes-sonoros") {
      return respostaJson({ ambientes: [{ idAmbienteSonoro: "ambiente-criado" }] });
    }
    if (caminho === "/colecoes") {
      return respostaJson({ colecoes: [{ idColecao: "colecao-real", nome: "Sono", quantidadeAmbientes: 2 }] });
    }
    return respostaJson({}, false);
  };

  try {
    const primeiraConsulta = carregarDadosHome("token-home-real-1");
    const consultaConcorrente = carregarDadosHome("token-home-real-1");
    assert.equal(primeiraConsulta, consultaConcorrente);

    const dados = await primeiraConsulta;
    assert.deepEqual(chamadas.map(({ caminho }) => caminho).sort(), [
      "/ambientes-sonoros",
      "/colecoes",
      "/historico-reproducoes/recentes",
    ]);
    assert.ok(chamadas.every(({ authorization }) => authorization === "Bearer token-home-real-1"));
    assert.equal(dados.recentes.dados[0].nome, "Chuva para foco");
    assert.equal(dados.ambientes.dados.length, 1);
    assert.equal(dados.colecoes.dados[0].quantidadeAmbientes, 2);
    assert.equal(dados.recentes.erro, null);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test("mantém dados disponíveis e erro isolado quando um endpoint falha", async () => {
  const fetchOriginal = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const caminho = new URL(url).pathname;
    if (caminho === "/historico-reproducoes/recentes") return respostaJson({ erro: { mensagem: "indisponível" } }, false);
    if (caminho === "/ambientes-sonoros") return respostaJson({ ambientes: [{ idAmbienteSonoro: "amb-1" }] });
    return respostaJson({ colecoes: [] });
  };

  try {
    const dados = await carregarDadosHome("token-home-real-2");
    assert.equal(dados.recentes.dados.length, 0);
    assert.ok(dados.recentes.erro instanceof Error);
    assert.equal(dados.ambientes.dados.length, 1);
    assert.equal(dados.ambientes.erro, null);
    assert.equal(dados.colecoes.erro, null);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});
