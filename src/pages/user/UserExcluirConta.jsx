import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Eye, EyeOff, LoaderCircle, Trash2 } from "lucide-react";
import { useAuth } from "../../contexts/useAuth.js";
import { authService } from "../../services/auth.service.js";
import { iniciarEsperaLogoutExclusao } from "../../utils/exclusaoContaSuccess.js";

const CONFIRMACAO_EXCLUSAO = "EXCLUIR_CONTA";

function mensagemErroExclusao(erro) {
  if (erro?.codigo === "SENHA_ATUAL_INVALIDA") return "A senha atual não confere. Verifique e tente novamente.";
  if (erro?.codigo === "EXCLUSAO_JA_SOLICITADA") return "Esta conta já possui uma solicitação de exclusão pendente. Tente entrar para verificar as opções de recuperação.";
  if (erro?.codigo === "EXCLUSAO_ADMIN_NAO_PERMITIDA") return "A exclusão de contas administrativas não está disponível por esta área.";
  if (erro?.codigo === "DADOS_INVALIDOS" || erro?.status === 400) return "Confira a senha e a confirmação informadas.";
  if (erro?.status === 429) return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  if (!erro?.status) return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  return "Não foi possível registrar a solicitação agora. Tente novamente.";
}

function CampoSenha({ value, onChange, visivel, alternar, disabled, erro }) {
  return (
    <label htmlFor="excluir-senha" className="block space-y-2">
      <span className="text-sm font-medium text-fg">Senha atual</span>
      <span className="relative block">
        <input
          id="excluir-senha"
          name="senhaAtual"
          type={visivel ? "text" : "password"}
          autoComplete="current-password"
          maxLength={128}
          required
          disabled={disabled}
          value={value}
          onChange={(evento) => onChange(evento.target.value)}
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? "excluir-senha-erro" : undefined}
          className={`w-full rounded-xl border bg-surface px-4 py-3 pr-12 text-sm text-fg focus:outline-none focus:ring-2 ${erro ? "border-danger focus:ring-danger/20" : "border-line focus:border-focus focus:ring-focus/20"}`}
        />
        <button type="button" onClick={alternar} disabled={disabled}
          aria-label={visivel ? "Ocultar senha" : "Exibir senha"} aria-pressed={visivel}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-icon-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50">
          {visivel ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </span>
      {erro && <span id="excluir-senha-erro" role="alert" className="block text-xs text-danger">{erro}</span>}
    </label>
  );
}

export default function UserExcluirConta() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState("inicio");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const habilitado = Boolean(senha) && confirmacao === CONFIRMACAO_EXCLUSAO && !ocupado;

  async function solicitar(evento) {
    evento.preventDefault();
    if (!habilitado) return;
    setOcupado(true);
    setErro("");
    try {
      const resposta = await authService.solicitarExclusaoConta(token, senha);
      iniciarEsperaLogoutExclusao(resposta?.exclusaoDefinitivaEm);
      setSenha("");
      setConfirmacao("");
      navigate("/exclusao-conta-confirmada", { replace: true });
    } catch (falha) {
      setErro(mensagemErroExclusao(falha));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="user-page px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header>
        <p className="user-page-eyebrow">Minha área</p>
        <h1 className="user-page-title">Perfil e conta</h1>
        <p className="user-page-description">Gerencie o acesso e as opções da sua conta.</p>
      </header>

      {etapa === "inicio" && (
        <section aria-labelledby="excluir-titulo" className="mt-8 max-w-[800px] rounded-2xl border border-line-subtle bg-surface p-5 sm:mt-10 sm:p-7 lg:p-9">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger"><Trash2 size={20} aria-hidden="true" /></span>
            <div>
              <h2 id="excluir-titulo" className="text-xl font-medium tracking-[-0.02em] text-fg">Excluir minha conta</h2>
              <p className="mt-2 text-sm leading-relaxed text-fg-2">Ao solicitar a exclusão, sua conta será desativada imediatamente e você perderá acesso ao Sonessia.</p>
            </div>
          </div>
          <div className="mt-6 space-y-3 rounded-xl bg-bg-2 p-4 text-sm leading-relaxed text-fg-2 sm:p-5">
            <p>Seus dados permanecerão armazenados durante um período de recuperação de 30 dias. Nesse período, você poderá recuperar sua conta caso mude de ideia.</p>
            <p>Após o prazo, seus dados serão excluídos permanentemente e não será possível recuperá-los.</p>
            <p>Para recuperar a conta, basta tentar entrar novamente no Sonessia e confirmar a reativação.</p>
          </div>
          <button type="button" onClick={() => { setErro(""); setEtapa("confirmar"); }}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger-soft px-5 text-sm font-semibold text-danger transition-colors hover:bg-danger/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-bg">
            <Trash2 size={17} aria-hidden="true" /> Excluir minha conta
          </button>
        </section>
      )}

      {etapa === "confirmar" && (
        <section aria-labelledby="confirmar-exclusao-titulo" className="mt-8 max-w-[800px] rounded-2xl border border-danger/25 bg-surface p-5 sm:mt-10 sm:p-7 lg:p-9">
          <div className="flex items-start gap-3 rounded-xl border border-danger/20 bg-danger-soft p-4 text-danger" role="note">
            <AlertTriangle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
            <div><h2 id="confirmar-exclusao-titulo" className="font-semibold">Sua conta será desativada imediatamente</h2><p className="mt-1 text-sm leading-relaxed">A exclusão definitiva será processada após 30 dias. Até lá, você poderá recuperar a conta ao entrar novamente e confirmar a reativação.</p></div>
          </div>
          <form className="mt-6 space-y-5" onSubmit={solicitar}>
            <CampoSenha value={senha} onChange={(valor) => { setSenha(valor); setErro(""); }} visivel={senhaVisivel} alternar={() => setSenhaVisivel((valor) => !valor)} disabled={ocupado} />
            <label htmlFor="excluir-confirmacao" className="block space-y-2">
              <span className="text-sm font-medium text-fg">Digite <code className="rounded bg-bg-2 px-1.5 py-0.5">{CONFIRMACAO_EXCLUSAO}</code> para confirmar</span>
              <input id="excluir-confirmacao" name="confirmacao" autoComplete="off" required value={confirmacao}
                onChange={(evento) => { setConfirmacao(evento.target.value); setErro(""); }} disabled={ocupado}
                aria-invalid={Boolean(confirmacao) && confirmacao !== CONFIRMACAO_EXCLUSAO}
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 font-mono text-sm text-fg focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 disabled:opacity-60" />
            </label>
            {confirmacao && confirmacao !== CONFIRMACAO_EXCLUSAO && <p className="text-xs text-fg-3">A confirmação precisa corresponder exatamente ao texto indicado.</p>}
            {erro && <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{erro}</p>}
            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
              <button type="button" disabled={ocupado} onClick={() => { setSenha(""); setConfirmacao(""); setErro(""); setEtapa("inicio"); }} className="min-h-11 rounded-xl border border-line px-5 text-sm font-medium text-fg-2 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50">Cancelar</button>
              <button type="submit" disabled={!habilitado} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-danger px-5 text-sm font-semibold text-white hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50">
                {ocupado && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}{ocupado ? "Enviando solicitação…" : "Confirmar exclusão"}
              </button>
            </div>
          </form>
        </section>
      )}

    </div>
  );
}
