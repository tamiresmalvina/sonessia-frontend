import { useState, useEffect, useCallback, useRef } from "react";
import { AuthContext } from "./AuthContextInstance.js";
import { authService } from "../services/auth.service.js";

const CHAVE_STORAGE_TOKEN = "sonessia_token";
const CHAVE_STORAGE_USUARIO = "sonessia_usuario";
const CHAVE_STORAGE_LEMBRAR_ME = "sonessia_lembrar_me";

function obterTokenArmazenado() {
  try {
    return (
      localStorage.getItem(CHAVE_STORAGE_TOKEN) ||
      sessionStorage.getItem(CHAVE_STORAGE_TOKEN) ||
      null
    );
  } catch {
    return null;
  }
}

function obterUsuarioArmazenado() {
  try {
    const salvo =
      localStorage.getItem(CHAVE_STORAGE_USUARIO) ||
      sessionStorage.getItem(CHAVE_STORAGE_USUARIO);

    return salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
}

function ehSessaoPersistente() {
  try {
    return localStorage.getItem(CHAVE_STORAGE_LEMBRAR_ME) === "true";
  } catch {
    return false;
  }
}

function salvarAutenticacao(token, usuario, lembrarMe) {
  try {
    if (lembrarMe) {
      localStorage.setItem(CHAVE_STORAGE_TOKEN, token);
      localStorage.setItem(CHAVE_STORAGE_USUARIO, JSON.stringify(usuario));
      localStorage.setItem(CHAVE_STORAGE_LEMBRAR_ME, "true");

      sessionStorage.removeItem(CHAVE_STORAGE_TOKEN);
      sessionStorage.removeItem(CHAVE_STORAGE_USUARIO);
    } else {
      sessionStorage.setItem(CHAVE_STORAGE_TOKEN, token);
      sessionStorage.setItem(CHAVE_STORAGE_USUARIO, JSON.stringify(usuario));

      localStorage.removeItem(CHAVE_STORAGE_TOKEN);
      localStorage.removeItem(CHAVE_STORAGE_USUARIO);
      localStorage.removeItem(CHAVE_STORAGE_LEMBRAR_ME);
    }
  } catch {
    // Falha silenciosa caso o navegador restrinja o armazenamento.
  }
}

function limparAutenticacao() {
  try {
    localStorage.removeItem(CHAVE_STORAGE_TOKEN);
    localStorage.removeItem(CHAVE_STORAGE_USUARIO);
    localStorage.removeItem(CHAVE_STORAGE_LEMBRAR_ME);

    sessionStorage.removeItem(CHAVE_STORAGE_TOKEN);
    sessionStorage.removeItem(CHAVE_STORAGE_USUARIO);
  } catch {
    // Falha silenciosa.
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => obterUsuarioArmazenado());
  const [token, setToken] = useState(() => obterTokenArmazenado());
  const [carregando, setCarregando] = useState(true);
  const usuarioRef = useRef(usuario);

  useEffect(() => {
    let ativo = true;

    async function validarOuRestaurarSessao() {
      const tokenAtual = obterTokenArmazenado();
      const persistente = ehSessaoPersistente();

      if (tokenAtual) {
        try {
          const dados = await authService.obterUsuarioAtual(tokenAtual);

          if (ativo && dados?.usuario) {
            usuarioRef.current = dados.usuario;
            setUsuario(dados.usuario);
            setToken(tokenAtual);

            salvarAutenticacao(tokenAtual, dados.usuario, persistente);

            setCarregando(false);
            return;
          }
        } catch {
          // Token expirado ou inválido: tenta renovar a sessão.
        }
      }

      try {
        const renovacao = await authService.renovarSessao(persistente);

        if (ativo && renovacao?.tokenAcesso && renovacao?.usuario) {
          usuarioRef.current = renovacao.usuario;
          salvarAutenticacao(
            renovacao.tokenAcesso,
            renovacao.usuario,
            persistente,
          );

          setToken(renovacao.tokenAcesso);
          setUsuario(renovacao.usuario);

          setCarregando(false);
          return;
        }
      } catch {
        // Não existe uma sessão ativa válida.
      }

      if (ativo) {
        limparAutenticacao();
        usuarioRef.current = null;
        setToken(null);
        setUsuario(null);
        setCarregando(false);
      }
    }

    validarOuRestaurarSessao();

    return () => {
      ativo = false;
    };
  }, []);

  const login = useCallback(async (email, senha, lembrarMe = false) => {
    const resposta = await authService.login(email, senha, lembrarMe);
    const { tokenAcesso, usuario: dadosUsuario } = resposta;

    salvarAutenticacao(tokenAcesso, dadosUsuario, Boolean(lembrarMe));

    usuarioRef.current = dadosUsuario;
    setToken(tokenAcesso);
    setUsuario(dadosUsuario);

    return dadosUsuario;
  }, []);

  const renovarToken = useCallback(async () => {
    const persistente = ehSessaoPersistente();
    const renovacao = await authService.renovarSessao(persistente);

    const { tokenAcesso, usuario: dadosUsuario } = renovacao;

    salvarAutenticacao(tokenAcesso, dadosUsuario, persistente);

    usuarioRef.current = dadosUsuario;
    setToken(tokenAcesso);
    setUsuario(dadosUsuario);

    return tokenAcesso;
  }, []);

  const atualizarUsuario = useCallback((alteracoes) => {
    if (!usuarioRef.current) return null;

    const usuarioAtualizado = { ...usuarioRef.current, ...alteracoes };
    usuarioRef.current = usuarioAtualizado;
    salvarAutenticacao(token, usuarioAtualizado, ehSessaoPersistente());
    setUsuario(usuarioAtualizado);
    return usuarioAtualizado;
  }, [token]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch {
      // Encerra a sessão local mesmo se a API estiver indisponível.
    } finally {
      limparAutenticacao();
      usuarioRef.current = null;
      setToken(null);
      setUsuario(null);
    }
  }, [token]);

  const valor = {
    usuario,
    token,
    carregando,
    estaAutenticado: Boolean(token && usuario),
    login,
    renovarToken,
    atualizarUsuario,
    logout,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}
