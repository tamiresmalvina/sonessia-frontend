import { useState } from "react";
import { Link } from "react-router-dom";

import { authService } from "../../services/auth.service.js";
import { SonessiaLogo } from "../../components/auth/SonessiaLogo.jsx";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [submetendo, setSubmetendo] = useState(false);

  async function handleSubmit(evento) {
    evento.preventDefault();

    setErro("");
    setMensagemSucesso("");

    if (!email.trim()) {
      setErro("Informe o seu e-mail.");
      return;
    }

    setSubmetendo(true);

    try {
      const resposta = await authService.solicitarRecuperacaoSenha(
        email.trim(),
      );

      setMensagemSucesso(
        resposta?.mensagem ||
          "Se o e-mail informado estiver cadastrado e verificado, as instruções para redefinição de senha foram enviadas.",
      );
    } catch (err) {
      setErro(err.message || "Erro ao solicitar a recuperação de senha.");
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
            Recuperar senha
          </h1>

          <p className="text-sm leading-relaxed text-fg-2">
            Informe o e-mail da sua conta para enviarmos o link seguro de redefinição de senha.
          </p>
        </div>

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

        {mensagemSucesso && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800 transition-all dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
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
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
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
              placeholder="Digite seu e-mail cadastrado"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
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
                <span>Enviando instruções...</span>
              </>
            ) : (
              <span>Enviar instruções</span>
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
      </div>
    </main>
  );
}
