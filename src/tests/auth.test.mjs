import test from 'node:test';
import assert from 'node:assert/strict';

// Mock do ambiente Vite import.meta.env
globalThis.importMetaEnv = {
  VITE_API_URL: 'http://localhost:3000',
};

test('authService.login envia dados corretos e formato esperado para o backend', async () => {
  let urlChamada = '';
  let opcoesChamadas = {};

  const mockFetch = async (url, opcoes) => {
    urlChamada = url;
    opcoesChamadas = opcoes;

    return {
      ok: true,
      status: 200,
      headers: {
        get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        mensagem: 'Login realizado com sucesso.',
        tokenAcesso: 'jwt_mock_token_123',
        usuario: {
          id: 'user-uuid-1',
          nome: 'Usuário Admin',
          email: 'admin@sonessia.com',
          perfil: 'ADMIN',
        },
      }),
    };
  };

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  const resultado = await authService.login('admin@sonessia.com', 'SenhaForte@123', true);

  assert.equal(urlChamada, 'http://localhost:3000/autenticacao/login');
  assert.equal(opcoesChamadas.method, 'POST');
  assert.equal(opcoesChamadas.credentials, 'include');
  assert.equal(opcoesChamadas.headers['Content-Type'], 'application/json');
  assert.equal(
    opcoesChamadas.body,
    JSON.stringify({ email: 'admin@sonessia.com', senha: 'SenhaForte@123', lembrarMe: true })
  );

  assert.equal(resultado.mensagem, 'Login realizado com sucesso.');
  assert.equal(resultado.tokenAcesso, 'jwt_mock_token_123');
  assert.equal(resultado.usuario.perfil, 'ADMIN');
});

test('authService.login com lembrarMe desmarcado envia lembrarMe: false', async () => {
  let corpoEnviado = {};

  const mockFetch = async (_url, opcoes) => {
    corpoEnviado = JSON.parse(opcoes.body);
    return {
      ok: true,
      status: 200,
      headers: {
        get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        mensagem: 'Login realizado com sucesso.',
        tokenAcesso: 'jwt_sessao_123',
        usuario: {
          id: 'user-uuid-2',
          nome: 'Usuário Comum',
          email: 'comum@sonessia.com',
          perfil: 'COMUM',
        },
      }),
    };
  };

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  await authService.login('comum@sonessia.com', 'SenhaForte@123', false);

  assert.equal(corpoEnviado.lembrarMe, false);
});

test('authService.login trata adequadamente erros do backend (ex: CREDENCIAIS_INVALIDAS)', async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 401,
    headers: {
      get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
    },
    json: async () => ({
      erro: {
        codigo: 'CREDENCIAIS_INVALIDAS',
        mensagem: 'E-mail ou senha incorretos.',
        detalhes: [],
      },
    }),
  });

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  await assert.rejects(
    async () => {
      await authService.login('errado@sonessia.com', 'senha_errada');
    },
    (erro) => {
      assert.equal(erro.message, 'E-mail ou senha incorretos.');
      assert.equal(erro.codigo, 'CREDENCIAIS_INVALIDAS');
      assert.equal(erro.status, 401);
      return true;
    }
  );
});

test('authService.login trata erros de validação Zod (DADOS_INVALIDOS)', async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 400,
    headers: {
      get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
    },
    json: async () => ({
      erro: {
        codigo: 'DADOS_INVALIDOS',
        mensagem: 'Os dados fornecidos são inválidos.',
        detalhes: [
          { campo: 'email', mensagem: 'E-mail em formato inválido.' },
        ],
      },
    }),
  });

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  await assert.rejects(
    async () => {
      await authService.login('email_invalido', '123');
    },
    (erro) => {
      assert.equal(erro.message, 'Os dados fornecidos são inválidos.');
      assert.equal(erro.codigo, 'DADOS_INVALIDOS');
      assert.equal(erro.detalhes.length, 1);
      assert.equal(erro.detalhes[0].campo, 'email');
      return true;
    }
  );
});

test('authService.obterUsuarioAtual envia cabeçalho Authorization Bearer', async () => {
  let headersRecebidos = {};

  const mockFetch = async (_url, opcoes) => {
    headersRecebidos = opcoes.headers;
    return {
      ok: true,
      status: 200,
      headers: {
        get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        usuario: {
          id: 'user-uuid-2',
          nome: 'Usuário Comum',
          email: 'comum@sonessia.com',
          perfil: 'COMUM',
          fotoPerfil: null,
        },
      }),
    };
  };

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  const resultado = await authService.obterUsuarioAtual('token_jwt_teste');

  assert.equal(headersRecebidos['Authorization'], 'Bearer token_jwt_teste');
  assert.equal(resultado.usuario.perfil, 'COMUM');
});

