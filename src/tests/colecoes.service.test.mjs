import test from "node:test";
import assert from "node:assert/strict";

test("colecoesService.listarColecoes envia token Bearer e retorna envelope da API", async () => {
  let urlChamada = "";
  let headersRecebidos = {};

  const mockFetch = async (url, opcoes) => {
    urlChamada = url;
    headersRecebidos = opcoes.headers;
    return {
      ok: true,
      status: 200,
      headers: {
        get: (h) => (h.toLowerCase() === "content-type" ? "application/json" : null),
      },
      json: async () => ({
        colecoes: [
          {
            idColecao: "c1",
            nome: "Para dormir",
            descricao: "Sons relaxantes",
            quantidadeAmbientes: 2,
            ambientes: [],
          },
        ],
      }),
    };
  };

  const respostaOriginal = globalThis.fetch;
  globalThis.fetch = mockFetch;
  try {
    const { colecoesService } = await import("../services/colecoes.service.js");
    const resposta = await colecoesService.listarColecoes("token_teste");

    assert.equal(urlChamada, "http://localhost:3000/colecoes");
    assert.equal(headersRecebidos.Authorization, "Bearer token_teste");
    assert.equal(Array.isArray(resposta.colecoes), true);
    assert.equal(resposta.colecoes.length, 1);
    assert.equal(resposta.colecoes[0].idColecao, "c1");
    assert.equal(resposta.colecoes[0].nome, "Para dormir");
    assert.equal(resposta.colecoes[0].quantidadeAmbientes, 2);
  } finally {
    globalThis.fetch = respostaOriginal;
  }
});

test("colecoesService.criarColecao envia POST com token e payload correto", async () => {
  let urlChamada = "";
  let opcoesRecebidas = {};

  const mockFetch = async (url, opcoes) => {
    urlChamada = url;
    opcoesRecebidas = opcoes;
    return {
      ok: true,
      status: 201,
      headers: {
        get: (h) => (h.toLowerCase() === "content-type" ? "application/json" : null),
      },
      json: async () => ({
        mensagem: "Coleção criada com sucesso.",
        colecao: {
          idColecao: "nova-colecao-uuid",
          nome: "Foco Total",
          descricao: "Ambientes para concentração",
          quantidadeAmbientes: 0,
          ambientes: [],
        },
      }),
    };
  };

  const respostaOriginal = globalThis.fetch;
  globalThis.fetch = mockFetch;
  try {
    const { colecoesService } = await import("../services/colecoes.service.js");
    const payloadEnvio = {
      nome: "Foco Total",
      descricao: "Ambientes para concentração",
    };
    const resposta = await colecoesService.criarColecao("token_teste", payloadEnvio);

    assert.equal(urlChamada, "http://localhost:3000/colecoes");
    assert.equal(opcoesRecebidas.method, "POST");
    assert.equal(opcoesRecebidas.headers.Authorization, "Bearer token_teste");
    assert.deepEqual(JSON.parse(opcoesRecebidas.body), payloadEnvio);
    assert.equal(resposta.colecao.idColecao, "nova-colecao-uuid");
    assert.equal(resposta.colecao.nome, "Foco Total");
    assert.equal(resposta.colecao.quantidadeAmbientes, 0);
  } finally {
    globalThis.fetch = respostaOriginal;
  }
});

test("colecoesService.criarColecao trata erro da API e propaga mensagem", async () => {
  const mockFetch = async () => {
    return {
      ok: false,
      status: 400,
      headers: {
        get: (h) => (h.toLowerCase() === "content-type" ? "application/json" : null),
      },
      json: async () => ({
        erro: {
          codigo: "DADOS_INVALIDOS",
          mensagem: "O nome da coleção é obrigatório.",
        },
      }),
    };
  };

  const respostaOriginal = globalThis.fetch;
  globalThis.fetch = mockFetch;
  try {
    const { colecoesService } = await import("../services/colecoes.service.js");
    await assert.rejects(
      async () => colecoesService.criarColecao("token_teste", { nome: "" }),
      /O nome da coleção é obrigatório/
    );
  } finally {
    globalThis.fetch = respostaOriginal;
  }
});

