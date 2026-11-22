import { requisicaoApi } from './api.js';

/**
 * Serviço de áudios da API Sonessia.
 * Endpoint público: GET /audios
 */
export const audioService = {
  /**
   * Lista todos os áudios cadastrados (público, sem autenticação).
   * Retorna: { audios: Array<{ id, titulo, descricao, categoria, fonte, licenca, urlArquivo, duracao }> }
   *
   * @returns {Promise<{ audios: Array }>}
   */
  async listarAudios() {
    return requisicaoApi('/audios', { method: 'GET' });
  },

  /**
   * Obtém detalhes de um áudio específico.
   * @param {string} idAudio
   * @returns {Promise<{ audio: object }>}
   */
  async obterAudio(idAudio) {
    return requisicaoApi(`/audios/${idAudio}`, { method: 'GET' });
  },

  async criarAudio(tokenAcesso, metadados, arquivo) {
    const formulario = new FormData();
    formulario.append("metadados", JSON.stringify(metadados));
    formulario.append("arquivo", arquivo, arquivo.name);

    return requisicaoApi("/audios", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenAcesso}` },
      body: formulario,
    });
  },

  async atualizarAudio(tokenAcesso, idAudio, metadados) {
    return requisicaoApi(`/audios/${encodeURIComponent(idAudio)}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${tokenAcesso}` },
      body: JSON.stringify(metadados),
    });
  },
};

/**
 * Serviço de ambientes sonoros da API Sonessia.
 */
export const ambienteService = {
  /**
   * Cria um novo ambiente sonoro (autenticado).
   * Endpoint: POST /ambientes-sonoros
   *
   * @param {string} tokenAcesso
   * @param {{ nome: string, descricao?: string | null, finalidade: string, audios: Array<{ idAudio: string, volume: number }> }} dados
   * @returns {Promise<{ mensagem: string, ambienteSonoro: object }>}
   */
  async criarAmbiente(tokenAcesso, dados) {
    return requisicaoApi('/ambientes-sonoros', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAcesso}` },
      body: JSON.stringify(dados),
    });
  },

  /**
   * Lista os ambientes sonoros do usuário autenticado.
   * @param {string} tokenAcesso
   * @returns {Promise<{ ambientesSonoros: Array }>}
   */
  async listarAmbientes(tokenAcesso) {
    return requisicaoApi('/ambientes-sonoros', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenAcesso}` },
    });
  },

  /**
   * Lista os ambientes pré-configurados públicos.
   * @returns {Promise<{ ambientesSonoros: Array }>}
   */
  async listarAmbientesPublicos() {
    return requisicaoApi('/ambientes-sonoros/publicos', { method: 'GET' });
  },
};
