import test from "node:test";
import assert from "node:assert/strict";

test("categoriasService usa os contratos do CRUD e envia o token Bearer", async () => {
  const chamadas = [];
  const respostas = [
    { categorias: [{ idCategoria: "categoria-1", nome: "Natureza", tipo: "AUDIO", ativa: true }] },
    { mensagem: "Categoria criada com sucesso.", categoria: { idCategoria: "categoria-2", nome: "Foco", tipo: "AMBIENTE", ativa: true } },
    { mensagem: "Categoria atualizada com sucesso.", categoria: { idCategoria: "categoria-2", nome: "Foco leve", tipo: "AMBIENTE", ativa: false } },
    { mensagem: "Categoria excluída com sucesso." },
  ];
  const fetchOriginal = globalThis.fetch;
  globalThis.fetch = async (url, opcoes) => {
    chamadas.push({ url, opcoes });
    const dados = respostas.shift();
    return {
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => dados,
    };
  };

  try {
    const { categoriasService } = await import("../services/categorias.service.js");
    const listagem = await categoriasService.listar("jwt-admin", "AUDIO", true);
    const criacao = await categoriasService.criar("jwt-admin", {
      nome: "Foco",
      tipo: "AMBIENTE",
    });
    const atualizacao = await categoriasService.atualizar("jwt-admin", "categoria-2", {
      ativa: false,
    });
    const exclusao = await categoriasService.excluir("jwt-admin", "categoria-2");

    assert.deepEqual(listagem.categorias[0], {
      idCategoria: "categoria-1",
      nome: "Natureza",
      tipo: "AUDIO",
      ativa: true,
    });
    assert.equal(new URL(chamadas[0].url).searchParams.get("tipo"), "AUDIO");
    assert.equal(new URL(chamadas[0].url).searchParams.get("incluirInativas"), "true");
    assert.equal(chamadas[0].opcoes.method, "GET");

    assert.deepEqual(JSON.parse(chamadas[1].opcoes.body), {
      nome: "Foco",
      tipo: "AMBIENTE",
    });
    assert.deepEqual(JSON.parse(chamadas[2].opcoes.body), { ativa: false });
    assert.equal(chamadas[1].opcoes.method, "POST");
    assert.equal(chamadas[2].opcoes.method, "PATCH");
    assert.equal(chamadas[3].opcoes.method, "DELETE");
    assert.equal(criacao.categoria.tipo, "AMBIENTE");
    assert.equal(atualizacao.categoria.ativa, false);
    assert.equal(exclusao.mensagem, "Categoria excluída com sucesso.");

    for (const chamada of chamadas) {
      assert.equal(chamada.opcoes.headers.Authorization, "Bearer jwt-admin");
      assert.equal(chamada.opcoes.credentials, "include");
    }
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test("categoriasService preserva o código e a mensagem de erro da API", async () => {
  const fetchOriginal = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 409,
    headers: { get: () => "application/json" },
    json: async () => ({
      erro: {
        codigo: "CATEGORIA_POSSUI_ASSOCIACOES",
        mensagem: "A categoria está vinculada a áudios ou ambientes sonoros.",
        detalhes: [],
      },
    }),
  });

  try {
    const { categoriasService } = await import("../services/categorias.service.js");
    await assert.rejects(
      categoriasService.excluir("jwt-admin", "categoria-vinculada"),
      (erro) => {
        assert.equal(erro.status, 409);
        assert.equal(erro.codigo, "CATEGORIA_POSSUI_ASSOCIACOES");
        assert.match(erro.message, /vinculada a áudios/);
        return true;
      },
    );
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test("categoriasService lista categorias públicas sem token nem parâmetro de inativas", async () => {
  const fetchOriginal = globalThis.fetch;
  let chamada;
  globalThis.fetch = async (url, opcoes) => {
    chamada = { url, opcoes };
    return {
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({ categorias: [] }),
    };
  };

  try {
    const { categoriasService } = await import("../services/categorias.service.js");
    const resposta = await categoriasService.listar(null, "AMBIENTE");
    const url = new URL(chamada.url);

    assert.deepEqual(resposta.categorias, []);
    assert.equal(url.pathname, "/categorias");
    assert.equal(url.searchParams.get("tipo"), "AMBIENTE");
    assert.equal(url.searchParams.has("incluirInativas"), false);
    assert.equal(chamada.opcoes.headers.Authorization, undefined);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});
