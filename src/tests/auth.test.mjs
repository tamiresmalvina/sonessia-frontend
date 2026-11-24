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

test('authService.cadastrar envia payload completo com dados esperados pelo backend', async () => {
  let urlChamada = '';
  let opcoesChamadas = {};

  const mockFetch = async (url, opcoes) => {
    urlChamada = url;
    opcoesChamadas = opcoes;
    return {
      ok: true,
      status: 201,
      headers: {
        get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        mensagem:
          'Cadastro realizado com sucesso. Um código de verificação foi encaminhado para o seu e-mail.',
        usuario: {
          id: 'user-novo-uuid',
          nome: 'Novo Usuário',
          email: 'novo@sonessia.com',
          perfil: 'COMUM',
          emailVerificado: false,
          dataNascimento: '2000-05-15T00:00:00.000Z',
          fotoPerfil: null,
        },
      }),
    };
  };

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  const payload = {
    nome: 'Novo Usuário',
    email: 'novo@sonessia.com',
    senha: 'SenhaForte@123',
    dataNascimento: '2000-05-15',
  };

  const resultado = await authService.cadastrar(payload);

  assert.equal(urlChamada, 'http://localhost:3000/autenticacao/cadastro');
  assert.equal(opcoesChamadas.method, 'POST');
  assert.equal(opcoesChamadas.credentials, 'include');
  assert.equal(opcoesChamadas.headers['Content-Type'], 'application/json');
  assert.equal(opcoesChamadas.body, JSON.stringify(payload));
  assert.equal(resultado.usuario.perfil, 'COMUM');
  assert.equal(resultado.usuario.emailVerificado, false);
  assert.match(resultado.mensagem, /código de verificação foi encaminhado/);
});

test('authService.cadastrar trata conflito de e-mail existente (409 CONFLITO_CADASTRO)', async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 409,
    headers: {
      get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
    },
    json: async () => ({
      erro: {
        codigo: 'CONFLITO_CADASTRO',
        mensagem: 'Já existe uma conta cadastrada com o e-mail informado.',
        detalhes: [],
      },
    }),
  });

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  await assert.rejects(
    async () => {
      await authService.cadastrar({
        nome: 'Usuario Repetido',
        email: 'repetido@sonessia.com',
        senha: 'SenhaForte@123',
        dataNascimento: '2000-01-01',
      });
    },
    (erro) => {
      assert.equal(erro.status, 409);
      assert.equal(erro.codigo, 'CONFLITO_CADASTRO');
      assert.equal(erro.message, 'Já existe uma conta cadastrada com o e-mail informado.');
      return true;
    }
  );
});

test('authService.cadastrar trata erro de idade insuficiente (400 DADOS_INVALIDOS)', async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 400,
    headers: {
      get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
    },
    json: async () => ({
      erro: {
        codigo: 'DADOS_INVALIDOS',
        mensagem: 'É necessário ter completado 16 anos para se cadastrar.',
        detalhes: [
          {
            campo: 'dataNascimento',
            mensagem: 'É necessário ter completado 16 anos para se cadastrar.',
          },
        ],
      },
    }),
  });

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  await assert.rejects(
    async () => {
      await authService.cadastrar({
        nome: 'Menor de Idade',
        email: 'menor@sonessia.com',
        senha: 'SenhaForte@123',
        dataNascimento: '2020-01-01',
      });
    },
    (erro) => {
      assert.equal(erro.status, 400);
      assert.equal(erro.codigo, 'DADOS_INVALIDOS');
      assert.match(erro.message, /16 anos/);
      return true;
    }
  );
});

test('validarIdade aceita data que completa 16 anos exatamente hoje', async () => {
  const { validarIdade } = await import('../utils/validacoes.js');

  const hoje = new Date(Date.UTC(2026, 10, 18)); // 2026-11-18
  const dataExata = '2010-11-18'; // Exatamente 16 anos hoje

  const resultado = validarIdade(dataExata, hoje);
  assert.equal(resultado.valido, true);
  assert.equal(resultado.erro, '');
});

test('validarIdade rejeita quando completa 16 anos amanhã (1 dia antes)', async () => {
  const { validarIdade } = await import('../utils/validacoes.js');

  const hoje = new Date(Date.UTC(2026, 10, 18)); // 2026-11-18
  const dataAmanha = '2010-11-19'; // Completa 16 anos amanhã

  const resultado = validarIdade(dataAmanha, hoje);
  assert.equal(resultado.valido, false);
  assert.equal(resultado.erro, 'É necessário ter pelo menos 16 anos para criar uma conta.');
});

