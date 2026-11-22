import { requisicaoApi } from "./api.js";

function cabecalhosAutenticados(tokenAcesso) {
  return tokenAcesso ? { Authorization: `Bearer ${tokenAcesso}` } : {};
}

export const categoriasService = {
  async listar(tokenAcesso, tipo, incluirInativas = false) {
    const parametros = new URLSearchParams({ tipo });
    if (incluirInativas) parametros.set("incluirInativas", "true");

    return requisicaoApi(`/categorias?${parametros.toString()}`, {
      method: "GET",
      headers: cabecalhosAutenticados(tokenAcesso),
    });
  },

  async criar(tokenAcesso, dados) {
    return requisicaoApi("/categorias", {
      method: "POST",
      headers: cabecalhosAutenticados(tokenAcesso),
      body: JSON.stringify(dados),
    });
  },

  async atualizar(tokenAcesso, idCategoria, dados) {
    return requisicaoApi(`/categorias/${encodeURIComponent(idCategoria)}`, {
      method: "PATCH",
      headers: cabecalhosAutenticados(tokenAcesso),
      body: JSON.stringify(dados),
    });
  },

  async excluir(tokenAcesso, idCategoria) {
    return requisicaoApi(`/categorias/${encodeURIComponent(idCategoria)}`, {
      method: "DELETE",
      headers: cabecalhosAutenticados(tokenAcesso),
    });
  },
};
