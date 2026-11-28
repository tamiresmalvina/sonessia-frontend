const CHAVE_STORAGE_TOKEN = "sonessia_token";
const CHAVE_STORAGE_USUARIO = "sonessia_usuario";
const CHAVE_STORAGE_LEMBRAR_ME = "sonessia_lembrar_me";
const ouvintes = new Set();

function publicarSessao(sessao) {
  for (const ouvinte of ouvintes) ouvinte(sessao);
}

export function obterTokenArmazenado() {
  try {
    return (
      localStorage.getItem(CHAVE_STORAGE_TOKEN) ||
      sessionStorage.getItem(CHAVE_STORAGE_TOKEN) ||
      null
    );
  } catch {
    return null;
  }
}

export function obterUsuarioArmazenado() {
  try {
    const salvo =
      localStorage.getItem(CHAVE_STORAGE_USUARIO) ||
      sessionStorage.getItem(CHAVE_STORAGE_USUARIO);
    return salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
}

export function ehSessaoPersistente() {
  try {
    return localStorage.getItem(CHAVE_STORAGE_LEMBRAR_ME) === "true";
  } catch {
    return false;
  }
}

export function salvarAutenticacao(token, usuario, lembrarMe) {
  try {
    if (lembrarMe) {
      localStorage.setItem(CHAVE_STORAGE_TOKEN, token);
      localStorage.setItem(CHAVE_STORAGE_USUARIO, JSON.stringify(usuario));
      localStorage.setItem(CHAVE_STORAGE_LEMBRAR_ME, "true");
      sessionStorage.removeItem(CHAVE_STORAGE_TOKEN);
      sessionStorage.removeItem(CHAVE_STORAGE_USUARIO);
    } else {
      sessionStorage.setItem(CHAVE_STORAGE_TOKEN, token);
      sessionStorage.setItem(CHAVE_STORAGE_USUARIO, JSON.stringify(usuario));
      localStorage.removeItem(CHAVE_STORAGE_TOKEN);
      localStorage.removeItem(CHAVE_STORAGE_USUARIO);
      localStorage.removeItem(CHAVE_STORAGE_LEMBRAR_ME);
    }
  } catch {
    // Mantém o comportamento atual quando o navegador restringe armazenamento.
  }
  publicarSessao({ token, usuario });
}

export function limparAutenticacao() {
  try {
    localStorage.removeItem(CHAVE_STORAGE_TOKEN);
    localStorage.removeItem(CHAVE_STORAGE_USUARIO);
    localStorage.removeItem(CHAVE_STORAGE_LEMBRAR_ME);
    sessionStorage.removeItem(CHAVE_STORAGE_TOKEN);
    sessionStorage.removeItem(CHAVE_STORAGE_USUARIO);
  } catch {
    // Mantém o comportamento atual quando o navegador restringe armazenamento.
  }
  publicarSessao({ token: null, usuario: null });
}

export function inscreverMudancasSessao(ouvinte) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}
