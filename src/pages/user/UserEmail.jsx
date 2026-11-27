import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LoaderCircle, Mail } from "lucide-react";
import { useAuth } from "../../contexts/useAuth.js";
import { authService } from "../../services/auth.service.js";
import { iniciarPrazoSaidaEmail } from "../../utils/emailAlteradoSuccess.js";

const NOMES_ETAPA = ["SOLICITAÇÃO", "CONFIRMAR E-MAIL ATUAL", "CONFIRMAR NOVO E-MAIL", "CONCLUÍDO"];
const formatarTempo = (ms) => {
  const segundos = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;
};

function erroAmigavel(erro) {
  const mensagens = {
    SENHA_ATUAL_INVALIDA: "A senha atual não confere. Verifique e tente novamente.",
    NOVO_EMAIL_IGUAL_ATUAL: "Informe um endereço diferente do e-mail atual.",
    EMAIL_JA_CADASTRADO: "Este e-mail já está sendo utilizado por outra conta.",
    CONFLITO_CADASTRO: "Este e-mail já está sendo utilizado por outra conta.",
    EMAIL_INDISPONIVEL: "Este e-mail não está disponível. Tente outro endereço.",
    CODIGO_INVALIDO: "O código não confere. Verifique os números e tente novamente.",
    CODIGO_EXPIRADO: "Este código expirou. Solicite um novo código.",
    LIMITE_TENTATIVAS_CODIGO: "O limite de tentativas foi atingido. Solicite um novo código.",
    LIMITE_REENVIO_CODIGO: "Você atingiu o limite de reenvios para esta etapa.",
    REENVIO_CODIGO_AGUARDE: "Aguarde o intervalo indicado antes de reenviar o código.",
    FALHA_ENVIO_EMAIL: "Não foi possível enviar o código. Tente novamente em instantes.",
    ALTERACAO_EMAIL_NAO_ENCONTRADA: "A solicitação expirou ou foi cancelada. Inicie novamente.",
  };
  if (mensagens[erro?.codigo]) return mensagens[erro.codigo];
  if (!erro?.status) return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  if (erro.status === 429) return "Muitas tentativas. Aguarde um pouco antes de tentar novamente.";
  if (erro.status === 400) return "Confira os dados informados e tente novamente.";
  if (erro.status === 409) return "Este endereço não pode ser utilizado. Confira e tente outro.";
  return "Não foi possível concluir esta etapa. Tente novamente.";
}

function CodigoSeisDigitos({ value, onChange, disabled }) {
  const refs = useRef([]);
  const digitos = value.padEnd(6, " ").slice(0, 6);
  function atualizar(indice, conteudo) {
    const numeros = conteudo.replace(/\D/g, "");
    const novos = value.split("");
    if (numeros.length > 1) {
      [...numeros].slice(0, 6 - indice).forEach((numero, offset) => { novos[indice + offset] = numero; });
      onChange(novos.join("").slice(0, 6));
      refs.current[Math.min(indice + numeros.length, 5)]?.focus();
      return;
    }
    novos[indice] = numeros;
    onChange(novos.join("").slice(0, 6));
    if (numeros && indice < 5) refs.current[indice + 1]?.focus();
  }
  return <div role="group" aria-label="Código de confirmação com seis dígitos" className="flex w-full max-w-[440px] gap-2 sm:gap-3">
    {Array.from({ length: 6 }, (_, indice) => <input
      key={indice}
      ref={(elemento) => { refs.current[indice] = elemento; }}
      aria-label={`Dígito ${indice + 1} de 6`}
      inputMode="numeric" autoComplete={indice === 0 ? "one-time-code" : "off"}
      type="text" pattern="[0-9]*" maxLength={6}
      value={digitos[indice].trim()} disabled={disabled}
      onChange={(evento) => atualizar(indice, evento.target.value)}
      onKeyDown={(evento) => {
        if (evento.key === "Backspace" && !value[indice] && indice > 0) refs.current[indice - 1]?.focus();
        else if (evento.key === "ArrowLeft" && indice > 0) refs.current[indice - 1]?.focus();
        else if (evento.key === "ArrowRight" && indice < 5) refs.current[indice + 1]?.focus();
      }}
      onPaste={(evento) => { const texto = evento.clipboardData.getData("text"); if (/\d{1,6}/.test(texto)) { evento.preventDefault(); atualizar(indice, texto); } }}
      className="h-14 min-w-0 flex-1 rounded-xl border border-line bg-surface text-center font-mono text-xl text-fg focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 disabled:opacity-60 sm:h-16 sm:text-2xl"
    />)}
  </div>;
}

