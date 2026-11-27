import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Circle, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useAuth } from "../../contexts/useAuth.js";
import { authService } from "../../services/auth.service.js";

const requisitos = [
  { texto: "Pelo menos 8 caracteres", atende: (senha) => senha.length >= 8 },
  { texto: "Uma letra maiúscula e minúscula", atende: (senha) => /\p{Lu}/u.test(senha) && /\p{Ll}/u.test(senha) },
  { texto: "Um número e um símbolo", atende: (senha) => /[0-9]/.test(senha) && /[\p{P}\p{S}]/u.test(senha) },
];

function erroDoCampoSenhaAtual(erro) {
  if (erro?.codigo === "SENHA_ATUAL_INVALIDA") {
    return "A senha atual não confere. Verifique e tente novamente.";
  }
  const detalheSenhaAtual = (erro?.detalhes || []).find(
    (detalhe) => detalhe?.campo === "senhaAtual",
  );
  return typeof detalheSenhaAtual?.mensagem === "string"
    ? detalheSenhaAtual.mensagem
    : "";
}

function mensagemErroSenha(erro) {
  if (erro?.codigo === "NOVA_SENHA_IGUAL_ATUAL") {
    return "A nova senha deve ser diferente da senha atual.";
  }
  if (erro?.codigo === "CREDENCIAIS_ALTERADAS") {
    return "As credenciais mudaram durante a solicitação. Entre novamente e tente outra vez.";
  }

  if (erro?.status === 400) return "Confira os campos e os requisitos da nova senha.";
  if (!erro?.status) return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  return "Não foi possível alterar a senha agora. Tente novamente.";
}

function CampoSenha({ id, label, value, onChange, autoComplete, visivel, alternar, disabled, erro }) {
  return (
    <label htmlFor={id} className="block space-y-2">
      <span
        className={`text-sm font-medium ${erro ? "text-danger" : "text-fg"}`}
        style={erro ? { color: "var(--danger)" } : undefined}
      >
        {label}
      </span>
      <span className="relative block">
        <input
          id={id}
          name={id}
          type={visivel ? "text" : "password"}
          autoComplete={autoComplete}
          maxLength={128}
          required
          disabled={disabled}
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? `${id}-erro` : undefined}
          value={value}
          onChange={(evento) => onChange(evento.target.value)}
          className={`w-full rounded-xl border bg-surface px-4 py-3 pr-12 text-sm text-fg transition-colors focus:outline-none focus:ring-2 ${erro ? "border-danger focus:border-danger focus:ring-danger/20" : "border-line focus:border-focus focus:ring-focus/20"}`}
          style={erro ? { borderColor: "var(--danger)" } : undefined}
        />
        <button
          type="button"
          onClick={alternar}
          aria-label={`${visivel ? "Ocultar" : "Exibir"} ${label.toLocaleLowerCase("pt-BR")}`}
          aria-pressed={visivel}
          disabled={disabled}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-icon-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {visivel ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </span>
      {erro && (
        <span
          id={`${id}-erro`}
          role="alert"
          className="block text-xs leading-relaxed text-danger"
          style={{ color: "var(--danger)" }}
        >
          {erro}
        </span>
      )}
    </label>
  );
}

export default function UserSenha() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [visibilidade, setVisibilidade] = useState([false, false, false]);
  const [alterando, setAlterando] = useState(false);
  const [erro, setErro] = useState("");
  const [erroSenhaAtual, setErroSenhaAtual] = useState("");

  const requisitosAtendidos = requisitos.every(({ atende }) => atende(novaSenha));
  const diferenteDaAtual = Boolean(novaSenha) && novaSenha !== senhaAtual;
  const confirmacaoCorreta = Boolean(confirmacao) && confirmacao === novaSenha;
  const valido = Boolean(senhaAtual && novaSenha && confirmacao) && requisitosAtendidos && diferenteDaAtual && confirmacaoCorreta;
  const itens = [
    ...requisitos.map((item) => ({ ...item, concluido: item.atende(novaSenha) })),
    { texto: "Diferente da senha atual", concluido: diferenteDaAtual },
    { texto: "Confirmação igual à nova senha", concluido: confirmacaoCorreta },
  ];

  function alternarVisibilidade(indice) {
    setVisibilidade((atual) => atual.map((visivel, i) => i === indice ? !visivel : visivel));
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (!valido || alterando) return;
    setErro("");
    setErroSenhaAtual("");
    setAlterando(true);
    try {
      await authService.alterarSenha(token, {
        senhaAtual,
        novaSenha,
        confirmarNovaSenha: confirmacao,
      });
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmacao("");
      setVisibilidade([false, false, false]);
      await logout();
      navigate("/login", {
        replace: true,
        state: { mensagem: "Senha alterada com sucesso. Todas as sessões foram encerradas; entre novamente com sua nova senha." },
      });
    } catch (falha) {
      const erroDoCampo = erroDoCampoSenhaAtual(falha);
      if (erroDoCampo) {
        setErroSenhaAtual(erroDoCampo);
      } else {
        setErro(mensagemErroSenha(falha));
      }
    } finally {
      setAlterando(false);
    }
  }

  return (
    <div className="user-page px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header>
        <p className="user-page-eyebrow">Minha área</p>
        <h1 className="user-page-title">Perfil e conta</h1>
        <p className="user-page-description">Dados de acesso e preferências da sua conta.</p>
      </header>

      <section aria-labelledby="senha-titulo" className="mt-8 max-w-[800px] rounded-2xl border border-line-subtle bg-surface p-5 sm:mt-10 sm:p-7 lg:p-9">
        <h2 id="senha-titulo" className="text-xl font-medium tracking-[-0.02em] text-fg">Senha</h2>
        <p className="mt-2 text-sm leading-relaxed text-fg-2">Escolha uma senha que você não use em outros serviços.</p>

        <form className="mt-7 space-y-5" onSubmit={enviar}>
          <CampoSenha id="senha-atual" label="Senha atual" value={senhaAtual} onChange={(v) => { setSenhaAtual(v); setErroSenhaAtual(""); setErro(""); }} autoComplete="current-password" visivel={visibilidade[0]} alternar={() => alternarVisibilidade(0)} disabled={alterando} erro={erroSenhaAtual} />
          <CampoSenha id="nova-senha" label="Nova senha" value={novaSenha} onChange={(v) => { setNovaSenha(v); setErro(""); }} autoComplete="new-password" visivel={visibilidade[1]} alternar={() => alternarVisibilidade(1)} disabled={alterando} />
          <CampoSenha id="confirmar-nova-senha" label="Confirmar nova senha" value={confirmacao} onChange={(v) => { setConfirmacao(v); setErro(""); }} autoComplete="new-password" visivel={visibilidade[2]} alternar={() => alternarVisibilidade(2)} disabled={alterando} />

          <ul aria-label="Requisitos da nova senha" className="space-y-2 rounded-xl bg-bg-2 px-4 py-4 sm:px-5">
            {itens.map(({ texto, concluido }) => (
              <li key={texto} className={`flex items-center gap-2.5 text-[13px] ${concluido ? "text-success" : "text-fg-3"}`}>
                {concluido ? <Check size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
                <span>{texto}</span>
              </li>
            ))}
          </ul>

          {erro && <p role="alert" className="text-sm text-danger">{erro}</p>}

          <button type="submit" disabled={!valido || alterando} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-on-accent shadow-xs transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50">
            {alterando && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
            {alterando ? "Alterando senha…" : "Alterar senha"}
          </button>
        </form>
      </section>
    </div>
  );
}