test('validarIdade rejeita idade inferior a 16 anos (ex: 15 anos)', async () => {
  const { validarIdade } = await import('../utils/validacoes.js');

  const hoje = new Date(Date.UTC(2026, 10, 18));
  const data15Anos = '2011-11-18';

  const resultado = validarIdade(data15Anos, hoje);
  assert.equal(resultado.valido, false);
  assert.equal(resultado.erro, 'É necessário ter pelo menos 16 anos para criar uma conta.');
});

test('validarIdade rejeita data futura', async () => {
  const { validarIdade } = await import('../utils/validacoes.js');

  const hoje = new Date(Date.UTC(2026, 10, 18));
  const dataFutura = '2026-11-19';

  const resultado = validarIdade(dataFutura, hoje);
  assert.equal(resultado.valido, false);
  assert.equal(resultado.erro, 'A data de nascimento não pode ser futura.');
});

test('validarIdade rejeita data anterior a 1900-01-01', async () => {
  const { validarIdade } = await import('../utils/validacoes.js');

  const hoje = new Date(Date.UTC(2026, 10, 18));
  const dataAntiga = '1899-12-31';

  const resultado = validarIdade(dataAntiga, hoje);
  assert.equal(resultado.valido, false);
  assert.equal(resultado.erro, 'A data de nascimento não pode ser anterior a 1900-01-01.');
});

test('validarIdade rejeita campo vazio ou formato inválido', async () => {
  const { validarIdade } = await import('../utils/validacoes.js');

  assert.equal(validarIdade('').valido, false);
  assert.equal(validarIdade('').erro, 'Informe sua data de nascimento.');

  assert.equal(validarIdade('data-invalida').valido, false);
  assert.equal(
    validarIdade('data-invalida').erro,
    'A data de nascimento deve ser uma data válida no formato AAAA-MM-DD.'
  );

  assert.equal(validarIdade('2024-02-31').valido, false);
  assert.equal(validarIdade('2024-02-31').erro, 'Data de nascimento inválida.');
});

test('authService.verificarEmail envia POST para /autenticacao/verificar-email com payload correto', async () => {
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
        mensagem: 'E-mail verificado com sucesso. Sua conta agora está ativa.',
      }),
    };
  };

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  const resposta = await authService.verificarEmail('NOVO@SONESSIA.COM', '123456');

  assert.equal(urlChamada, 'http://localhost:3000/autenticacao/verificar-email');
  assert.equal(opcoesChamadas.method, 'POST');
  assert.equal(
    opcoesChamadas.body,
    JSON.stringify({ email: 'novo@sonessia.com', codigo: '123456' })
  );
  assert.equal(resposta.mensagem, 'E-mail verificado com sucesso. Sua conta agora está ativa.');
});

test('authService.verificarEmail trata adequadamente código incorreto (400 CODIGO_INCORRETO)', async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 400,
    headers: {
      get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
    },
    json: async () => ({
      erro: {
        codigo: 'CODIGO_INCORRETO',
        mensagem: 'Código de verificação incorreto.',
      },
    }),
  });

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  await assert.rejects(
    async () => {
      await authService.verificarEmail('novo@sonessia.com', '999999');
    },
    (erro) => {
      assert.equal(erro.status, 400);
      assert.equal(erro.codigo, 'CODIGO_INCORRETO');
      assert.equal(erro.message, 'Código de verificação incorreto.');
      return true;
    }
  );
});

test('authService.verificarEmail trata código expirado (400 CODIGO_EXPIRADO)', async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 400,
    headers: {
      get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
    },
    json: async () => ({
      erro: {
        codigo: 'CODIGO_EXPIRADO',
        mensagem: 'O código de verificação expirou. Solicite um novo código.',
      },
    }),
  });

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  await assert.rejects(
    async () => {
      await authService.verificarEmail('novo@sonessia.com', '123456');
    },
    (erro) => {
      assert.equal(erro.status, 400);
      assert.equal(erro.codigo, 'CODIGO_EXPIRADO');
      assert.match(erro.message, /expirou/);
      return true;
    }
  );
});

