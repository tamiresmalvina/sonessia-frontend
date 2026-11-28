import {
  ehSessaoPersistente,
  limparAutenticacao,
  obterTokenArmazenado,
  salvarAutenticacao,
} from "./auth-session.js";

const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:3000";
const CAMINHO_RENOVACAO = "/autenticacao/renovar-sessao";
let renovacaoEmAndamento = null;

function ehRotaRenovacao(url) {
  return new URL(url, globalThis.location?.origin || "http://localhost").pathname.endsWith(
    CAMINHO_RENOVACAO,
  );
}

function obterTokenCabecalho(headers) {
  if (headers && typeof headers.get === "function") {
    const authorization = headers.get("Authorization");
    return authorization?.match(/^Bearer\s+(.+)$/i)?.[1] || null;
  }

  const authorization = Object.entries(headers || {}).find(
    ([nome]) => nome.toLowerCase() === "authorization",
  )?.[1];
  return typeof authorization === "string"
    ? authorization.match(/^Bearer\s+(.+)$/i)?.[1] || null
    : null;
}

function definirTokenCabecalho(headers, token) {
  const resultado = Object.fromEntries(
    Object.entries(headers || {}).filter(([nome]) => nome.toLowerCase() !== "authorization"),
  );
  if (token) resultado.Authorization = `Bearer ${token}`;
  return resultado;
}

function corpoPodeSerReutilizado(body) {
  if (body == null || typeof body === "string") return true;
  if (typeof Blob !== "undefined" && body instanceof Blob) return true;
  if (typeof FormData !== "undefined" && body instanceof FormData) return true;
  if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) return true;
  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) return true;
  return false;
}

async function lerResposta(resposta, responseType) {
  let dados = null;
  const contentType = resposta.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    dados = await resposta.json();
  }

  if (!resposta.ok) {
    let mensagemErro = dados?.erro?.mensagem;
    if (!mensagemErro && dados?.erro?.detalhes?.length) {
      mensagemErro = dados.erro.detalhes
        .map((detalhe) => detalhe.mensagem)
        .join(" ");
    }
    if (!mensagemErro) mensagemErro = "Ocorreu um erro ao processar a requisição.";

    const erro = new Error(mensagemErro);
    erro.status = resposta.status;
    erro.codigo = dados?.erro?.codigo;
    erro.detalhes = dados?.erro?.detalhes || [];
    throw erro;
  }

  if (responseType === "blob") return resposta.blob();
  return dados;
}

async function renovarSessao() {
  const resposta = await fetch(`${BASE_URL}${CAMINHO_RENOVACAO}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lembrarMe: ehSessaoPersistente() }),
    credentials: "include",
  });

  if (!resposta.ok) return null;

  const dados = await resposta.json();
  if (!dados?.tokenAcesso || !dados?.usuario) return null;

  salvarAutenticacao(dados.tokenAcesso, dados.usuario, ehSessaoPersistente());
  return dados.tokenAcesso;
}

function obterTokenRenovado(tokenEsperado) {
  if (!renovacaoEmAndamento) {
    const renovarSeNecessario = async () => {
      // Web Locks compartilha a renovação entre abas do mesmo navegador.
      // Outra aba pode já ter rotacionado o cookie e atualizado o storage.
      const tokenAtual = obterTokenArmazenado();
      if (tokenAtual && tokenAtual !== tokenEsperado) return tokenAtual;
      return renovarSessao();
    };
    const locks = globalThis.navigator?.locks;
    const tentativa = locks?.request
      ? locks.request("sonessia-refresh-session", renovarSeNecessario)
      : renovarSeNecessario();

    renovacaoEmAndamento = tentativa
      .catch(() => null)
      .finally(() => {
        renovacaoEmAndamento = null;
      });
  }
  return renovacaoEmAndamento;
}

function notificarSessaoExpirada() {
  limparAutenticacao();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("sonessia:auth-expired"));
  }
}

/** Cliente HTTP centralizado. Renova uma vez e compartilha o refresh entre chamadas concorrentes. */
export async function requisicaoApi(caminho, opcoes = {}) {
  const url = `${BASE_URL}${caminho}`;
  const { responseType, ...opcoesFetch } = opcoes;
  const ehMultipart =
    typeof FormData !== "undefined" && opcoesFetch.body instanceof FormData;
  const headers = {
    ...(!ehMultipart ? { "Content-Type": "application/json" } : {}),
    ...(opcoesFetch.headers || {}),
  };
  const tokenEnviado = obterTokenCabecalho(headers);
  const tokenAtual = obterTokenArmazenado();
  const tokenInicialEfetivo = tokenAtual || tokenEnviado;
  const configuracao = {
    ...opcoesFetch,
    headers: tokenAtual ? definirTokenCabecalho(headers, tokenAtual) : headers,
    credentials: "include",
  };

  let resposta;
  try {
    resposta = await fetch(url, configuracao);
  } catch (erro) {
    throw new Error(
      "Não foi possível conectar ao servidor da API. Verifique sua conexão.",
      { cause: erro },
    );
  }

  if (
    resposta.status === 401 &&
    tokenEnviado &&
    !ehRotaRenovacao(url) &&
    corpoPodeSerReutilizado(opcoesFetch.body)
  ) {
    let novoToken = obterTokenArmazenado();

    // Outra chamada pode já ter renovado o token antes deste 401 chegar.
    if (!novoToken || novoToken === tokenInicialEfetivo) {
      novoToken = await obterTokenRenovado(tokenInicialEfetivo);
    }

    if (!novoToken) {
      notificarSessaoExpirada();
      return lerResposta(resposta, responseType);
    }

    const configuracaoRepetida = {
      ...opcoesFetch,
      headers: definirTokenCabecalho(headers, novoToken),
      credentials: "include",
    };

    try {
      resposta = await fetch(url, configuracaoRepetida);
    } catch (erro) {
      throw new Error(
        "Não foi possível conectar ao servidor da API. Verifique sua conexão.",
        { cause: erro },
      );
    }

    if (resposta.status === 401) {
      notificarSessaoExpirada();
    }
  }

  return lerResposta(resposta, responseType);
}
