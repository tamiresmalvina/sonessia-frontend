const CORES_CATEGORIAS = {
  Natureza: "var(--cyan)",
  Instrumental: "var(--violet)",
  Ambiente: "var(--pink)",
  Ruído: "var(--blue)",
  Ruídos: "var(--blue)",
};

export function obterCorCategoria(nomeCategoria) {
  return CORES_CATEGORIAS[nomeCategoria] || "var(--color-accent)";
}
