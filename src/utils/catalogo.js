export function filtrarPorCategoria(itens, categoriaSelecionada) {
  if (categoriaSelecionada === "Todos") return itens;
  return itens.filter((item) => item.categoria === categoriaSelecionada);
}

export function obterCategoriasAtivas(resposta) {
  if (
    !Array.isArray(resposta?.categorias) ||
    !resposta.categorias.every(
      (categoria) =>
        typeof categoria?.nome === "string" &&
        typeof categoria.ativa === "boolean",
    )
  ) {
    throw new Error("A resposta da API não contém uma lista válida de categorias.");
  }
  return resposta.categorias
    .filter((categoria) => categoria.ativa)
    .map((categoria) => categoria.nome);
}
