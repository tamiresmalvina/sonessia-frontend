import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/useAuth.js";
import { SonessiaLogo } from "../../components/auth/SonessiaLogo.jsx";
import { PainelVisualSonoro } from "../../components/auth/PainelVisualSonoro.jsx";

export default function Login() {
  const { login, usuario, estaAutenticado, carregando } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarMe, setLembrarMe] = useState(false);
  const [erro, setErro] = useState("");
  const [emailNaoVerificado, setEmailNaoVerificado] = useState(false);
  const [submetendo, setSubmetendo] = useState(false);

  if (!carregando && estaAutenticado && usuario) {
    if (usuario.perfil === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }

    if (usuario.perfil === "COMUM") {
      return <Navigate to="/comum" replace />;
    }
  }

  async function handleSubmit(evento) {
    evento.preventDefault();

    setErro("");
    setEmailNaoVerificado(false);

    if (!email.trim()) {
      setErro("Informe o seu e-mail.");
      return;
    }

    if (!senha) {
      setErro("A senha é obrigatória.");
      return;
    }

    setSubmetendo(true);

    try {
      const usuarioLogado = await login(email.trim(), senha, lembrarMe);

      if (usuarioLogado?.perfil === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (usuarioLogado?.perfil === "COMUM") {
        navigate("/comum", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      const codigoErro = err?.codigo || "";
      const mensagemErro = err?.message || "Erro ao realizar login.";

      if (
        codigoErro === "EMAIL_NAO_VERIFICADO" ||
        /não verificado|confirmar seu e-mail/i.test(mensagemErro)
      ) {
        setEmailNaoVerificado(true);
      }

      setErro(mensagemErro);
    } finally {
      setSubmetendo(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-bg text-fg md:flex-row">
      {/* Área do formulário */}
      <main className="flex min-h-screen w-full flex-col justify-between border-line-subtle bg-surface px-6 py-10 sm:px-10 sm:py-12 md:w-1/2 md:border-r lg:px-16">
        <header className="mx-auto w-full max-w-[420px]">
          <Link
            to="/"
            className="inline-block transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-lg"
          >
            <SonessiaLogo />
          </Link>
        </header>

        <div className="mx-auto my-auto w-full max-w-[420px] py-8">
          {/* Título e introdução */}
          <div className="mb-8">
            <h1 className="mb-2 text-2xl font-bold tracking-[-0.03em] text-fg sm:text-3xl">
              Bem-vindo ao Sonessia
            </h1>

            <p className="text-sm leading-relaxed text-fg-2 sm:text-base">
              Entre para criar, personalizar e vivenciar seus ambientes sonoros favoritos.
            </p>
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div
              role="alert"
              className="mb-6 flex flex-col gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 transition-all dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
            >
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>

                <span className="font-medium leading-relaxed">{erro}</span>
              </div>

              {emailNaoVerificado && (
                <div className="pl-8 pt-1">
                  <Link
                    to={`/confirmar-email?email=${encodeURIComponent(email.trim())}`}
                    className="inline-flex items-center gap-1.5 font-semibold text-accent transition-colors hover:text-accent-hover hover:underline"
                  >
                    <span>Confirmar meu e-mail agora</span>

                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* E-mail */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-fg"
              >
                E-mail
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                disabled={submetendo}
                required
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-fg transition-all placeholder:text-fg-disabled focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 disabled:cursor-not-allowed disabled:bg-bg-2"
              />
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="senha"
                className="mb-1.5 block text-sm font-medium text-fg"
              >
                Senha
              </label>

              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(evento) => setSenha(evento.target.value)}
                  disabled={submetendo}
                  required
                  className="w-full rounded-xl border border-line bg-surface py-3 pl-4 pr-12 text-base text-fg transition-all placeholder:text-fg-disabled focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 disabled:cursor-not-allowed disabled:bg-bg-2"
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha((valor) => !valor)}
                  disabled={submetendo}
                  aria-label={
                    mostrarSenha ? "Ocultar senha" : "Visualizar senha"
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 text-icon-muted transition-colors hover:text-fg focus:text-fg focus:outline-none"
                >
                  {mostrarSenha ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Lembrar-me e recuperação de senha */}
            <div className="flex items-center justify-between pt-1">
              <label
                htmlFor="lembrarMe"
                className="inline-flex cursor-pointer select-none items-center gap-2.5 text-sm text-fg-2 transition-colors hover:text-fg"
              >
                <input
                  id="lembrarMe"
                  type="checkbox"
                  checked={lembrarMe}
                  onChange={(evento) => setLembrarMe(evento.target.checked)}
                  disabled={submetendo}
                  className="h-4 w-4 cursor-pointer rounded border-line accent-[#7656a8] focus:ring-focus"
                />

                <span>Lembrar-me</span>
              </label>

              <Link
                to="/recuperar-senha"
                className="text-sm font-medium text-accent transition-colors hover:text-accent-hover hover:underline"
              >
                Esqueci minha senha?
              </Link>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={submetendo}
              className="mt-2 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:bg-[image:linear-gradient(100deg,#684a98,#5667b8)] hover:shadow active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submetendo ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>

                  <span>Entrando...</span>
                </>
              ) : (
                <span>Entrar</span>
              )}
            </button>
          </form>

          {/* Link para cadastro */}
          <div className="mt-8 text-center text-sm text-fg-2">
            <span>Não tem uma conta? </span>

            <Link
              to="/cadastro"
              className="font-semibold text-accent transition-colors hover:text-accent-hover hover:underline"
            >
              Cadastre-se
            </Link>
          </div>
        </div>

        <footer className="mx-auto w-full max-w-[420px] pt-4 text-center text-xs text-fg-3">
          © {new Date().getFullYear()} Sonessia. Todos os direitos reservados.
        </footer>
      </main>

      {/* Painel visual */}
      <PainelVisualSonoro className="hidden min-h-screen md:flex md:w-1/2" />
    </div>
  );
}
