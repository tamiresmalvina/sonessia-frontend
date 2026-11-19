import { useState, useEffect, useRef } from "react";
import {
  useNavigate,
  useLocation,
  useSearchParams,
  Link,
  Navigate,
} from "react-router-dom";
import { useAuth } from "../../contexts/useAuth.js";
import { authService } from "../../services/auth.service.js";
import { SonessiaLogo } from "../../components/auth/SonessiaLogo.jsx";
import { PainelVisualSonoro } from "../../components/auth/PainelVisualSonoro.jsx";

export default function ConfirmarEmail() {
  const { usuario, estaAutenticado, carregando } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Obtém o e-mail passado por state (navegação do cadastro) ou query string (?email=...)
  const emailInicial = location.state?.email || searchParams.get("email") || "";
  const [email, setEmail] = useState(emailInicial);
  const [editandoEmail, setEditandoEmail] = useState(!emailInicial);

  const [codigo, setCodigo] = useState("");
  const [submetendo, setSubmetendo] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagemReenvio, setMensagemReenvio] = useState("");
  const [confirmado, setConfirmado] = useState(false);

  // Controle de cooldown do reenvio de código (60 segundos)
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setTimeout(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cooldown]);

  // Se já estiver autenticado e com e-mail verificado, redireciona
  if (!carregando && estaAutenticado && usuario) {
    return (
      <Navigate to={usuario.perfil === "ADMIN" ? "/admin" : "/comum"} replace />
    );
  }

  function handleCodigoChange(e) {
    // Permite apenas números e limita a 6 dígitos
    const apenasNumeros = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCodigo(apenasNumeros);
    if (erro) setErro("");
  }

  async function handleVerificar(e) {
    e.preventDefault();
    setErro("");
    setMensagemReenvio("");

    const emailLimpo = email.trim().toLowerCase();
    const codigoLimpo = codigo.trim();

    if (!emailLimpo) {
      setErro("Informe o endereço de e-mail cadastrado.");
      return;
    }

    if (codigoLimpo.length !== 6) {
      setErro("O código de confirmação deve conter exatamente 6 dígitos.");
      return;
    }

    setSubmetendo(true);

    try {
      await authService.verificarEmail(emailLimpo, codigoLimpo);
      setConfirmado(true);
    } catch (err) {
      if (err?.codigo === "EMAIL_JA_VERIFICADO") {
        setConfirmado(true);
      } else {
        setErro(err.message || "Código de verificação incorreto ou expirado.");
      }
    } finally {
      setSubmetendo(false);
    }
  }

  async function handleReenviarCodigo() {
    if (cooldown > 0 || reenviando) return;

    const emailLimpo = email.trim().toLowerCase();
    if (!emailLimpo) {
      setErro("Informe o endereço de e-mail para receber um novo código.");
      return;
    }

    setErro("");
    setMensagemReenvio("");
    setReenviando(true);

    try {
      const resposta = await authService.reenviarCodigo(emailLimpo);
      setMensagemReenvio(
        resposta?.mensagem ||
          "Um novo código de 6 dígitos foi enviado para o seu e-mail.",
      );
      setCooldown(60);
    } catch (err) {
      if (err?.status === 429) {
        const matchSegundos = /(\d+)\s*segundos/i.exec(err.message);
        const segundos = matchSegundos ? Number(matchSegundos[1]) : 60;
        setCooldown(segundos);
        setErro(err.message);
      } else if (err?.codigo === "EMAIL_JA_VERIFICADO") {
        setConfirmado(true);
      } else {
        setErro(
          err.message ||
            "Não foi possível reenviar o código agora. Tente novamente mais tarde.",
        );
      }
    } finally {
      setReenviando(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-bg text-fg md:flex-row">
      {/* LADO ESQUERDO: Conteúdo de Confirmação */}
      <main className="flex min-h-screen w-full flex-col justify-between border-line-subtle bg-surface px-6 py-10 sm:px-10 sm:py-12 md:w-1/2 md:border-r lg:px-16">
        {/* Topo: Logo oficial da Sonessia */}
        <header className="mx-auto w-full max-w-[420px]">
          <Link
            to="/"
            className="inline-block transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-lg"
          >
            <SonessiaLogo />
          </Link>
        </header>

        {/* Centro: Formulário de Confirmação ou Tela de Sucesso */}
        <div className="mx-auto my-auto w-full max-w-[420px] py-8">
          {confirmado ? (
            /* VISUALIZAÇÃO DE SUCESSO: E-mail confirmado */
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="mb-3 text-2xl font-bold tracking-[-0.03em] text-fg sm:text-3xl">
                E-mail confirmado com sucesso!
              </h1>

              <p className="mb-8 text-sm leading-relaxed text-fg-2 sm:text-base">
                Sua conta Sonessia está pronta. Agora você já pode entrar e aproveitar sua experiência sonora.
              </p>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:bg-[image:linear-gradient(100deg,#684a98,#5667b8)] hover:shadow active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              >
                Ir para o login
              </button>
            </div>
          ) : (
            /* FORMULÁRIO DE INSERÇÃO DO CÓDIGO DE 6 DÍGITOS */
            <>
              <div className="mb-8">
                <h1 className="mb-2 text-2xl font-bold tracking-[-0.03em] text-fg sm:text-3xl">
                  Verifique seu e-mail
                </h1>
                <p className="text-sm leading-relaxed text-fg-2 sm:text-base">
                  Enviamos um código de confirmação de 6 dígitos para o seu endereço de e-mail. Digite o código abaixo para ativar sua conta.
                </p>
              </div>

              {/* Mensagem de erro */}
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

              <form onSubmit={handleVerificar} noValidate className="space-y-5">
                {/* Visualização e edição do e-mail destino */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="emailVerificacao"
                      className="block text-sm font-medium text-fg"
                    >
                      E-mail da conta
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditandoEmail((v) => !v)}
                      className="cursor-pointer text-xs font-semibold text-accent transition-colors hover:text-accent-hover hover:underline"
                    >
                      {editandoEmail ? "Concluir" : "Alterar e-mail"}
                    </button>
                  </div>
                  {editandoEmail ? (
                    <input
                      id="emailVerificacao"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com"
                      disabled={submetendo}
                      className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-fg transition-all placeholder:text-fg-disabled focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20"
                    />
                  ) : (
                    <div className="flex w-full items-center justify-between rounded-xl border border-line-subtle bg-bg-2 px-4 py-3 text-sm font-medium text-fg">
                      <span className="truncate">
                        {email || "E-mail não informado"}
                      </span>
                      <svg
                        className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Campo do Código de Verificação (6 Dígitos) */}
                <div>
                  <label
                    htmlFor="codigo"
                    className="mb-1.5 block text-sm font-medium text-fg"
                  >
                    Código de 6 dígitos
                  </label>
                  <input
                    id="codigo"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={codigo}
                    onChange={handleCodigoChange}
                    disabled={submetendo}
                    autoFocus
                    required
                    className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-center font-mono text-2xl tracking-[0.4em] text-fg transition-all placeholder:text-fg-disabled focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 disabled:cursor-not-allowed disabled:bg-bg-2 sm:tracking-[0.6em]"
                  />
                  <p className="mt-1.5 text-center text-xs text-fg-3">
                    Insira o código de 6 números enviado para a sua caixa de entrada.
                  </p>
                </div>

                {/* Botão de Envio "Confirmar e-mail" */}
                <button
                  type="submit"
                  disabled={submetendo || codigo.length !== 6}
                  className="mt-4 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:bg-[image:linear-gradient(100deg,#684a98,#5667b8)] hover:shadow active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <span>Confirmar e-mail</span>
                  )}
                </button>
              </form>

              {/* Seção de Reenvio de Código com Cooldown */}
              <div className="mt-6 flex flex-col items-center gap-2 border-t border-line-subtle pt-6 text-center">
                <span className="text-sm text-fg-3">
                  Não recebeu o código?
                </span>
                <button
                  type="button"
                  onClick={handleReenviarCodigo}
                  disabled={cooldown > 0 || reenviando || submetendo}
                  className="cursor-pointer text-sm font-semibold text-accent transition-colors hover:text-accent-hover hover:underline disabled:cursor-not-allowed disabled:text-fg-disabled disabled:no-underline"
                >
                  {reenviando
                    ? "Reenviando..."
                    : cooldown > 0
                      ? `Reenviar novo código (${cooldown}s)`
                      : "Reenviar código"}
                </button>
                {mensagemReenvio && !erro && (
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {mensagemReenvio}
                  </p>
                )}
              </div>

              {/* Links de navegação secundária */}
              <div className="mt-8 flex justify-center gap-4 text-center text-sm text-fg-2">
                <Link
                  to="/cadastro"
                  className="font-medium text-fg-3 transition-colors hover:text-fg hover:underline"
                >
                  Voltar ao cadastro
                </Link>
                <span className="text-fg-disabled">•</span>
                <Link
                  to="/login"
                  className="font-semibold text-accent transition-colors hover:text-accent-hover hover:underline"
                >
                  Ir para o login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Rodapé institucional discreto */}
        <footer className="mx-auto w-full max-w-[420px] pt-4 text-center text-xs text-fg-3">
          © {new Date().getFullYear()} Sonessia. Todos os direitos reservados.
        </footer>
      </main>

      {/* LADO DIREITO: Mesmo painel visual sonoro */}
      <PainelVisualSonoro className="hidden min-h-screen md:flex md:w-1/2" />
    </div>
  );
}
