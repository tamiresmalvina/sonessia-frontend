import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth.js';
import { authService } from '../services/auth.service.js';
import { SonessiaLogo } from '../components/SonessiaLogo.jsx';
import { PainelVisualSonoro } from '../components/PainelVisualSonoro.jsx';

export function ConfirmarEmail() {
  const { usuario, estaAutenticado, carregando } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Obtém o e-mail passado por state (navegação do cadastro) ou query string (?email=...)
  const emailInicial = location.state?.email || searchParams.get('email') || '';
  const [email, setEmail] = useState(emailInicial);
  const [editandoEmail, setEditandoEmail] = useState(!emailInicial);

  const [codigo, setCodigo] = useState('');
  const [submetendo, setSubmetendo] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const [erro, setErro] = useState('');
  const [mensagemReenvio, setMensagemReenvio] = useState('');
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
    if (usuario.perfil === 'ADMIN') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/comum', { replace: true });
    }
  }

  function handleCodigoChange(e) {
    // Permite apenas números e limita a 6 dígitos
    const apenasNumeros = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCodigo(apenasNumeros);
    if (erro) setErro('');
  }

  async function handleVerificar(e) {
    e.preventDefault();
    setErro('');
    setMensagemReenvio('');

    const emailLimpo = email.trim().toLowerCase();
    const codigoLimpo = codigo.trim();

    if (!emailLimpo) {
      setErro('Informe o endereço de e-mail cadastrado.');
      return;
    }

    if (codigoLimpo.length !== 6) {
      setErro('O código de confirmação deve conter exatamente 6 dígitos.');
      return;
    }

    setSubmetendo(true);

    try {
      await authService.verificarEmail(emailLimpo, codigoLimpo);
      setConfirmado(true);
    } catch (err) {
      if (err?.codigo === 'EMAIL_JA_VERIFICADO') {
        setConfirmado(true);
      } else {
        setErro(err.message || 'Código de verificação incorreto ou expirado.');
      }
    } finally {
      setSubmetendo(false);
    }
  }

  async function handleReenviarCodigo() {
    if (cooldown > 0 || reenviando) return;

    const emailLimpo = email.trim().toLowerCase();
    if (!emailLimpo) {
      setErro('Informe o endereço de e-mail para receber um novo código.');
      return;
    }

    setErro('');
    setMensagemReenvio('');
    setReenviando(true);

    try {
      const resposta = await authService.reenviarCodigo(emailLimpo);
      setMensagemReenvio(
        resposta?.mensagem || 'Um novo código de 6 dígitos foi enviado para o seu e-mail.'
      );
      setCooldown(60);
    } catch (err) {
      if (err?.status === 429) {
        // Extrai segundos da mensagem se disponível (ex: "Aguarde 45 segundos...")
        const matchSegundos = /(\d+)\s*segundos/i.exec(err.message);
        const segundos = matchSegundos ? Number(matchSegundos[1]) : 60;
        setCooldown(segundos);
        setErro(err.message);
      } else if (err?.codigo === 'EMAIL_JA_VERIFICADO') {
        setConfirmado(true);
      } else {
        setErro(err.message || 'Não foi possível reenviar o código agora. Tente novamente mais tarde.');
      }
    } finally {
      setReenviando(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#FAF8FF]">
      {/* LADO ESQUERDO: Conteúdo de Confirmação */}
      <main className="w-full md:w-1/2 min-h-screen flex flex-col justify-between px-6 sm:px-10 lg:px-16 py-10 sm:py-12 bg-white">
        {/* Topo: Logo oficial da Sonessia */}
        <header className="w-full max-w-[420px] mx-auto">
          <SonessiaLogo />
        </header>

        {/* Centro: Formulário de Confirmação ou Tela de Sucesso */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8">
          {confirmado ? (
            /* VISUALIZAÇÃO DE SUCESSO: E-mail confirmado */
            <div className="text-center animate-fadeIn">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
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

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#24113D] mb-3">
                E-mail confirmado com sucesso!
              </h1>

              <p className="text-sm sm:text-base text-gray-500 mb-8 leading-relaxed">
                Sua conta Sonessia está pronta. Agora você já pode entrar e aproveitar sua
                experiência sonora.
              </p>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] active:bg-[#4C1D95] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                Ir para o login
              </button>
            </div>
          ) : (
            /* FORMULÁRIO DE INSERÇÃO DO CÓDIGO DE 6 DÍGITOS */
            <>
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#24113D] mb-2">
                  Verifique seu e-mail
                </h1>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                  Enviamos um código de confirmação de 6 dígitos para o seu endereço de e-mail.
                  Digite o código abaixo para ativar sua conta.
                </p>
              </div>

              {/* Mensagem de erro */}
              {erro && (
                <div
                  role="alert"
                  className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3 transition-all animate-fadeIn"
                >
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
              )}

              <form onSubmit={handleVerificar} noValidate className="space-y-5">
                {/* Visualização e edição do e-mail destino */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="emailVerificacao"
                      className="block text-sm font-semibold text-[#24113D]"
                    >
                      E-mail da conta
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditandoEmail((v) => !v)}
                      className="text-xs font-semibold text-[#6D28D9] hover:text-[#5B21B6] hover:underline cursor-pointer"
                    >
                      {editandoEmail ? 'Concluir' : 'Alterar e-mail'}
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
                      className="w-full px-4 py-3 text-base text-[#24113D] bg-white border border-[#E2DCED] rounded-xl placeholder:text-gray-400 focus:outline-none focus:border-[#6D28D9] focus:ring-4 focus:ring-[#8B5CF6]/15 transition-all"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-purple-50/50 border border-purple-100 rounded-xl flex items-center justify-between">
                      <span className="truncate">{email || 'E-mail não informado'}</span>
                      <svg
                        className="w-4 h-4 text-emerald-600 flex-shrink-0"
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
                    className="block text-sm font-semibold text-[#24113D] mb-1.5"
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
                    className="w-full py-3.5 px-4 text-center font-mono text-2xl tracking-[0.4em] sm:tracking-[0.6em] text-[#24113D] bg-white border border-[#E2DCED] rounded-xl placeholder:text-gray-300 focus:outline-none focus:border-[#6D28D9] focus:ring-4 focus:ring-[#8B5CF6]/15 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  />
                  <p className="mt-1.5 text-xs text-gray-500 text-center">
                    Insira o código de 6 números enviado para a sua caixa de entrada.
                  </p>
                </div>

                {/* Botão de Envio "Confirmar e-mail" */}
                <button
                  type="submit"
                  disabled={submetendo || codigo.length !== 6}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] active:bg-[#4C1D95] shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-4"
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
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <span>Confirmar e-mail</span>
                  )}
                </button>
              </form>

              {/* Seção de Reenvio de Código com Cooldown */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col items-center gap-2 text-center">
                <span className="text-sm text-gray-500">Não recebeu o código?</span>
                <button
                  type="button"
                  onClick={handleReenviarCodigo}
                  disabled={cooldown > 0 || reenviando || submetendo}
                  className="text-sm font-bold text-[#6D28D9] hover:text-[#5B21B6] disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {reenviando
                    ? 'Reenviando...'
                    : cooldown > 0
                    ? `Reenviar novo código (${cooldown}s)`
                    : 'Reenviar código'}
                </button>
                {mensagemReenvio && !erro && (
                  <p className="text-xs font-medium text-emerald-600 animate-fadeIn">
                    {mensagemReenvio}
                  </p>
                )}
              </div>

              {/* Links de navegação secundária */}
              <div className="mt-8 text-center text-sm text-gray-600 flex justify-center gap-4">
                <Link
                  to="/cadastro"
                  className="font-medium text-gray-500 hover:text-[#6D28D9] hover:underline transition-colors"
                >
                  Voltar ao cadastro
                </Link>
                <span className="text-gray-300">•</span>
                <Link
                  to="/login"
                  className="font-bold text-[#6D28D9] hover:text-[#5B21B6] hover:underline transition-colors"
                >
                  Ir para o login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Rodapé institucional discreto */}
        <footer className="w-full max-w-[420px] mx-auto text-center text-xs text-gray-400 pt-4">
          © {new Date().getFullYear()} Sonessia. Todos os direitos reservados.
        </footer>
      </main>

      {/* LADO DIREITO: Mesmo painel visual sonoro da tela de login e cadastro */}
      <PainelVisualSonoro className="hidden md:flex md:w-1/2 min-h-screen" />
    </div>
  );
}
