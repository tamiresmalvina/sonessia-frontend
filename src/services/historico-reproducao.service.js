import { requisicaoApi } from "./api.js";

export const historicoReproducaoService = {
  async registrar(tokenAcesso, idAmbienteSonoro) {
    return requisicaoApi("/historico-reproducoes", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenAcesso}` },
      body: JSON.stringify({ idAmbienteSonoro }),
    });
  },

  async listarRecentes(tokenAcesso) {
    return requisicaoApi("/historico-reproducoes/recentes", {
      method: "GET",
      headers: { Authorization: `Bearer ${tokenAcesso}` },
    });
  },
};
