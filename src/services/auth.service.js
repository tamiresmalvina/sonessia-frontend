import { requisicaoApi } from "./api.js";

function cabecalhosAutenticados(tokenAcesso) {
  return tokenAcesso ? { Authorization: `Bearer ${tokenAcesso}` } : {};
}

export const authService = {
  /**
   * Realiza o cadastro de um novo usuário na plataforma Sonessia.
   * Endpoint: POST /autenticacao/cadastro
   *
   * @param {{ nome: string, email: string, senha: string, dataNascimento: string }} dados
   * @returns {Promise<{ mensagem: string, usuario: { id: string, nome: string, email: string, perfil: 'COMUM', emailVerificado: boolean, dataNascimento: string, fotoPerfil: null } }>}
   */
  async cadastrar(dados) {
    return requisicaoApi("/autenticacao/cadastro", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  /**
   * Realiza login no backend da Sonessia.
   * Endpoint: POST /autenticacao/login
   *
   * @param {string} email
   * @param {string} senha
   * @param {boolean} [lembrarMe=false]
   * @returns {Promise<{ mensagem: string, tokenAcesso: string, usuario: { id: string, nome: string, email: string, perfil: 'ADMIN' | 'COMUM' } }>}
   */
  async login(email, senha, lembrarMe = false) {
    return requisicaoApi("/autenticacao/login", {
      method: "POST",
      body: JSON.stringify({ email, senha, lembrarMe }),
    });
  },

  /**
   * Obtém os dados do usuário autenticado a partir do token de acesso.
   * Endpoint: GET /autenticacao/eu
   *
   * @param {string} tokenAcesso
   * @returns {Promise<{ usuario: { id: string, nome: string, email: string, perfil: 'ADMIN' | 'COMUM', fotoPerfil: string | null } }>}
   */
  async obterUsuarioAtual(tokenAcesso) {
    return requisicaoApi("/autenticacao/eu", {
      method: "GET",
      headers: cabecalhosAutenticados(tokenAcesso),
    });
  },

  async atualizarNome(tokenAcesso, nome) {
    return requisicaoApi("/autenticacao/eu", {
      method: "PATCH",
      headers: cabecalhosAutenticados(tokenAcesso),
      body: JSON.stringify({ nome }),
    });
  },

  async obterFotoPerfil(tokenAcesso) {
    return requisicaoApi("/autenticacao/eu/foto-perfil", {
      method: "GET",
      headers: cabecalhosAutenticados(tokenAcesso),
      responseType: "blob",
    });
  },

  async atualizarFotoPerfil(tokenAcesso, arquivo) {
    return requisicaoApi("/autenticacao/eu/foto-perfil", {
      method: "PUT",
      headers: {
        ...cabecalhosAutenticados(tokenAcesso),
        "Content-Type": arquivo.type,
      },
      body: arquivo,
    });
  },

  async removerFotoPerfil(tokenAcesso) {
    return requisicaoApi("/autenticacao/eu/foto-perfil", {
      method: "DELETE",
      headers: cabecalhosAutenticados(tokenAcesso),
    });
  },

  async solicitarAlteracaoEmail(tokenAcesso, novoEmail, senhaAtual) {
    return requisicaoApi("/autenticacao/solicitar-alteracao-email", {
      method: "POST",
      headers: cabecalhosAutenticados(tokenAcesso),
      body: JSON.stringify({ novoEmail, senhaAtual }),
    });
  },

  async obterAlteracaoEmailPendente(tokenAcesso) {
    return requisicaoApi("/autenticacao/eu/alteracao-email", {
      method: "GET",
      headers: cabecalhosAutenticados(tokenAcesso),
    });
  },

  async reenviarCodigoAlteracaoEmail(tokenAcesso) {
    return requisicaoApi("/autenticacao/eu/alteracao-email/reenviar-codigo", {
      method: "POST",
      headers: cabecalhosAutenticados(tokenAcesso),
      body: JSON.stringify({}),
    });
  },

  async cancelarAlteracaoEmail(tokenAcesso) {
    return requisicaoApi("/autenticacao/eu/alteracao-email", {
      method: "DELETE",
      headers: cabecalhosAutenticados(tokenAcesso),
    });
  },

  async confirmarEmailAtual(tokenAcesso, codigo) {
    return requisicaoApi("/autenticacao/confirmar-email-atual", {
      method: "POST",
      headers: cabecalhosAutenticados(tokenAcesso),
      body: JSON.stringify({ codigo }),
    });
  },

  async confirmarNovoEmail(tokenAcesso, codigo) {
    return requisicaoApi("/autenticacao/confirmar-novo-email", {
      method: "POST",
      headers: cabecalhosAutenticados(tokenAcesso),
      body: JSON.stringify({ codigo }),
    });
  },

  async alterarSenha(tokenAcesso, dados) {
    return requisicaoApi("/autenticacao/eu/senha", {
      method: "PATCH",
      headers: cabecalhosAutenticados(tokenAcesso),
      body: JSON.stringify(dados),
    });
  },

  /**
   * Renova a sessão e o token de acesso utilizando o cookie de refresh token.
   * Endpoint: POST /autenticacao/renovar-sessao
   *
   * @param {boolean} [lembrarMe=false]
   * @returns {Promise<{ mensagem: string, tokenAcesso: string, usuario: { id: string, nome: string, email: string, perfil: 'ADMIN' | 'COMUM' } }>}
   */
  async renovarSessao(lembrarMe = false) {
    return requisicaoApi("/autenticacao/renovar-sessao", {
      method: "POST",
      body: JSON.stringify({ lembrarMe }),
    });
  },

  /**
   * Encerra a sessão ativa no backend.
   * Endpoint: POST /autenticacao/logout
   *
   * @param {string} [tokenAcesso]
   * @returns {Promise<{ mensagem: string }>}
   */
  async logout(tokenAcesso) {
    const headers = tokenAcesso
      ? { Authorization: `Bearer ${tokenAcesso}` }
      : {};
    return requisicaoApi("/autenticacao/logout", {
      method: "POST",
      headers,
    });
  },

  /**
   * Solicita o envio de e-mail de recuperação de senha.
   * Endpoint: POST /autenticacao/recuperar-senha
   *
   * @param {string} email
   * @returns {Promise<{ mensagem: string }>}
   */
  async solicitarRecuperacaoSenha(email) {
    return requisicaoApi("/autenticacao/recuperar-senha", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Redefine a senha utilizando o token de uso único recebido por e-mail.
   * Endpoint: POST /autenticacao/redefinir-senha
   *
   * @param {string} token - Token de 64 caracteres hexadecimais.
   * @param {string} novaSenha - Nova senha com requisitos mínimos de segurança.
   * @returns {Promise<{ mensagem: string }>}
   */
  async redefinirSenha(token, novaSenha) {
    return requisicaoApi("/autenticacao/redefinir-senha", {
      method: "POST",
      body: JSON.stringify({ token, novaSenha }),
    });
  },

  /**
   * Confirma o endereço de e-mail do usuário utilizando o código de 6 dígitos.
   * Endpoint: POST /autenticacao/verificar-email
   *
   * @param {string} email - E-mail cadastrado do usuário.
   * @param {string} codigo - Código numérico de 6 dígitos recebido por e-mail.
   * @returns {Promise<{ mensagem: string }>}
   */
  async verificarEmail(email, codigo) {
    return requisicaoApi("/autenticacao/verificar-email", {
      method: "POST",
      body: JSON.stringify({
        email: email ? email.trim().toLowerCase() : "",
        codigo: codigo ? codigo.trim() : "",
      }),
    });
  },

  /**
   * Solicita o reenvio do código de 6 dígitos para o e-mail informado.
   * Endpoint: POST /autenticacao/reenviar-codigo
   *
   * @param {string} email - E-mail cadastrado do usuário.
   * @returns {Promise<{ mensagem: string }>}
   */
  async reenviarCodigo(email) {
    return requisicaoApi("/autenticacao/reenviar-codigo", {
      method: "POST",
      body: JSON.stringify({
        email: email ? email.trim().toLowerCase() : "",
      }),
    });
  },
};
