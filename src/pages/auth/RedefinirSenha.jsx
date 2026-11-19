import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { authService } from "../../services/auth.service.js";
import { SonessiaLogo } from "../../components/auth/SonessiaLogo.jsx";

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [submetendo, setSubmetendo] = useState(false);

  async function handleSubmit(evento) {
    evento.preventDefault();

    setErro("");
    setMensagemSucesso("");

    if (!token) {
      setErro("Token de recuperação não informado ou link inválido.");
      return;
    }

    if (!novaSenha) {
      setErro("A nova senha é obrigatória.");
      return;
    }

    if (novaSenha.length < 8) {
      setErro("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas informadas não coincidem.");
      return;
    }

    setSubmetendo(true);

    try {
      const resposta = await authService.redefinirSenha(token, novaSenha);

      setMensagemSucesso(
        resposta?.mensagem ||
          "Senha redefinida com sucesso. Faça login com a nova senha.",
      );
    } catch (err) {
      setErro(err.message || "Erro ao redefinir a senha.");
    } finally {
      setSubmetendo(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-bg text-fg px-4 py-12">
      <div className="w-full max-w-[440px] rounded-2xl border border-line-subtle bg-surface p-8 shadow-sm sm:p-10 transition-all">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="mb-6 inline-block transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-lg"
          >
            <SonessiaLogo className="justify-center" />
          </Link>

          <h1 className="mb-2 text-2xl font-bold tracking-[-0.03em] text-fg">
            Redefinir senha
          </h1>

          <p className="text-sm leading-relaxed text-fg-2">
            Crie uma nova senha para acessar sua conta Sonessia.
          </p>
        </div>

        {!token ? (
          <div>
            <div
              role="alert"
              className="mb-6 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
            >
              Token de recuperação ausente ou link inválido. Solicite um novo link por e-mail.
            </div>

            <div className="space-y-3 text-center text-sm">
              <Link
                to="/recuperar-senha"
                className="block font-semibold text-accent transition-colors hover:text-accent-hover hover:underline"
              >
                Solicitar nova recuperação
              </Link>

              <Link
                to="/login"
                className="block text-fg-3 transition-colors hover:text-fg"
              >
                Voltar ao login
              </Link>
            </div>
          </div>
        ) : mensagemSucesso ? (
          <div>
            <div
              role="status"
              className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
            >
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-medium leading-relaxed">
                {mensagemSucesso}
              </span>
            </div>

            <Link
              to="/login"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] px-6 py-3 text-center font-medium text-white shadow-sm transition-all duration-200 hover:bg-[image:linear-gradient(100deg,#684a98,#5667b8)] hover:shadow active:scale-[0.99]"
            >
              Ir para o Login
            </Link>
          </div>
        ) : (
          <>
            {erro && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 transition-all dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
              >
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
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label
                  htmlFor="novaSenha"
                  className="mb-1.5 block text-sm font-medium text-fg"
                >
                  Nova senha
                </label>

                <div className="relative">
                  <input
                    id="novaSenha"
                    type={mostrarSenha ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    value={novaSenha}
                    onChange={(evento) => setNovaSenha(evento.target.value)}
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 text-icon-muted transition-colors hover:text-fg focus:outline-none"
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

                <p className="mt-1.5 text-xs text-fg-3">
                  Utilize pelo menos 8 caracteres.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmarSenha"
                  className="mb-1.5 block text-sm font-medium text-fg"
                >
                  Confirmar nova senha
                </label>

                <input
                  id="confirmarSenha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repita a nova senha"
                  value={confirmarSenha}
                  onChange={(evento) => setConfirmarSenha(evento.target.value)}
                  disabled={submetendo}
                  required
                  className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-fg transition-all placeholder:text-fg-disabled focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 disabled:cursor-not-allowed disabled:bg-bg-2"
                />
              </div>

              <button
                type="submit"
                disabled={submetendo}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:bg-[image:linear-gradient(100deg,#684a98,#5667b8)] hover:shadow active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submetendo ? (
                  <>
                    <svg
                      className="-ml-1 mr-2 h-5 w-5 animate-spin text-white"
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
                    <span>Redefinindo...</span>
                  </>
                ) : (
                  <span>Redefinir senha</span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <Link
                to="/login"
                className="font-medium text-accent transition-colors hover:text-accent-hover hover:underline"
              >
                ← Voltar para o login
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