test('authService.renovarSessao envia POST para /autenticacao/renovar-sessao com credentials include', async () => {
  let urlChamada = '';
  let opcoesChamadas = {};

  const mockFetch = async (url, opcoes) => {
    urlChamada = url;
    opcoesChamadas = opcoes;
    return {
      ok: true,
      status: 200,
      headers: {
        get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        mensagem: 'Sessão renovada com sucesso.',
        tokenAcesso: 'novo_token_jwt_456',
        usuario: {
          id: 'user-uuid-1',
          nome: 'Usuário Admin',
          email: 'admin@sonessia.com',
          perfil: 'ADMIN',
        },
      }),
    };
  };

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  const resultado = await authService.renovarSessao(true);

  assert.equal(urlChamada, 'http://localhost:3000/autenticacao/renovar-sessao');
  assert.equal(opcoesChamadas.method, 'POST');
  assert.equal(opcoesChamadas.credentials, 'include');
  assert.equal(opcoesChamadas.body, JSON.stringify({ lembrarMe: true }));
  assert.equal(resultado.tokenAcesso, 'novo_token_jwt_456');
  assert.equal(resultado.usuario.perfil, 'ADMIN');
});

test('authService.logout envia Authorization e credentials include', async () => {
  let urlChamada = '';
  let opcoesChamadas = {};

  const mockFetch = async (url, opcoes) => {
    urlChamada = url;
    opcoesChamadas = opcoes;
    return {
      ok: true,
      status: 200,
      headers: {
        get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        mensagem: 'Logout realizado com sucesso.',
      }),
    };
  };

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  const resultado = await authService.logout('token_logout');

  assert.equal(urlChamada, 'http://localhost:3000/autenticacao/logout');
  assert.equal(opcoesChamadas.method, 'POST');
  assert.equal(opcoesChamadas.credentials, 'include');
  assert.equal(opcoesChamadas.headers['Authorization'], 'Bearer token_logout');
  assert.equal(resultado.mensagem, 'Logout realizado com sucesso.');
});

test('authService.solicitarRecuperacaoSenha envia e-mail para endpoint neutro', async () => {
  let urlChamada = '';
  let corpoEnviado = {};

  const mockFetch = async (url, opcoes) => {
    urlChamada = url;
    corpoEnviado = JSON.parse(opcoes.body);
    return {
      ok: true,
      status: 200,
      headers: {
        get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        mensagem:
          'Se o e-mail informado estiver cadastrado e verificado, as instruções para redefinição de senha foram enviadas.',
      }),
    };
  };

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  const resultado = await authService.solicitarRecuperacaoSenha('usuario@sonessia.com');

  assert.equal(urlChamada, 'http://localhost:3000/autenticacao/recuperar-senha');
  assert.equal(corpoEnviado.email, 'usuario@sonessia.com');
  assert.match(resultado.mensagem, /Se o e-mail informado estiver cadastrado/);
});

test('authService.redefinirSenha envia token e nova senha para o backend', async () => {
  let urlChamada = '';
  let corpoEnviado = {};

  const mockFetch = async (url, opcoes) => {
    urlChamada = url;
    corpoEnviado = JSON.parse(opcoes.body);
    return {
      ok: true,
      status: 200,
      headers: {
        get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        mensagem: 'Senha redefinida com sucesso. Faça login com a nova senha.',
      }),
    };
  };

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  const tokenHex = 'a'.repeat(64);
  const resultado = await authService.redefinirSenha(tokenHex, 'NovaSenhaForte@999');

  assert.equal(urlChamada, 'http://localhost:3000/autenticacao/redefinir-senha');
  assert.equal(corpoEnviado.token, tokenHex);
  assert.equal(corpoEnviado.novaSenha, 'NovaSenhaForte@999');
  assert.match(resultado.mensagem, /Senha redefinida com sucesso/);
});

test('authService.redefinirSenha propaga erro quando token for expirado ou inválido', async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 400,
    headers: {
      get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
    },
    json: async () => ({
      erro: {
        codigo: 'TOKEN_INVALIDO',
        mensagem: 'Token de recuperação inválido ou já utilizado.',
        detalhes: [],
      },
    }),
  });

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  await assert.rejects(
    async () => {
      await authService.redefinirSenha('b'.repeat(64), 'NovaSenhaForte@999');
    },
    (erro) => {
      assert.equal(erro.codigo, 'TOKEN_INVALIDO');
      assert.equal(erro.message, 'Token de recuperação inválido ou já utilizado.');
      return true;
    }
  );
});

