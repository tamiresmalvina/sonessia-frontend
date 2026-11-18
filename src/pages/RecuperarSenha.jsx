import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth.service.js';
import { SonessiaLogo } from '../components/SonessiaLogo.jsx';

export function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [submetendo, setSubmetendo] = useState(false);

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro('');
    setMensagemSucesso('');

    if (!email.trim()) {
      setErro('Informe o seu e-mail.');
      return;
    }

    setSubmetendo(true);

    try {
      const resposta = await authService.solicitarRecuperacaoSenha(email.trim());
      setMensagemSucesso(
        resposta?.mensagem ||
          'Se o e-mail informado estiver cadastrado e verificado, as instruções para redefinição de senha foram enviadas.'
      );
    } catch (err) {
      setErro(err.message || 'Erro ao solicitar a recuperação de senha.');
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
            Recuperar Senha
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Informe o e-mail da sua conta para enviarmos o link seguro de redefinição de senha.
          </p>
        </div>

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

        {mensagemSucesso && (
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
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[#24113D] mb-2"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Digite seu e-mail cadastrado"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {submetendo ? 'Enviando instruções...' : 'Enviar instruções'}
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
      </div>
    </div>
  );
}
