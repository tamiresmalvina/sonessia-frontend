import { useState, useEffect, useCallback, useRef } from "react";
import { AuthContext } from "./AuthContextInstance.js";
import { authService } from "../services/auth.service.js";
import {
  ehSessaoPersistente,
  inscreverMudancasSessao,
  limparAutenticacao,
  obterTokenArmazenado,
  obterUsuarioArmazenado,
  salvarAutenticacao,
} from "../services/auth-session.js";
import { obterPrazoSaidaEmail } from "../utils/emailAlteradoSuccess.js";
import { obterEsperaLogoutExclusao } from "../utils/exclusaoContaSuccess.js";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => obterUsuarioArmazenado());
  const [token, setToken] = useState(() => obterTokenArmazenado());
  const [carregando, setCarregando] = useState(true);
  const usuarioRef = useRef(usuario);

  useEffect(() => {
    const cancelarInscricao = inscreverMudancasSessao((sessao) => {
      usuarioRef.current = sessao.usuario;
      setToken(sessao.token);
      setUsuario(sessao.usuario);
    });

    return cancelarInscricao;
  }, []);

  useEffect(() => {
    let ativo = true;

    async function validarOuRestaurarSessao() {
      if (obterEsperaLogoutExclusao()) {
        setCarregando(false);
        return;
      }

      if (obterPrazoSaidaEmail() !== null) {
        limparAutenticacao();
        usuarioRef.current = null;
        setToken(null);
        setUsuario(null);
        setCarregando(false);
        return;
      }

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
