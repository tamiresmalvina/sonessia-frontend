export function composicaoNormalizada(audios) {
  if (!Array.isArray(audios)) return [];

  return audios
    .map((item) => ({
      idAudio: item.idAudio,
      volume: item.volume,
    }))
    .sort((a, b) => {
      const porId = String(a.idAudio).localeCompare(String(b.idAudio));
      return porId !== 0 ? porId : a.volume - b.volume;
    });
}

export function composicoesIguais(primeira, segunda) {
  if (!Array.isArray(primeira) || !Array.isArray(segunda)) return false;
  if (primeira.length !== segunda.length) return false;

  const normalizadaPrimeira = composicaoNormalizada(primeira);
  const normalizadaSegunda = composicaoNormalizada(segunda);

  return normalizadaPrimeira.every((item, indice) =>
    item.idAudio === normalizadaSegunda[indice].idAudio &&
    item.volume === normalizadaSegunda[indice].volume,
  );
}

export function ambienteDuplicado(candidato, ambientes, idIgnorado) {
  if (!Array.isArray(ambientes)) return false;

  const nomeCandidato = typeof candidato?.nome === "string"
    ? candidato.nome.trim()
    : "";

  return ambientes.some((ambiente) => {
    if (idIgnorado && ambiente.idAmbienteSonoro === idIgnorado) return false;

    const nomeAmbiente = typeof ambiente?.nome === "string"
      ? ambiente.nome.trim()
      : "";

    return nomeAmbiente === nomeCandidato &&
      composicoesIguais(candidato.audios, ambiente.audios);
  });
}
