export function criarFormularioEdicaoAudio(audio) {
  return {
    titulo: audio.titulo || "",
    tituloOriginal: audio.tituloOriginal || "",
    categoria: audio.categoria || "",
    fonte: audio.fonte || "",
    licenca: audio.licenca || "",
    descricao: audio.descricao || "",
    icone: audio.icone || "",
    arquivo: null,
  };
}
