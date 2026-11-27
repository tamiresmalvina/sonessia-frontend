const CHAVE_PRAZO_SAIDA_EMAIL = "sonessia_email_alterado_prazo_saida";

export function calcularSegundosRestantes(prazo, agora) {
  return Math.max(0, Math.ceil((prazo - agora) / 1000));
}

export function iniciarPrazoSaidaEmail(prazo) {
  try {
    window.localStorage.setItem(CHAVE_PRAZO_SAIDA_EMAIL, String(prazo));
    window.dispatchEvent(new Event("sonessia-email-alterado-prazo"));
  } catch {
    // A tela continua funcionando na sessão atual se o armazenamento estiver bloqueado.
  }
}

export function obterPrazoSaidaEmail() {
  try {
    const valor = window.localStorage.getItem(CHAVE_PRAZO_SAIDA_EMAIL);
    if (!valor) return null;
    const prazo = Number(valor);
    return Number.isFinite(prazo) ? prazo : null;
  } catch {
    return null;
  }
}

export function obterMarcadorPrazoSaidaEmail() {
  try {
    return window.localStorage.getItem(CHAVE_PRAZO_SAIDA_EMAIL) || "";
  } catch {
    return "";
  }
}

export function assinarPrazoSaidaEmail(notificar) {
  window.addEventListener("storage", notificar);
  window.addEventListener("sonessia-email-alterado-prazo", notificar);
  return () => {
    window.removeEventListener("storage", notificar);
    window.removeEventListener("sonessia-email-alterado-prazo", notificar);
  };
}

export function limparPrazoSaidaEmail() {
  try {
    window.localStorage.removeItem(CHAVE_PRAZO_SAIDA_EMAIL);
    window.dispatchEvent(new Event("sonessia-email-alterado-prazo"));
  } catch {
    // O logout ainda limpa o estado em memória quando o armazenamento estiver bloqueado.
  }
}
