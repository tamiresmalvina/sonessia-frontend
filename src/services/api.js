const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:3000";

/**
 * Utilitário centralizado para requisições HTTP à API da Sonessia.
 * Inclui credentials: 'include' para suporte aos cookies de sessão (refreshToken).
 *
 * @param {string} caminho - Caminho relativo do endpoint (ex: '/autenticacao/login').
 * @param {RequestInit} [opcoes] - Opções padrão do fetch.
 * @returns {Promise<any>}
 */
export async function requisicaoApi(caminho, opcoes = {}) {
  const url = `${BASE_URL}${caminho}`;
  const ehMultipart =
    typeof FormData !== "undefined" && opcoes.body instanceof FormData;

  const headers = {
    ...(!ehMultipart ? { "Content-Type": "application/json" } : {}),
    ...(opcoes.headers || {}),
  };

  const configuracao = {
    ...opcoes,
    headers,
    credentials: "include",
  };

  let resposta;
  try {
    resposta = await fetch(url, configuracao);
  } catch (erro) {
    throw new Error(
      "Não foi possível conectar ao servidor da API. Verifique sua conexão.",
      {
        cause: erro,
      },
    );
  }

  let dados = null;
  const contentType = resposta.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    dados = await resposta.json();
  }

  if (!resposta.ok) {
    let mensagemErro = dados?.erro?.mensagem;

    if (
      !mensagemErro &&
      dados?.erro?.detalhes &&
      dados.erro.detalhes.length > 0
    ) {
      mensagemErro = dados.erro.detalhes
        .map((detalhe) => detalhe.mensagem)
        .join(" ");
    }

    if (!mensagemErro) {
      mensagemErro = "Ocorreu um erro ao processar a requisição.";
    }

    const erro = new Error(mensagemErro);
    erro.status = resposta.status;
    erro.codigo = dados?.erro?.codigo;
    erro.detalhes = dados?.erro?.detalhes || [];
    throw erro;
  }

  return dados;
}