function Progresso({ etapa }) {
  return <div aria-label={`Etapa ${etapa} de 4`} className="mt-7 grid grid-cols-4 gap-2">
    {[1, 2, 3, 4].map((item) => <span key={item} className={`h-1.5 rounded-full ${item <= etapa ? "bg-accent" : "bg-line-subtle"}`} />)}
  </div>;
}

export default function UserEmail() {
  const { usuario, token, atualizarUsuario } = useAuth();
  const navigate = useNavigate();
  const [emailAtual, setEmailAtual] = useState(usuario?.email || "");
  const [etapa, setEtapa] = useState(0);
  const [novoEmail, setNovoEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [pendente, setPendente] = useState(null);
  const [agora, setAgora] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const [erroSenhaAtual, setErroSenhaAtual] = useState("");
  const [aviso, setAviso] = useState("");
  const emailLimpo = novoEmail.trim().toLowerCase();
  const formatoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo) && emailLimpo.length <= 255;

  const carregarPendente = useCallback(async () => {
    const resposta = await authService.obterAlteracaoEmailPendente(token);
    const solicitacao = resposta?.solicitacaoPendente;
    setPendente(solicitacao || null);
    if (solicitacao) {
      setNovoEmail(solicitacao.novoEmail);
      setEtapa(solicitacao.etapa === "CONFIRMAR_EMAIL_ATUAL" ? 2 : 3);
    }
    return solicitacao;
  }, [token]);

  useEffect(() => {
    const intervalo = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        const [respostaUsuario, respostaPendente] = await Promise.all([
          authService.obterUsuarioAtual(token), authService.obterAlteracaoEmailPendente(token),
        ]);
        if (!ativo) return;
        setEmailAtual(respostaUsuario?.usuario?.email || "");
        atualizarUsuario(respostaUsuario.usuario);
        const solicitacao = respostaPendente?.solicitacaoPendente;
        setPendente(solicitacao || null);
        if (solicitacao) {
          setNovoEmail(solicitacao.novoEmail);
          setEtapa(solicitacao.etapa === "CONFIRMAR_EMAIL_ATUAL" ? 2 : 3);
        }
      } catch (falha) { if (ativo) setErro(erroAmigavel(falha)); }
      finally { if (ativo) setCarregando(false); }
    }
    if (token) carregar();
    return () => { ativo = false; };
  }, [token, atualizarUsuario]);

  async function iniciar(evento) {
    evento.preventDefault();
    if (!formatoValido || !senha || emailLimpo === emailAtual.trim().toLowerCase() || ocupado) return;
    setOcupado(true); setErro(""); setErroSenhaAtual(""); setAviso("");
    try {
      await authService.solicitarAlteracaoEmail(token, emailLimpo, senha);
      const solicitacao = await carregarPendente();
      if (!solicitacao) throw new Error("Solicitação indisponível.");
      setSenha(""); setCodigo(""); setEtapa(2);
      setAviso("Enviamos um código de confirmação para seu e-mail atual.");
    } catch (falha) {
      if (falha?.codigo === "SENHA_ATUAL_INVALIDA") setErroSenhaAtual(erroAmigavel(falha));
      else setErro(erroAmigavel(falha));
    }
    finally { setOcupado(false); }
  }

  async function confirmar(evento) {
    evento.preventDefault();
    if (codigo.length !== 6 || ocupado) return;
    setOcupado(true); setErro(""); setAviso("");
    try {
      if (etapa === 2) {
        await authService.confirmarEmailAtual(token, codigo);
        setCodigo("");
        const solicitacao = await carregarPendente();
        if (!solicitacao || solicitacao.etapa !== "CONFIRMAR_NOVO_EMAIL") throw new Error("Confirmação indisponível.");
        setEtapa(3); setAviso("E-mail atual confirmado. Enviamos um código ao novo endereço.");
      } else {
        await authService.confirmarNovoEmail(token, codigo);
        iniciarPrazoSaidaEmail(Date.now() + 30_000);
        navigate("/email-alterado", { replace: true, state: { novoEmail } });
      }
    } catch (falha) { setErro(erroAmigavel(falha)); }
    finally { setOcupado(false); }
  }

  const restanteReenvio = pendente ? Math.max(0, new Date(pendente.reenvioDisponivelEm).getTime() - agora) : 0;
  const restanteValidade = pendente ? Math.max(0, new Date(pendente.expiraEm).getTime() - agora) : 0;
  async function reenviar() {
    if (ocupado || !pendente || restanteReenvio > 0 || pendente.reenviosRestantes <= 0) return;
    setOcupado(true); setErro(""); setAviso("");
    try {
      await authService.reenviarCodigoAlteracaoEmail(token);
      await carregarPendente();
      setCodigo(""); setAviso("Um novo código foi enviado. O código anterior não é mais válido.");
    } catch (falha) { setErro(erroAmigavel(falha)); }
    finally { setOcupado(false); }
  }

  async function cancelar() {
    if (ocupado) return;
    setOcupado(true); setErro("");
    try {
      if (pendente) await authService.cancelarAlteracaoEmail(token);
      setEtapa(0); setNovoEmail(""); setSenha(""); setCodigo(""); setPendente(null); setAviso("");
    } catch (falha) { setErro(erroAmigavel(falha)); }
    finally { setOcupado(false); }
  }

  const descricaoEtapa = etapa === 2
    ? <>Primeiro, confirme que você tem acesso ao e-mail atual. Enviamos um código de 6 dígitos para <strong className="break-all text-fg">{emailAtual}</strong>.</>
    : <>Agora confirme o novo endereço. Enviamos um código de 6 dígitos para <strong className="break-all text-fg">{novoEmail}</strong>.</>;

  return <div className="user-page px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
    <header>
      <p className="user-page-eyebrow">Minha área</p>
      <h1 className="user-page-title">Perfil e conta</h1>
      <p className="user-page-description">Dados de acesso e preferências de {usuario?.nome || "sua conta"}.</p>
    </header>
    {erro && <p role="alert" className="mt-6 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">{erro}</p>}
    {carregando ? <div role="status" className="mt-8 flex min-h-40 items-center justify-center text-fg-3"><LoaderCircle className="animate-spin" /><span className="sr-only">Carregando e-mail</span></div> : <section aria-labelledby="email-titulo" className="mt-8 max-w-[800px] rounded-2xl border border-line-subtle bg-surface p-5 sm:mt-10 sm:p-7 lg:p-9">
      <h2 id="email-titulo" className="text-xl font-medium tracking-[-0.02em] text-fg">E-mail de acesso</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fg-2">Por segurança, a troca é confirmada com um código enviado ao e-mail atual e outro ao novo endereço.</p>
      {etapa === 0 && <>
        <div className="mt-7 rounded-lg border border-line-subtle bg-bg-2 px-4 py-3.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-3">E-mail cadastrado</p>
          <p className="mt-1 break-all text-[15px] text-fg">{emailAtual}</p>
        </div>
        <button type="button" onClick={() => { setEtapa(1); setErro(""); }} className="user-button user-button-md user-button-primary mt-5 min-h-12"><Mail size={17} />Alterar e-mail</button>
      </>}
      {etapa > 0 && <Progresso etapa={etapa} />}
      {etapa > 0 && etapa < 4 && <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Etapa {etapa} de 4 · {NOMES_ETAPA[etapa - 1]}</p>}
      {etapa === 1 && <form onSubmit={iniciar} className="mt-7 space-y-5" noValidate>
        <label htmlFor="novo-email" className="block space-y-2"><span className="text-sm font-medium text-fg">Novo e-mail</span>
          <input id="novo-email" type="email" autoComplete="email" maxLength={255} required value={novoEmail} disabled={ocupado} onChange={(evento) => setNovoEmail(evento.target.value)} className="user-input" />
        </label>
        <label htmlFor="email-senha-atual" className="block space-y-2"><span className={`text-sm font-medium ${erroSenhaAtual ? "text-danger" : "text-fg"}`}>Senha atual</span>
          <span className="relative block"><input id="email-senha-atual" type={senhaVisivel ? "text" : "password"} autoComplete="current-password" maxLength={128} required value={senha} disabled={ocupado} aria-invalid={Boolean(erroSenhaAtual)} aria-describedby={erroSenhaAtual ? "email-senha-erro" : undefined} onChange={(evento) => { setSenha(evento.target.value); setErroSenhaAtual(""); }} className={`user-input pr-12 ${erroSenhaAtual ? "border-danger focus:border-danger focus:ring-danger/20" : ""}`} />
            <button type="button" aria-label={senhaVisivel ? "Ocultar senha atual" : "Exibir senha atual"} aria-pressed={senhaVisivel} onClick={() => setSenhaVisivel(!senhaVisivel)} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-icon-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">{senhaVisivel ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </span>{erroSenhaAtual ? <span id="email-senha-erro" role="alert" className="block text-xs text-danger">{erroSenhaAtual}</span> : <span className="block text-[13px] text-fg-3">Pedimos a senha para confirmar que é você.</span>}
        </label>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="submit" disabled={!formatoValido || !senha || emailLimpo === emailAtual.trim().toLowerCase() || ocupado} className="user-button user-button-md user-button-primary min-h-12">{ocupado && <LoaderCircle size={17} className="animate-spin" />}Enviar código</button>
          <button type="button" disabled={ocupado} onClick={cancelar} className="user-button user-button-md user-button-ghost min-h-12">Cancelar</button>
        </div>
      </form>}
      {(etapa === 2 || etapa === 3) && <form onSubmit={confirmar} className="mt-7" key={etapa}>
        <p className="text-[15px] leading-relaxed text-fg-2">{descricaoEtapa}</p>
        <div className="mt-6"><CodigoSeisDigitos value={codigo} onChange={setCodigo} disabled={ocupado} /></div>
        <p className="mt-3 font-mono text-[11px] tracking-[0.08em] text-fg-3" aria-live="polite">Válido por mais {formatarTempo(restanteValidade)} · expira 10 min após o envio</p>
        <div className="mt-7 flex flex-wrap items-center gap-2 sm:gap-3">
          <button type="submit" disabled={codigo.length !== 6 || ocupado} className="user-button user-button-md user-button-primary min-h-12">{ocupado && <LoaderCircle size={17} className="animate-spin" />}Confirmar código</button>
          <button type="button" disabled={ocupado || restanteReenvio > 0 || pendente?.reenviosRestantes <= 0} onClick={reenviar} className="user-button user-button-md user-button-secondary min-h-12">{ocupado ? "Enviando…" : restanteReenvio > 0 ? `Reenviar em ${Math.ceil(restanteReenvio / 1000)} s` : pendente?.reenviosRestantes <= 0 ? "Limite de reenvios atingido" : "Reenviar código"}</button>
          <button type="button" disabled={ocupado} onClick={cancelar} className="user-button user-button-md user-button-ghost min-h-12">Cancelar alteração</button>
        </div>
      </form>}
      {aviso && <p role="status" className="mt-5 text-sm text-success">{aviso}</p>}
    </section>}
  </div>;
}
