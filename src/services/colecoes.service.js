import { requisicaoApi } from "./api.js";

/**
 * Serviço de integração com os endpoints de coleções da Sonessia API.
 * Suporta operações de listagem, consulta, criação, edição e gestão de ambientes vinculados.
 */
export const colecoesService = {
  /**
   * Lista todas as coleções do usuário autenticado.
   * Endpoint: GET /colecoes
   *
   * @param {string} tokenAcesso - Token JWT do usuário autenticado.
   * @returns {Promise<{ colecoes: Array }>}
   */
  async listarColecoes(tokenAcesso) {
    return requisicaoApi("/colecoes", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenAcesso}`,
      },
    });
  },

  /**
   * Obtém detalhes de uma coleção específica pelo ID.
   * Endpoint: GET /colecoes/:idColecao
   *
   * @param {string} tokenAcesso
   * @param {string} idColecao
   * @returns {Promise<{ colecao: object }>}
   */
  async obterColecao(tokenAcesso, idColecao) {
    return requisicaoApi(`/colecoes/${encodeURIComponent(idColecao)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenAcesso}`,
      },
    });
  },

  /**
   * Cria uma nova coleção.
   * Endpoint: POST /colecoes
   *
   * @param {string} tokenAcesso
   * @param {{ nome: string, descricao?: string }} dados
   * @returns {Promise<{ mensagem: string, colecao: object }>}
   */
  async criarColecao(tokenAcesso, dados) {
    return requisicaoApi("/colecoes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenAcesso}`,
      },
      body: JSON.stringify(dados),
    });
  },

  /**
   * Atualiza nome ou descrição de uma coleção existente.
   * Endpoint: PATCH /colecoes/:idColecao
   *
   * @param {string} tokenAcesso
   * @param {string} idColecao
   * @param {{ nome?: string, descricao?: string }} dados
   * @returns {Promise<{ mensagem: string, colecao: object }>}
   */
  async atualizarColecao(tokenAcesso, idColecao, dados) {
    return requisicaoApi(`/colecoes/${encodeURIComponent(idColecao)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenAcesso}`,
      },
      body: JSON.stringify(dados),
    });
  },

  /**
   * Exclui uma coleção do usuário.
   * Endpoint: DELETE /colecoes/:idColecao
   *
   * @param {string} tokenAcesso
   * @param {string} idColecao
   * @returns {Promise<{ mensagem: string }>}
   */
  async excluirColecao(tokenAcesso, idColecao) {
    return requisicaoApi(`/colecoes/${encodeURIComponent(idColecao)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${tokenAcesso}`,
      },
    });
  },

  /**
   * Adiciona um ambiente sonoro a uma coleção.
   * Endpoint: POST /colecoes/:idColecao/ambientes
   *
   * @param {string} tokenAcesso
   * @param {string} idColecao
   * @param {string} idAmbienteSonoro
   * @returns {Promise<{ mensagem: string, colecao: object }>}
   */
  async adicionarAmbiente(tokenAcesso, idColecao, idAmbienteSonoro) {
    return requisicaoApi(`/colecoes/${encodeURIComponent(idColecao)}/ambientes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenAcesso}`,
      },
      body: JSON.stringify({ idAmbienteSonoro }),
    });
  },

  /**
   * Remove um ambiente sonoro de uma coleção.
   * Endpoint: DELETE /colecoes/:idColecao/ambientes/:idAmbienteSonoro
   *
   * @param {string} tokenAcesso
   * @param {string} idColecao
   * @param {string} idAmbienteSonoro
   * @returns {Promise<{ mensagem: string }>}
   */
  async removerAmbiente(tokenAcesso, idColecao, idAmbienteSonoro) {
    return requisicaoApi(
      `/colecoes/${encodeURIComponent(idColecao)}/ambientes/${encodeURIComponent(idAmbienteSonoro)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${tokenAcesso}`,
        },
      },
    );
  },
};
