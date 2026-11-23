import { requisicaoApi } from './api.js';

/**
 * Serviço de áudios da API Sonessia.
 * Endpoint público: GET /audios
 */
export const audioService = {
  /**
   * Lista todos os áudios cadastrados (público, sem autenticação).
   * Retorna DTOs com idAudio, titulo, descricao, categoria, icone, arquivo,
   * tituloOriginal, fonte e licenca.
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

  async excluirAudio(tokenAcesso, idAudio) {
    return requisicaoApi(`/audios/${encodeURIComponent(idAudio)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${tokenAcesso}` },
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
   * Retorna { ambientes: Array } com os áudios associados por idAudio.
   * @returns {Promise<{ ambientes: Array }>}
   */
  async listarAmbientesPublicos() {
    return requisicaoApi('/ambientes-sonoros/publicos', { method: 'GET' });
  },

  async listarAmbientesPreConfigurados(tokenAcesso, filtros = {}) {
    const parametros = new URLSearchParams();
    if (filtros.finalidade) parametros.set("finalidade", filtros.finalidade);
    if (typeof filtros.publicado === "boolean") {
      parametros.set("publicado", String(filtros.publicado));
    }
    const consulta = parametros.toString();
    return requisicaoApi(`/ambientes-sonoros/pre-configurados${consulta ? `?${consulta}` : ""}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${tokenAcesso}` },
    });
  },

  async obterAmbientePreConfigurado(tokenAcesso, idAmbienteSonoro) {
    return requisicaoApi(
      `/ambientes-sonoros/pre-configurados/${encodeURIComponent(idAmbienteSonoro)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${tokenAcesso}` },
      },
    );
  },

  async criarAmbientePreConfigurado(tokenAcesso, dados) {
    return requisicaoApi("/ambientes-sonoros/pre-configurados", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenAcesso}` },
      body: JSON.stringify(dados),
    });
  },

  async criarAmbientePreConfiguradoComImagem(tokenAcesso, dados, arquivoImagem) {
    const formulario = new FormData();
    formulario.append("metadados", JSON.stringify(dados));
    formulario.append("imagem", arquivoImagem, arquivoImagem.name);
    return requisicaoApi("/ambientes-sonoros/pre-configurados", {
      method: "POST",
      headers: { Authorization: `Bearer ${tokenAcesso}` },
      body: formulario,
    });
  },

  async atualizarAmbientePreConfigurado(tokenAcesso, idAmbienteSonoro, dados) {
    return requisicaoApi(
      `/ambientes-sonoros/pre-configurados/${encodeURIComponent(idAmbienteSonoro)}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${tokenAcesso}` },
        body: JSON.stringify(dados),
      },
    );
  },

  async atualizarAmbientePreConfiguradoComImagem(tokenAcesso, idAmbienteSonoro, dados, arquivoImagem) {
    const formulario = new FormData();
    formulario.append("metadados", JSON.stringify(dados));
    if (arquivoImagem) {
      formulario.append("imagem", arquivoImagem, arquivoImagem.name);
    }
    return requisicaoApi(
      `/ambientes-sonoros/pre-configurados/${encodeURIComponent(idAmbienteSonoro)}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${tokenAcesso}` },
        body: formulario,
      },
    );
  },

  async alterarPublicacaoAmbientePreConfigurado(tokenAcesso, idAmbienteSonoro, publicado) {
    return requisicaoApi(
      `/ambientes-sonoros/pre-configurados/${encodeURIComponent(idAmbienteSonoro)}/publicacao`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${tokenAcesso}` },
        body: JSON.stringify({ publicado }),
      },
    );
  },

  async excluirAmbientePreConfigurado(tokenAcesso, idAmbienteSonoro) {
    return requisicaoApi(
      `/ambientes-sonoros/pre-configurados/${encodeURIComponent(idAmbienteSonoro)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenAcesso}` },
      },
    );
  },
};