test('Validação de perfis e rotas protegidas (Lógica RBAC)', () => {
  function avaliarAcessoRota({ usuario, estaAutenticado, perfilExigido }) {
    if (!estaAutenticado || !usuario) {
      return { permitido: false, redirecionarPara: '/login' };
    }

    if (perfilExigido && usuario.perfil !== perfilExigido) {
      if (usuario.perfil === 'ADMIN') {
        return { permitido: false, redirecionarPara: '/admin' };
      }
      if (usuario.perfil === 'COMUM') {
        return { permitido: false, redirecionarPara: '/comum' };
      }
      return { permitido: false, redirecionarPara: '/login' };
    }

    return { permitido: true, redirecionarPara: null };
  }

  // 1. Usuário não autenticado tentando acessar /admin ou /comum
  assert.deepEqual(
    avaliarAcessoRota({ usuario: null, estaAutenticado: false, perfilExigido: 'ADMIN' }),
    { permitido: false, redirecionarPara: '/login' }
  );
  assert.deepEqual(
    avaliarAcessoRota({ usuario: null, estaAutenticado: false, perfilExigido: 'COMUM' }),
    { permitido: false, redirecionarPara: '/login' }
  );

  // 2. Usuário COMUM acessando /comum -> Permitido
  assert.deepEqual(
    avaliarAcessoRota({
      usuario: { perfil: 'COMUM' },
      estaAutenticado: true,
      perfilExigido: 'COMUM',
    }),
    { permitido: true, redirecionarPara: null }
  );

  // 3. Usuário COMUM tentando acessar /admin -> Bloqueado e redirecionado para /comum
  assert.deepEqual(
    avaliarAcessoRota({
      usuario: { perfil: 'COMUM' },
      estaAutenticado: true,
      perfilExigido: 'ADMIN',
    }),
    { permitido: false, redirecionarPara: '/comum' }
  );

  // 4. Usuário ADMIN acessando /admin -> Permitido
  assert.deepEqual(
    avaliarAcessoRota({
      usuario: { perfil: 'ADMIN' },
      estaAutenticado: true,
      perfilExigido: 'ADMIN',
    }),
    { permitido: true, redirecionarPara: null }
  );

  // 5. Usuário ADMIN tentando acessar /comum -> Bloqueado e redirecionado para /admin
  assert.deepEqual(
    avaliarAcessoRota({
      usuario: { perfil: 'ADMIN' },
      estaAutenticado: true,
      perfilExigido: 'COMUM',
    }),
    { permitido: false, redirecionarPara: '/admin' }
  );
});

test('Lógica de persistência da sessão ("Lembrar-me")', () => {
  const localStorageMock = new Map();
  const sessionStorageMock = new Map();

  function salvarAutenticacaoMock(token, usuario, lembrarMe) {
    if (lembrarMe) {
      localStorageMock.set('sonessia_token', token);
      localStorageMock.set('sonessia_usuario', JSON.stringify(usuario));
      localStorageMock.set('sonessia_lembrar_me', 'true');
      sessionStorageMock.delete('sonessia_token');
      sessionStorageMock.delete('sonessia_usuario');
    } else {
      sessionStorageMock.set('sonessia_token', token);
      sessionStorageMock.set('sonessia_usuario', JSON.stringify(usuario));
      localStorageMock.delete('sonessia_token');
      localStorageMock.delete('sonessia_usuario');
      localStorageMock.delete('sonessia_lembrar_me');
    }
  }

  // Com Lembrar-me marcado:
  salvarAutenticacaoMock('token_persistente', { id: '1', perfil: 'ADMIN' }, true);
  assert.equal(localStorageMock.get('sonessia_token'), 'token_persistente');
  assert.equal(localStorageMock.get('sonessia_lembrar_me'), 'true');
  assert.equal(sessionStorageMock.has('sonessia_token'), false);

  // Sem Lembrar-me:
  salvarAutenticacaoMock('token_sessao', { id: '2', perfil: 'COMUM' }, false);
  assert.equal(sessionStorageMock.get('sonessia_token'), 'token_sessao');
  assert.equal(localStorageMock.has('sonessia_token'), false);
  assert.equal(localStorageMock.has('sonessia_lembrar_me'), false);
});