test('authService.reenviarCodigo envia POST para /autenticacao/reenviar-codigo com e-mail normalizado', async () => {
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
        mensagem: 'Se a conta informada existir e ainda não estiver verificada, um novo código foi enviado.',
      }),
    };
  };

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  const resposta = await authService.reenviarCodigo('  Usuario@Sonessia.COM ');

  assert.equal(urlChamada, 'http://localhost:3000/autenticacao/reenviar-codigo');
  assert.equal(opcoesChamadas.method, 'POST');
  assert.equal(
    opcoesChamadas.body,
    JSON.stringify({ email: 'usuario@sonessia.com' })
  );
  assert.match(resposta.mensagem, /novo código foi enviado/);
});

test('authService.reenviarCodigo propaga erro de intervalo de reenvio (429 INTERVALO_REENVIO)', async () => {
  const mockFetch = async () => ({
    ok: false,
    status: 429,
    headers: {
      get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
    },
    json: async () => ({
      erro: {
        codigo: 'INTERVALO_REENVIO',
        mensagem: 'Aguarde 45 segundos antes de solicitar um novo código de verificação.',
      },
    }),
  });

  globalThis.fetch = mockFetch;
  const { authService } = await import('../services/auth.service.js');

  await assert.rejects(
    async () => {
      await authService.reenviarCodigo('usuario@sonessia.com');
    },
    (erro) => {
      assert.equal(erro.status, 429);
      assert.equal(erro.codigo, 'INTERVALO_REENVIO');
      assert.match(erro.message, /Aguarde 45 segundos/);
      return true;
    }
  );
});

test('audioService.listarAudios faz GET em /audios e retorna a lista de sons', async () => {
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
        audios: [
          {
            idAudio: 'audio-1',
            titulo: 'Ruído branco',
            categoria: 'RUIDO',
            arquivo: 'https://cdn.sonessia.com/ruido-branco.mp3',
          },
        ],
      }),
    };
  };

  globalThis.fetch = mockFetch;
  const { audioService } = await import('../services/sons.service.js');

  const resultado = await audioService.listarAudios();

  assert.equal(urlChamada, 'http://localhost:3000/audios');
  assert.equal(opcoesChamadas.method, 'GET');
  assert.equal(resultado.audios.length, 1);
  assert.equal(resultado.audios[0].titulo, 'Ruído branco');
});

test('ambienteService.criarAmbiente envia POST para /ambientes-sonoros com token Bearer e payload', async () => {
  let urlChamada = '';
  let opcoesChamadas = {};

  const mockFetch = async (url, opcoes) => {
    urlChamada = url;
    opcoesChamadas = opcoes;
    return {
      ok: true,
      status: 201,
      headers: {
        get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        mensagem: 'Ambiente criado com sucesso.',
        ambienteSonoro: { id: 'amb-1', nome: 'Foco Total' },
      }),
    };
  };

  globalThis.fetch = mockFetch;
  const { ambienteService } = await import('../services/sons.service.js');

  const dados = {
    nome: 'Foco Total',
    finalidade: 'ESTUDO',
    audios: [{ idAudio: '00000000-0000-4000-8000-000000000001', volume: 80 }],
  };

  const resposta = await ambienteService.criarAmbiente('token_jwt_teste', dados);

  assert.equal(urlChamada, 'http://localhost:3000/ambientes-sonoros');
  assert.equal(opcoesChamadas.method, 'POST');
  assert.equal(opcoesChamadas.headers.Authorization, 'Bearer token_jwt_teste');
  assert.equal(opcoesChamadas.body, JSON.stringify(dados));
  assert.equal(resposta.mensagem, 'Ambiente criado com sucesso.');
});

