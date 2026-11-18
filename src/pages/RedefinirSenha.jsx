import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service.js';
import { SonessiaLogo } from '../components/SonessiaLogo.jsx';

export function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [submetendo, setSubmetendo] = useState(false);

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro('');
    setMensagemSucesso('');

    if (!token) {
      setErro('Token de recuperação não informado ou link inválido.');
      return;
    }

    if (!novaSenha) {
      setErro('A nova senha é obrigatória.');
      return;
    }

    if (novaSenha.length < 8) {
      setErro('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas informadas não coincidem.');
      return;
    }

    setSubmetendo(true);

    try {
      const resposta = await authService.redefinirSenha(token, novaSenha);
      setMensagemSucesso(
        resposta?.mensagem || 'Senha redefinida com sucesso. Faça login com a nova senha.'
      );
    } catch (err) {
      setErro(err.message || 'Erro ao redefinir a senha.');
    } finally {
      setSubmetendo(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-12 bg-[#FAF8FF]">
      <div className="w-full max-w-[440px] bg-white rounded-2xl border border-[#E9E4ED] shadow-sm p-8 sm:p-10">
        <div className="text-center mb-8">
          <SonessiaLogo className="justify-center mb-6" />
          <h1 className="text-2xl font-bold tracking-tight text-[#24113D] mb-2">
            Redefinir Senha
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Crie uma nova senha forte para acessar sua conta Sonessia.
          </p>
        </div>

        {!token ? (
          <div>
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              Token de recuperação ausente ou link inválido. Por favor, solicite um novo link
              por e-mail.
            </div>
            <div className="space-y-3 text-center text-sm">
              <Link
                to="/recuperar-senha"
                className="block font-semibold text-[#6D28D9] hover:underline"
              >
                Solicitar nova recuperação
              </Link>
              <Link to="/login" className="block text-gray-500 hover:text-gray-800">
                Voltar ao login
              </Link>
            </div>
          </div>
        ) : mensagemSucesso ? (
          <div>
            <div
              role="status"
              className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-start gap-3"
            >
              <svg
                className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5"
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
              <span className="font-medium leading-relaxed">{mensagemSucesso}</span>
            </div>
            <Link
              to="/login"
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] transition-all flex items-center justify-center text-center shadow-sm"
            >
              Ir para o Login
            </Link>
          </div>
        ) : (
          <>
            {erro && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3"
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

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label
                  htmlFor="novaSenha"
                  className="block text-sm font-semibold text-[#24113D] mb-2"
                >
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    id="novaSenha"
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    disabled={submetendo}
                    required
                    className="w-full pl-4 pr-12 py-3.5 text-base text-[#24113D] bg-white border border-[#E2DCED] rounded-xl placeholder:text-gray-400 focus:outline-none focus:border-[#6D28D9] focus:ring-4 focus:ring-[#8B5CF6]/15 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    disabled={submetendo}
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Visualizar senha'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#6D28D9] focus:outline-none cursor-pointer"
                  >
                    {mostrarSenha ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                  Inclua maiúsculas, minúsculas, números e símbolos.
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmarSenha"
                  className="block text-sm font-semibold text-[#24113D] mb-2"
                >
                  Confirmar Nova Senha
                </label>
                <input
                  id="confirmarSenha"
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="Repita a nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  disabled={submetendo}
                  required
                  className="w-full px-4 py-3.5 text-base text-[#24113D] bg-white border border-[#E2DCED] rounded-xl placeholder:text-gray-400 focus:outline-none focus:border-[#6D28D9] focus:ring-4 focus:ring-[#8B5CF6]/15 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submetendo}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] active:bg-[#4C1D95] shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {submetendo ? 'Redefinindo...' : 'Redefinir senha'}
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <Link
                to="/login"
                className="font-semibold text-[#6D28D9] hover:text-[#5B21B6] hover:underline transition-colors"
              >
                ← Voltar para o login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
