/**
 * Inicia uma composição e registra o ambiente em segundo plano somente após
 * confirmação de sucesso do controlador. Chamadas equivalentes concorrentes
 * compartilham o mesmo registro pendente.
 */
export async function iniciarReproducaoComHistorico({
  iniciar,
  registrar,
  token,
  idAmbienteSonoro,
  chaveSessao,
  sessaoVigente,
  registrosPendentes,
}) {
  const iniciou = await iniciar();
  if (!iniciou || !token || !sessaoVigente()) return iniciou;

  const chave = `${chaveSessao}:${idAmbienteSonoro}`;
  if (!registrosPendentes.has(chave)) {
    const chamada = Promise.resolve()
      .then(() => registrar(token, idAmbienteSonoro))
      .catch(() => undefined)
      .finally(() => registrosPendentes.delete(chave));
    registrosPendentes.set(chave, chamada);
  }

  return iniciou;
}
