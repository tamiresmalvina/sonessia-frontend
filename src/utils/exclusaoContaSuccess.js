const CHAVE_ESTADO_EXCLUSAO = "sonessia_exclusao_conta_saida";
const DURACAO_ESPERA_LOGOUT_MS = 30_000;
const EVENTO_ESTADO_EXCLUSAO = "sonessia-exclusao-conta-saida";
let estadoEmMemoria = null;

export function calcularSegundosRestantes(prazo, agora) {
  return Math.max(0, Math.ceil((prazo - agora) / 1000));
}

export function iniciarEsperaLogoutExclusao(exclusaoDefinitivaEm, agora = Date.now()) {
  const existente = obterEsperaLogoutExclusao();
  if (existente) return existente;

  const data = typeof exclusaoDefinitivaEm === "string" &&
    !Number.isNaN(new Date(exclusaoDefinitivaEm).getTime())
    ? new Date(exclusaoDefinitivaEm).toISOString()
    : null;
  const estado = { prazoLogoutEm: agora + DURACAO_ESPERA_LOGOUT_MS, exclusaoDefinitivaEm: data };
  estadoEmMemoria = estado;
  try {
    window.localStorage.setItem(CHAVE_ESTADO_EXCLUSAO, JSON.stringify(estado));
    window.dispatchEvent(new Event(EVENTO_ESTADO_EXCLUSAO));
  } catch {
    // O fluxo atual continua em memória quando o navegador bloqueia o armazenamento.
  }
  return estado;
}

export function obterEsperaLogoutExclusao() {
  try {
    const bruto = window.localStorage.getItem(CHAVE_ESTADO_EXCLUSAO);
    if (!bruto) return estadoEmMemoria;
    const estado = JSON.parse(bruto);
    if (!Number.isFinite(estado?.prazoLogoutEm)) return null;
    return {
      prazoLogoutEm: estado.prazoLogoutEm,
      exclusaoDefinitivaEm: typeof estado.exclusaoDefinitivaEm === "string"
        ? estado.exclusaoDefinitivaEm
        : null,
    };
  } catch {
    return estadoEmMemoria;
  }
}

export function obterMarcadorEsperaLogoutExclusao() {
  try {
    return window.localStorage.getItem(CHAVE_ESTADO_EXCLUSAO) ||
      (estadoEmMemoria ? JSON.stringify(estadoEmMemoria) : "");
  } catch {
    return estadoEmMemoria ? JSON.stringify(estadoEmMemoria) : "";
  }
}

export function assinarEsperaLogoutExclusao(notificar) {
  window.addEventListener("storage", notificar);
  window.addEventListener(EVENTO_ESTADO_EXCLUSAO, notificar);
  return () => {
    window.removeEventListener("storage", notificar);
    window.removeEventListener(EVENTO_ESTADO_EXCLUSAO, notificar);
  };
}

export function limparEsperaLogoutExclusao() {
  estadoEmMemoria = null;
  try {
    window.localStorage.removeItem(CHAVE_ESTADO_EXCLUSAO);
    window.dispatchEvent(new Event(EVENTO_ESTADO_EXCLUSAO));
  } catch {
    // O logout local do AuthContext também será executado se o armazenamento falhar.
  }
}
