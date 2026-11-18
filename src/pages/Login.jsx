import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth.js';
import { SonessiaLogo } from '../components/SonessiaLogo.jsx';
import { PainelVisualSonoro } from '../components/PainelVisualSonoro.jsx';

export function Login() {
  const { login, usuario, estaAutenticado, carregando } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarMe, setLembrarMe] = useState(false);
  const [erro, setErro] = useState('');
  const [emailNaoVerificado, setEmailNaoVerificado] = useState(false);
  const [submetendo, setSubmetendo] = useState(false);

  // Se já estiver autenticado, redireciona diretamente conforme o perfil
  if (!carregando && estaAutenticado && usuario) {
    if (usuario.perfil === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    if (usuario.perfil === 'COMUM') {
      return <Navigate to="/comum" replace />;
    }
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro('');
    setEmailNaoVerificado(false);

    if (!email.trim()) {
      setErro('Informe o seu e-mail.');
      return;
    }

    if (!senha) {
      setErro('A senha é obrigatória.');
      return;
    }

    setSubmetendo(true);

    try {
      const usuarioLogado = await login(email.trim(), senha, lembrarMe);

      if (usuarioLogado?.perfil === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (usuarioLogado?.perfil === 'COMUM') {
        navigate('/comum', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const codigoErro = err?.codigo || '';
      const mensagemErro = err?.message || 'Erro ao realizar login.';
      if (
        codigoErro === 'EMAIL_NAO_VERIFICADO' ||
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
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#FAF8FF]">
      {/* LADO ESQUERDO: Formulário de login */}
      <main className="w-full md:w-1/2 min-h-screen flex flex-col justify-between px-6 sm:px-10 lg:px-16 py-10 sm:py-12 bg-white">
        {/* Topo: Logo oficial da Sonessia */}
        <header className="w-full max-w-[420px] mx-auto">
          <SonessiaLogo />
        </header>

        {/* Centro: Formulário de login centralizado */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8">
          {/* Título e frase de apoio */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#24113D] mb-2">
              Bem-vindo ao Sonessia
            </h1>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
              Entre para criar, personalizar e vivenciar seus ambientes sonoros favoritos.
            </p>
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex flex-col gap-2 transition-all animate-fadeIn"
            >
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
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
                    className="inline-flex items-center gap-1.5 font-bold text-[#6D28D9] hover:text-[#5B21B6] hover:underline cursor-pointer"
                  >
                    <span>Confirmar meu e-mail agora</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Campo de E-mail */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#24113D] mb-2"
              >
                E-mail
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submetendo}
                  required
                  className="w-full px-4 py-3.5 text-base text-[#24113D] bg-white border border-[#E2DCED] rounded-xl placeholder:text-gray-400 focus:outline-none focus:border-[#6D28D9] focus:ring-4 focus:ring-[#8B5CF6]/15 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
            </div>

            {/* Campo de Senha com controle de visualização */}
            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-semibold text-[#24113D] mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={submetendo}
                  required
                  className="w-full pl-4 pr-12 py-3.5 text-base text-[#24113D] bg-white border border-[#E2DCED] rounded-xl placeholder:text-gray-400 focus:outline-none focus:border-[#6D28D9] focus:ring-4 focus:ring-[#8B5CF6]/15 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  disabled={submetendo}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Visualizar senha'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#6D28D9] focus:outline-none focus:text-[#6D28D9] transition-colors cursor-pointer"
                >
                  {mostrarSenha ? (
                    /* Ícone Olho Fechado (Ocultar) */
                    <svg
                      className="w-5 h-5"
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
                    /* Ícone Olho Aberto (Visualizar) */
                    <svg
                      className="w-5 h-5"
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

            {/* Checkbox Lembrar-me e Link Esqueci minha senha */}
            <div className="flex items-center justify-between pt-1">
              <label
                htmlFor="lembrarMe"
                className="inline-flex items-center gap-2.5 text-sm text-gray-600 hover:text-[#24113D] cursor-pointer select-none transition-colors"
              >
                <input
                  id="lembrarMe"
                  type="checkbox"
                  checked={lembrarMe}
                  onChange={(e) => setLembrarMe(e.target.checked)}
                  disabled={submetendo}
                  className="w-4 h-4 rounded text-[#6D28D9] border-gray-300 focus:ring-[#8B5CF6] accent-[#6D28D9] cursor-pointer"
                />
                <span>Lembrar-me</span>
              </label>

              <Link
                to="/recuperar-senha"
                className="text-sm font-semibold text-[#6D28D9] hover:text-[#5B21B6] hover:underline transition-colors"
              >
                Esqueci minha senha?
              </Link>
            </div>

            {/* Botão de envio "Entrar" */}
            <button
              type="submit"
              disabled={submetendo}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] active:bg-[#4C1D95] shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {submetendo ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
          <div className="mt-8 text-center text-sm text-gray-600">
            <span>Não tem uma conta? </span>
            <Link
              to="/cadastro"
              className="font-bold text-[#6D28D9] hover:text-[#5B21B6] hover:underline transition-colors"
            >
              Cadastre-se
            </Link>
          </div>
        </div>

        {/* Rodapé institucional discreto */}
        <footer className="w-full max-w-[420px] mx-auto text-center text-xs text-gray-400 pt-4">
          © {new Date().getFullYear()} Sonessia. Todos os direitos reservados.
        </footer>
      </main>

      {/* LADO DIREITO: Painel visual reservado para ambientação sonora e futura imagem */}
      <PainelVisualSonoro className="hidden md:flex md:w-1/2 min-h-screen" />
    </div>
  );
}