test("colecoesService.criarColecao aceita descricao nula", async () => {
  let corpoRecebido = null;

  const mockFetch = async (_url, opcoes) => {
    corpoRecebido = JSON.parse(opcoes.body);
    return {
      ok: true,
      status: 201,
      headers: {
        get: (h) => (h.toLowerCase() === "content-type" ? "application/json" : null),
      },
      json: async () => ({
        mensagem: "Coleção criada com sucesso.",
        colecao: {
          idColecao: "c-sem-desc",
          nome: "Sem Descrição",
          descricao: null,
          quantidadeAmbientes: 0,
          ambientes: [],
        },
      }),
    };
  };

  const respostaOriginal = globalThis.fetch;
  globalThis.fetch = mockFetch;
  try {
    const { colecoesService } = await import("../services/colecoes.service.js");
    const resposta = await colecoesService.criarColecao("token_teste", {
      nome: "Sem Descrição",
      descricao: null,
    });

    assert.equal(corpoRecebido.nome, "Sem Descrição");
    assert.equal(corpoRecebido.descricao, null);
    assert.equal(resposta.colecao.descricao, null);
  } finally {
    globalThis.fetch = respostaOriginal;
  }
});

test("colecoesService.obterColecao envia GET com token e idColecao", async () => {
  let urlChamada = null;
  let opcoesRecebidas = null;

  const mockFetch = async (url, opcoes) => {
    urlChamada = url;
    opcoesRecebidas = opcoes;
    return {
      ok: true,
      status: 200,
      headers: {
        get: (h) => (h.toLowerCase() === "content-type" ? "application/json" : null),
      },
      json: async () => ({
        colecao: {
          idColecao: "c-123",
          nome: "Coleção Teste",
          descricao: "Desc",
          quantidadeAmbientes: 1,
          ambientes: [
            {
              idAmbienteSonoro: "a-1",
              nome: "Chuva Suave",
              audios: [],
            },
          ],
        },
      }),
    };
  };

  const respostaOriginal = globalThis.fetch;
  globalThis.fetch = mockFetch;
  try {
    const { colecoesService } = await import("../services/colecoes.service.js");
    const resposta = await colecoesService.obterColecao("token_teste", "c-123");

    assert.equal(urlChamada, "http://localhost:3000/colecoes/c-123");
    assert.equal(opcoesRecebidas.method, "GET");
    assert.equal(opcoesRecebidas.headers.Authorization, "Bearer token_teste");
    assert.equal(resposta.colecao.idColecao, "c-123");
    assert.equal(resposta.colecao.ambientes.length, 1);
  } finally {
    globalThis.fetch = respostaOriginal;
  }
});

test("colecoesService.adicionarAmbiente envia POST com payload correto", async () => {
  let urlChamada = null;
  let opcoesRecebidas = null;

  const mockFetch = async (url, opcoes) => {
    urlChamada = url;
    opcoesRecebidas = opcoes;
    return {
      ok: true,
      status: 201,
      headers: {
        get: (h) => (h.toLowerCase() === "content-type" ? "application/json" : null),
      },
      json: async () => ({
        mensagem: "Ambiente sonoro adicionado à coleção com sucesso.",
        colecao: {
          idColecao: "c-123",
          nome: "Coleção Teste",
          quantidadeAmbientes: 1,
          ambientes: [{ idAmbienteSonoro: "amb-456" }],
        },
      }),
    };
  };

  const respostaOriginal = globalThis.fetch;
  globalThis.fetch = mockFetch;
  try {
    const { colecoesService } = await import("../services/colecoes.service.js");
    const resposta = await colecoesService.adicionarAmbiente("token_teste", "c-123", "amb-456");

    assert.equal(urlChamada, "http://localhost:3000/colecoes/c-123/ambientes");
    assert.equal(opcoesRecebidas.method, "POST");
    assert.equal(opcoesRecebidas.headers.Authorization, "Bearer token_teste");
    assert.deepEqual(JSON.parse(opcoesRecebidas.body), { idAmbienteSonoro: "amb-456" });
    assert.equal(resposta.mensagem, "Ambiente sonoro adicionado à coleção com sucesso.");
  } finally {
    globalThis.fetch = respostaOriginal;
  }
});
