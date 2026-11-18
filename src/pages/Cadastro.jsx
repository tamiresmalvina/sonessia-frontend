import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth.js';
import { authService } from '../services/auth.service.js';
import { SonessiaLogo } from '../components/SonessiaLogo.jsx';
import { PainelVisualSonoro } from '../components/PainelVisualSonoro.jsx';
import { validarIdade, calcularDataMaxima16Anos } from '../utils/validacoes.js';

export function Cadastro() {
  const { usuario, estaAutenticado, carregando } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [dataNascimentoTocou, setDataNascimentoTocou] = useState(false);
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [erro, setErro] = useState('');
  const [submetendo, setSubmetendo] = useState(false);

  // Calcula a data máxima recomendada no seletor HTML (16 anos atrás a contar de hoje)
  const dataMaxPermitida = calcularDataMaxima16Anos();

  // Validação dinâmica da data de nascimento
  const resultadoIdade = validarIdade(dataNascimento);
  const mostrarErroIdade = dataNascimentoTocou && !resultadoIdade.valido;

  // Se já estiver autenticado, redireciona para a área correspondente
  if (!carregando && estaAutenticado && usuario) {
    if (usuario.perfil === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    if (usuario.perfil === 'COMUM') {
      return <Navigate to="/comum" replace />;
    }
  }

  function validarFormulario() {
    setErro('');

    if (!nome.trim() || nome.trim().length < 2) {
      setErro('O nome deve ter no mínimo 2 caracteres.');
      return false;
    }

    if (!email.trim()) {
      setErro('Informe o seu e-mail.');
      return false;
    }

    // Se o usuário tentar enviar sem preencher ou com idade inválida, ativa a validação inline da idade
    if (!resultadoIdade.valido) {
      setDataNascimentoTocou(true);
      return false;
    }

    if (!senha) {
      setErro('A senha é obrigatória.');
      return false;
    }

    if (senha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres.');
      return false;
    }

    if (!/\p{Lu}/u.test(senha)) {
      setErro('A senha deve conter pelo menos uma letra maiúscula.');
      return false;
    }

    if (!/\p{Ll}/u.test(senha)) {
      setErro('A senha deve conter pelo menos uma letra minúscula.');
      return false;
    }

    if (!/[0-9]/.test(senha)) {
      setErro('A senha deve conter pelo menos um número.');
      return false;
    }

    if (!/[\p{P}\p{S}]/u.test(senha)) {
      setErro('A senha deve conter pelo menos um símbolo.');
      return false;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas informadas não coincidem.');
      return false;
    }

    return true;
  }

  async function handleSubmit(evento) {
    evento.preventDefault();
    setErro('');

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

      // Não declara cadastro concluído aqui: transiciona imediatamente para a confirmação de e-mail
      navigate('/confirmar-email', {
        state: {
          email: emailNormalizado,
          nome: nomeNormalizado,
          mensagem: resposta?.mensagem,
        },
      });
    } catch (err) {
      // Se o backend retornou detalhe específico de data de nascimento, reflete no campo
      if (
        err?.detalhes?.some((d) => d.campo === 'dataNascimento') ||
        (err?.message && /16 anos|nascimento/i.test(err.message))
      ) {
        setDataNascimentoTocou(true);
      } else {
        setErro(err.message || 'Erro ao realizar cadastro.');
      }
    } finally {
      setSubmetendo(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#FAF8FF]">
      {/* LADO ESQUERDO: Formulário de cadastro */}
      <main className="w-full md:w-1/2 min-h-screen flex flex-col justify-between px-6 sm:px-10 lg:px-16 py-10 sm:py-12 bg-white">
        {/* Topo: Logo oficial da Sonessia */}
        <header className="w-full max-w-[420px] mx-auto">
          <SonessiaLogo />
        </header>

        {/* Centro: Formulário de cadastro */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8">
          {/* Título e frase de apoio */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#24113D] mb-2">
              Crie sua conta
            </h1>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
              Comece sua experiência sonora com o Sonessia.
            </p>
          </div>

          {/* Mensagem de erro geral da API */}
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

          {/* Formulário de Cadastro */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Campo de Nome */}
            <div>
              <label
                htmlFor="nome"
                className="block text-sm font-semibold text-[#24113D] mb-1.5"
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
                className="w-full px-4 py-3 text-base text-[#24113D] bg-white border border-[#E2DCED] rounded-xl placeholder:text-gray-400 focus:outline-none focus:border-[#6D28D9] focus:ring-4 focus:ring-[#8B5CF6]/15 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
              />
            </div>

            {/* Campo de E-mail */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#24113D] mb-1.5"
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
                className="w-full px-4 py-3 text-base text-[#24113D] bg-white border border-[#E2DCED] rounded-xl placeholder:text-gray-400 focus:outline-none focus:border-[#6D28D9] focus:ring-4 focus:ring-[#8B5CF6]/15 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
              />
            </div>

            {/* Campo de Data de Nascimento com Validação Inline */}
            <div>
              <label
                htmlFor="dataNascimento"
                className="block text-sm font-semibold text-[#24113D] mb-1.5"
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
                aria-describedby={mostrarErroIdade ? 'erro-idade' : 'ajuda-idade'}
                className={`w-full px-4 py-3 text-base bg-white rounded-xl placeholder:text-gray-400 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-all ${
                  mostrarErroIdade
                    ? 'border border-red-400 text-red-900 focus:border-red-500 focus:ring-4 focus:ring-red-200'
                    : 'border border-[#E2DCED] text-[#24113D] focus:border-[#6D28D9] focus:ring-4 focus:ring-[#8B5CF6]/15'
                }`}
              />

              {mostrarErroIdade ? (
                <p
                  id="erro-idade"
                  role="alert"
                  className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1.5 animate-fadeIn"
                >
                  <svg
                    className="w-4 h-4 text-red-500 flex-shrink-0"
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
                <p id="ajuda-idade" className="mt-1.5 text-xs text-gray-500">
                  Você deve ter pelo menos 16 anos para se cadastrar.
                </p>
              )}
            </div>

            {/* Campo de Senha com controle de visualização */}
            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-semibold text-[#24113D] mb-1.5"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Crie uma senha forte"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={submetendo}
                  required
                  className="w-full pl-4 pr-12 py-3 text-base text-[#24113D] bg-white border border-[#E2DCED] rounded-xl placeholder:text-gray-400 focus:outline-none focus:border-[#6D28D9] focus:ring-4 focus:ring-[#8B5CF6]/15 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 8 caracteres, com maiúsculas, minúsculas, números e símbolos.
              </p>
            </div>

            {/* Campo de Confirmação de Senha */}
            <div>
              <label
                htmlFor="confirmarSenha"
                className="block text-sm font-semibold text-[#24113D] mb-1.5"
              >
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="confirmarSenha"
                  type={mostrarConfirmarSenha ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repita sua senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  disabled={submetendo}
                  required
                  className="w-full pl-4 pr-12 py-3 text-base text-[#24113D] bg-white border border-[#E2DCED] rounded-xl placeholder:text-gray-400 focus:outline-none focus:border-[#6D28D9] focus:ring-4 focus:ring-[#8B5CF6]/15 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmarSenha((v) => !v)}
                  disabled={submetendo}
                  aria-label={
                    mostrarConfirmarSenha
                      ? 'Ocultar confirmação de senha'
                      : 'Visualizar confirmação de senha'
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#6D28D9] focus:outline-none cursor-pointer"
                >
                  {mostrarConfirmarSenha ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-[#6D28D9] hover:bg-[#5B21B6] active:bg-[#4C1D95] shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-4"
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
                  <span>Criando conta...</span>
                </>
              ) : (
                <span>Criar conta</span>
              )}
            </button>
          </form>

          {/* Link para voltar ao Login */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <span>Já tem uma conta? </span>
            <Link
              to="/login"
              className="font-bold text-[#6D28D9] hover:text-[#5B21B6] hover:underline transition-colors"
            >
              Entrar
            </Link>
          </div>
        </div>

        {/* Rodapé institucional discreto */}
        <footer className="w-full max-w-[420px] mx-auto text-center text-xs text-gray-400 pt-4">
          © {new Date().getFullYear()} Sonessia. Todos os direitos reservados.
        </footer>
      </main>

      {/* LADO DIREITO: Mesmo painel visual sonoro da tela de login */}
      <PainelVisualSonoro className="hidden md:flex md:w-1/2 min-h-screen" />
    </div>
  );
}
