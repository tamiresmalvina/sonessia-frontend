import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth.js";
import { authService } from "../../services/auth.service.js";
import { SonessiaLogo } from "../../components/auth/SonessiaLogo.jsx";
import { PainelVisualSonoro } from "../../components/auth/PainelVisualSonoro.jsx";
import {
  validarIdade,
  calcularDataMaxima16Anos,
} from "../../utils/validacoes.js";

export default function Cadastro() {
  const { usuario, estaAutenticado, carregando } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [dataNascimentoTocou, setDataNascimentoTocou] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [erro, setErro] = useState("");
  const [submetendo, setSubmetendo] = useState(false);

  // Calcula a data máxima recomendada no seletor HTML (16 anos atrás a contar de hoje)
  const dataMaxPermitida = calcularDataMaxima16Anos();

  // Validação dinâmica da data de nascimento
  const resultadoIdade = validarIdade(dataNascimento);
  const mostrarErroIdade = dataNascimentoTocou && !resultadoIdade.valido;

  // Se já estiver autenticado, redireciona para a área correspondente
  if (!carregando && estaAutenticado && usuario) {
    if (usuario.perfil === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    if (usuario.perfil === "COMUM") {
      return <Navigate to="/comum" replace />;
    }
  }

  function validarFormulario() {
    setErro("");

    if (!nome.trim() || nome.trim().length < 2) {
      setErro("O nome deve ter no mínimo 2 caracteres.");
      return false;
    }

    if (!email.trim()) {
      setErro("Informe o seu e-mail.");
      return false;
    }

    // Se o usuário tentar enviar sem preencher ou com idade inválida, ativa a validação inline da idade
    if (!resultadoIdade.valido) {
      setDataNascimentoTocou(true);
      return false;
    }

    if (!senha) {
      setErro("A senha é obrigatória.");
      return false;
    }

    if (senha.length < 8) {
      setErro("A senha deve ter no mínimo 8 caracteres.");
      return false;
    }

    if (!/\p{Lu}/u.test(senha)) {
      setErro("A senha deve conter pelo menos uma letra maiúscula.");
      return false;
    }

    if (!/\p{Ll}/u.test(senha)) {
      setErro("A senha deve conter pelo menos uma letra minúscula.");
      return false;
    }

    if (!/[0-9]/.test(senha)) {
      setErro("A senha deve conter pelo menos um número.");
      return false;
    }

    if (!/[\p{P}\p{S}]/u.test(senha)) {
      setErro("A senha deve conter pelo menos um símbolo.");
      return false;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas informadas não coincidem.");
      return false;
    }

    return true;
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro("");

    if (!validarFormulario()) {
      return;
    }

    setSubmetendo(true);

    const emailNormalizado = email.trim().toLowerCase();
    const nomeNormalizado = nome.trim();

    try {
      const payload = {
        nome: nomeNormalizado,
        email: emailNormalizado,
        senha,
        dataNascimento,
      };

      const resposta = await authService.cadastrar(payload);

      // Transiciona para a confirmação de e-mail
      navigate("/confirmar-email", {
        state: {
          email: emailNormalizado,
          nome: nomeNormalizado,
          mensagem: resposta?.mensagem,
        },
      });
    } catch (err) {
      // Se o backend retornou detalhe específico de data de nascimento, reflete no campo
      if (
        err?.detalhes?.some((d) => d.campo === "dataNascimento") ||
        (err?.message && /16 anos|nascimento/i.test(err.message))
      ) {
        setDataNascimentoTocou(true);
      } else {
        setErro(err.message || "Erro ao realizar cadastro.");
      }
    } finally {
      setSubmetendo(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-bg text-fg md:flex-row">
      {/* LADO ESQUERDO: Formulário de cadastro */}
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

        {/* Centro: Formulário de cadastro */}
        <div className="mx-auto my-auto w-full max-w-[420px] py-8">
          {/* Título e frase de apoio */}
          <div className="mb-8">
            <h1 className="mb-2 text-2xl font-bold tracking-[-0.03em] text-fg sm:text-3xl">
              Crie sua conta
            </h1>
            <p className="text-sm leading-relaxed text-fg-2 sm:text-base">
              Comece sua experiência sonora com o Sonessia.
            </p>
          </div>

          {/* Mensagem de erro geral da API */}
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

          {/* Formulário de Cadastro */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Campo de Nome */}
            <div>
              <label
                htmlFor="nome"
                className="mb-1.5 block text-sm font-medium text-fg"
              >
                Nome completo
              </label>
              <input
                id="nome"
                type="text"
                autoComplete="name"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={submetendo}
                required
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-fg transition-all placeholder:text-fg-disabled focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 disabled:cursor-not-allowed disabled:bg-bg-2"
              />
            </div>

            {/* Campo de E-mail */}
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
                onChange={(e) => setEmail(e.target.value)}
                disabled={submetendo}
                required
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-fg transition-all placeholder:text-fg-disabled focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 disabled:cursor-not-allowed disabled:bg-bg-2"
              />
            </div>

            {/* Campo de Data de Nascimento com Validação Inline */}
            <div>
              <label
                htmlFor="dataNascimento"
                className="mb-1.5 block text-sm font-medium text-fg"
              >
                Data de nascimento
              </label>
              <input
                id="dataNascimento"
                type="date"
                max={dataMaxPermitida}
                min="1900-01-01"
                value={dataNascimento}
                onChange={(e) => {
                  setDataNascimento(e.target.value);
                  setDataNascimentoTocou(true);
                }}
                onBlur={() => setDataNascimentoTocou(true)}
                disabled={submetendo}
                required
                aria-invalid={mostrarErroIdade}
                aria-describedby={
                  mostrarErroIdade ? "erro-idade" : "ajuda-idade"
                }
                className={`w-full rounded-xl px-4 py-3 text-base transition-all placeholder:text-fg-disabled focus:outline-none disabled:cursor-not-allowed disabled:bg-bg-2 ${
                  mostrarErroIdade
                    ? "border border-rose-400 bg-rose-50/20 text-fg focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-800"
                    : "border border-line bg-surface text-fg focus:border-focus focus:ring-2 focus:ring-focus/20"
                }`}
              />

              {mostrarErroIdade ? (
                <p
                  id="erro-idade"
                  role="alert"
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  <svg
                    className="h-4 w-4 shrink-0 text-rose-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{resultadoIdade.erro}</span>
                </p>
              ) : (
                <p id="ajuda-idade" className="mt-1.5 text-xs text-fg-3">
                  Você deve ter pelo menos 16 anos para se cadastrar.
                </p>
              )}
            </div>

            {/* Campo de Senha com controle de visualização */}
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
                  autoComplete="new-password"
                  placeholder="Crie uma senha forte"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={submetendo}
                  required
                  className="w-full rounded-xl border border-line bg-surface py-3 pl-4 pr-12 text-base text-fg transition-all placeholder:text-fg-disabled focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 disabled:cursor-not-allowed disabled:bg-bg-2"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
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
              <p className="mt-1 text-xs text-fg-3">
                Mínimo 8 caracteres, com maiúsculas, minúsculas, números e símbolos.
              </p>
            </div>

            {/* Campo de Confirmação de Senha */}
            <div>
              <label
                htmlFor="confirmarSenha"
                className="mb-1.5 block text-sm font-medium text-fg"
              >
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="confirmarSenha"
                  type={mostrarConfirmarSenha ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repita sua senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  disabled={submetendo}
                  required
                  className="w-full rounded-xl border border-line bg-surface py-3 pl-4 pr-12 text-base text-fg transition-all placeholder:text-fg-disabled focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 disabled:cursor-not-allowed disabled:bg-bg-2"
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmarSenha((v) => !v)}
                  disabled={submetendo}
                  aria-label={
                    mostrarConfirmarSenha
                      ? "Ocultar confirmação de senha"
                      : "Visualizar confirmação de senha"
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 text-icon-muted transition-colors hover:text-fg focus:outline-none"
                >
                  {mostrarConfirmarSenha ? (
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

            {/* Botão de envio "Criar conta" */}
            <button
              type="submit"
              disabled={submetendo}
              className="mt-4 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:bg-[image:linear-gradient(100deg,#684a98,#5667b8)] hover:shadow active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
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
                  <span>Criando conta...</span>
                </>
              ) : (
                <span>Criar conta</span>
              )}
            </button>
          </form>

          {/* Link para voltar ao Login */}
          <div className="mt-8 text-center text-sm text-fg-2">
            <span>Já tem uma conta? </span>
            <Link
              to="/login"
              className="font-semibold text-accent transition-colors hover:text-accent-hover hover:underline"
            >
              Entrar
            </Link>
          </div>
        </div>

        {/* Rodapé institucional discreto */}
        <footer className="mx-auto w-full max-w-[420px] pt-4 text-center text-xs text-fg-3">
          © {new Date().getFullYear()} Sonessia. Todos os direitos reservados.
        </footer>
      </main>

      {/* LADO DIREITO: Mesmo painel visual sonoro da tela de login */}
      <PainelVisualSonoro
        variante="login"
        titulo="Crie seu refúgio sonoro sob medida."
        descricao="Cadastre-se para explorar experiências sonoras que acompanham você em cada momento da sua rotina."
        className="hidden min-h-screen md:flex md:w-1/2"
      />
    </div>
  );
}