test('authService envia as operações de configurações com os contratos autenticados', async () => {
  const chamadas = [];
  globalThis.fetch = async (url, opcoes) => {
    chamadas.push({ url, ...opcoes });
    return {
      ok: true,
      status: 200,
      headers: {
        get: (nome) =>
          nome.toLowerCase() === 'content-type' ? 'application/json' : null,
      },
      json: async () => ({ mensagem: 'Operação realizada.' }),
    };
  };
  const { authService } = await import('../services/auth.service.js');
  const token = 'token_admin_teste';

  await authService.atualizarNome(token, 'Admin Sonessia');
  await authService.solicitarAlteracaoEmail(token, 'novo@sonessia.com', 'SenhaAtual@1');
  await authService.obterAlteracaoEmailPendente(token);
  await authService.cancelarAlteracaoEmail(token);
  await authService.reenviarCodigoAlteracaoEmail(token);
  await authService.confirmarEmailAtual(token, '123456');
  await authService.confirmarNovoEmail(token, '654321');
  await authService.alterarSenha(token, {
    senhaAtual: 'SenhaAtual@1',
    novaSenha: 'SenhaNova@2',
    confirmarNovaSenha: 'SenhaNova@2',
  });

  assert.deepEqual(
    chamadas.map(({ url, method, body, headers }) => ({
      endpoint: url.replace('http://localhost:3000', ''),
      method,
      body: body ? JSON.parse(body) : undefined,
      autorizacao: headers.Authorization,
    })),
    [
      {
        endpoint: '/autenticacao/eu',
        method: 'PATCH',
        body: { nome: 'Admin Sonessia' },
        autorizacao: `Bearer ${token}`,
      },
      {
        endpoint: '/autenticacao/solicitar-alteracao-email',
        method: 'POST',
        body: { novoEmail: 'novo@sonessia.com', senhaAtual: 'SenhaAtual@1' },
        autorizacao: `Bearer ${token}`,
      },
      {
        endpoint: '/autenticacao/eu/alteracao-email',
        method: 'GET',
        body: undefined,
        autorizacao: `Bearer ${token}`,
      },
      {
        endpoint: '/autenticacao/eu/alteracao-email',
        method: 'DELETE',
        body: undefined,
        autorizacao: `Bearer ${token}`,
      },
      {
        endpoint: '/autenticacao/eu/alteracao-email/reenviar-codigo',
        method: 'POST',
        body: {},
        autorizacao: `Bearer ${token}`,
      },
      {
        endpoint: '/autenticacao/confirmar-email-atual',
        method: 'POST',
        body: { codigo: '123456' },
        autorizacao: `Bearer ${token}`,
      },
      {
        endpoint: '/autenticacao/confirmar-novo-email',
        method: 'POST',
        body: { codigo: '654321' },
        autorizacao: `Bearer ${token}`,
      },
      {
        endpoint: '/autenticacao/eu/senha',
        method: 'PATCH',
        body: {
          senhaAtual: 'SenhaAtual@1',
          novaSenha: 'SenhaNova@2',
          confirmarNovaSenha: 'SenhaNova@2',
        },
        autorizacao: `Bearer ${token}`,
      },
    ],
  );
});

test('authService envia a foto como binário e recebe a imagem privada como Blob', async () => {
  const foto = new Blob(['imagem'], { type: 'image/png' });
  const chamadas = [];
  globalThis.fetch = async (url, opcoes) => {
    chamadas.push({ url, ...opcoes });
    if (opcoes.method === 'GET') {
      return {
        ok: true,
        status: 200,
        headers: { get: () => 'image/png' },
        blob: async () => foto,
      };
    }

    return {
      ok: true,
      status: 200,
      headers: {
        get: (nome) =>
          nome.toLowerCase() === 'content-type' ? 'application/json' : null,
      },
      json: async () => ({ fotoPerfil: '/autenticacao/eu/foto-perfil' }),
    };
  };
  const { authService } = await import('../services/auth.service.js');
  const token = 'token_admin_foto';

  const respostaUpload = await authService.atualizarFotoPerfil(token, foto);
  const imagemCarregada = await authService.obterFotoPerfil(token);
  await authService.removerFotoPerfil(token);

  assert.equal(chamadas[0].url, 'http://localhost:3000/autenticacao/eu/foto-perfil');
  assert.equal(chamadas[0].method, 'PUT');
  assert.equal(chamadas[0].body, foto);
  assert.equal(chamadas[0].headers['Content-Type'], 'image/png');
  assert.equal(chamadas[0].headers.Authorization, `Bearer ${token}`);
  assert.deepEqual(respostaUpload, {
    fotoPerfil: '/autenticacao/eu/foto-perfil',
  });
  assert.equal(chamadas[1].method, 'GET');
  assert.equal(chamadas[1].headers.Authorization, `Bearer ${token}`);
  assert.equal(imagemCarregada, foto);
  assert.equal(chamadas[2].method, 'DELETE');
  assert.equal(chamadas[2].headers.Authorization, `Bearer ${token}`);
});
