import { useEffect, useState } from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, LoaderCircle } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../contexts/useAuth.js";
import { SonessiaLogo } from "../../components/auth/SonessiaLogo.jsx";
import { PainelVisualSonoro } from "../../components/auth/PainelVisualSonoro.jsx";
import { authService } from "../../services/auth.service.js";

function formatarDataExclusao(valor) {
  const data = new Date(valor);
  if (!valor || Number.isNaN(data.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long", timeStyle: "short", timeZone: "America/Sao_Paulo",
  }).format(data);
}

function obterDataPendente(erro) {
  if (!Array.isArray(erro?.detalhes)) return null;
  const detalhe = erro.detalhes.find((item) => item && typeof item === "object" && typeof item.exclusaoDefinitivaEm === "string");
  return detalhe?.exclusaoDefinitivaEm || null;
}

export default function Login() {
  const { login, usuario, estaAutenticado, carregando } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [avisoRecuperacao] = useState(() => searchParams.get("recuperarConta") === "1");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState(
    location.state?.mensagem || "",
  );
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarMe, setLembrarMe] = useState(false);
  const [erro, setErro] = useState("");
  const [emailNaoVerificado, setEmailNaoVerificado] = useState(false);
  const [submetendo, setSubmetendo] = useState(false);
  const [contaPendente, setContaPendente] = useState(null);
  const [confirmandoReativacao, setConfirmandoReativacao] = useState(false);
  const [resultadoReativacao, setResultadoReativacao] = useState(false);
  const [erroReativacao, setErroReativacao] = useState("");

  useEffect(() => {
    if (!searchParams.has("recuperarConta")) return;
    const parametros = new URLSearchParams(searchParams);
    parametros.delete("recuperarConta");
    setSearchParams(parametros, { replace: true });
  }, [searchParams, setSearchParams]);

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
    setMensagemSucesso("");
    setContaPendente(null);
    setResultadoReativacao(false);
    setErroReativacao("");

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
      if (err?.codigo === "CONTA_EXCLUSAO_PENDENTE") {
        setContaPendente({ exclusaoDefinitivaEm: obterDataPendente(err) });
        setConfirmandoReativacao(false);
        setErro("");
        return;
      }
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

  async function reativarConta() {
    if (submetendo) return;
    setSubmetendo(true);
    setErroReativacao("");
    try {
      await authService.reativarConta(email.trim(), senha);
      // A API mantém resposta neutra; sucesso real só é confirmado por uma nova tentativa de login.
      setResultadoReativacao(true);
      setConfirmandoReativacao(false);
    } catch (falha) {
      setErroReativacao(!falha?.status
        ? "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente."
        : falha.status === 429
          ? "Muitas tentativas. Aguarde um pouco antes de tentar novamente."
          : "Não foi possível enviar a solicitação agora. Tente novamente.");
    } finally {
      setSubmetendo(false);
    }
  }

  async function tentarLoginNovamente() {
    setContaPendente(null);
    setResultadoReativacao(false);
    setConfirmandoReativacao(false);
    await handleSubmit({ preventDefault() {} });
  }

  if (contaPendente) {
    const dataFormatada = formatarDataExclusao(contaPendente.exclusaoDefinitivaEm);
    return (
      <div className="flex min-h-screen w-full flex-col bg-bg text-fg md:flex-row">
        <main className="flex min-h-screen w-full flex-col justify-between border-line-subtle bg-surface px-6 py-10 sm:px-10 sm:py-12 md:w-1/2 md:border-r lg:px-16">
          <header className="mx-auto w-full max-w-[420px]"><Link to="/" className="inline-block rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"><SonessiaLogo /></Link></header>
          <section className="mx-auto my-auto w-full max-w-[460px] py-8" aria-labelledby="conta-pendente-titulo">
            {resultadoReativacao ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200 sm:p-7">
                <CheckCircle2 size={25} aria-hidden="true" />
                <h1 id="conta-pendente-titulo" className="mt-4 text-2xl font-bold tracking-[-0.03em]">Solicitação de reativação enviada</h1>
                <p className="mt-3 text-sm leading-relaxed">Se sua conta estava elegível para recuperação, a solicitação foi processada. Tente entrar novamente para confirmar e acessar sua conta.</p>
                <button type="button" onClick={tentarLoginNovamente} disabled={submetendo} className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-on-accent hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:opacity-60">
                  {submetendo && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}Tentar entrar novamente
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-300/70 bg-surface p-5 shadow-sm sm:p-7">
                <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"><AlertTriangle size={20} aria-hidden="true" /></span><div><h1 id="conta-pendente-titulo" className="text-xl font-bold tracking-[-0.03em] text-fg sm:text-2xl">Sua conta possui uma exclusão agendada</h1><p className="mt-2 text-sm leading-relaxed text-fg-2">Sua conta está desativada temporariamente e ainda pode ser recuperada.</p></div></div>
                {dataFormatada ? <div className="mt-5 rounded-xl bg-bg-2 p-4"><p className="flex items-center gap-2 text-sm font-medium text-fg-2"><CalendarClock size={17} aria-hidden="true" />Sua conta será excluída definitivamente em:</p><p className="mt-2 font-semibold text-fg">{dataFormatada}</p><p className="mt-1 text-xs text-fg-3">Horário de Brasília</p></div> : <p className="mt-5 rounded-xl bg-bg-2 p-4 text-sm text-fg-2">Não foi possível obter a data de exclusão. A conta ainda possui uma solicitação pendente.</p>}
                <p className="mt-5 text-sm leading-relaxed text-fg-2">Deseja cancelar a exclusão e voltar a utilizar o Sonessia?</p>
                {confirmandoReativacao ? (
                  <div className="mt-5 rounded-xl border border-line-subtle bg-bg-2 p-4" role="group" aria-label="Confirmar reativação da conta">
                    <p className="text-sm font-medium text-fg">Confirmar reativação da conta?</p>
                    <p className="mt-1 text-xs leading-relaxed text-fg-3">A solicitação de exclusão será cancelada. Você precisará entrar novamente para acessar o Sonessia.</p>
                    {erroReativacao && <p role="alert" className="mt-3 text-sm text-danger">{erroReativacao}</p>}
                    <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
                      <button type="button" disabled={submetendo} onClick={() => { setConfirmandoReativacao(false); setErroReativacao(""); }} className="min-h-10 flex-1 rounded-xl border border-line px-4 text-sm font-medium text-fg-2 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50">Voltar</button>
                      <button type="button" disabled={submetendo} onClick={reativarConta} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60">{submetendo && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}Confirmar reativação</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 flex flex-col gap-3">
                    <button type="button" onClick={() => setConfirmandoReativacao(true)} className="min-h-11 rounded-xl bg-accent px-5 text-sm font-semibold text-on-accent hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2">Reativar minha conta</button>
                    <button type="button" onClick={() => { setContaPendente(null); setSenha(""); setErro(""); }} className="min-h-11 rounded-xl border border-line px-5 text-sm font-medium text-fg-2 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">Manter exclusão agendada</button>
                  </div>
                )}
                <p className="mt-5 text-xs text-fg-3">Conta: <span className="break-all">{email}</span></p>
              </div>
            )}
          </section>
          <footer className="mx-auto w-full max-w-[420px] pt-4 text-center text-xs text-fg-3">© {new Date().getFullYear()} Sonessia. Todos os direitos reservados.</footer>
        </main>
        <PainelVisualSonoro variante="login" className="hidden min-h-screen md:flex md:w-1/2" />
      </div>
    );
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

          {avisoRecuperacao && (
            <div role="status" className="mb-6 rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm leading-relaxed text-fg-2">
              Você acessou o login para recuperar uma conta com exclusão pendente. O link não reativa a conta automaticamente. Informe seu e-mail e senha para continuar.
            </div>
          )}

          {/* Mensagem de erro */}
          {mensagemSucesso && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
            >
              {mensagemSucesso}
            </div>
          )}

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
      <PainelVisualSonoro variante="login" className="hidden min-h-screen md:flex md:w-1/2" />
    </div>
  );
}
