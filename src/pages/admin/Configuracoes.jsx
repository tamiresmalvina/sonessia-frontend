import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Camera,
  Check,
  Clock3,
  Image,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../contexts/useAuth.js";
import { authService } from "../../services/auth.service.js";

const TIPOS_IMAGEM_PERMITIDOS = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024;
const CLASSE_CAMPO =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-disabled transition-all focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20";
const CLASSE_BOTAO =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] px-5 text-sm font-medium text-white shadow-xs transition-all hover:bg-[image:linear-gradient(100deg,#684a98,#5667b8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-60";

function iniciais(nome = "") {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  return partes
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toLocaleUpperCase("pt-BR") || "A";
}

function formatarData(data) {
  if (!data) return null;
  const dataValida = new Date(data);
  if (Number.isNaN(dataValida.getTime())) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(dataValida);
}

function formatarDuracao(segundos) {
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = segundos % 60;
  return `${minutos}:${String(segundosRestantes).padStart(2, "0")}`;
}

function validarSenhaNova(senha) {
  if (senha.length < 8) return "A nova senha deve ter pelo menos 8 caracteres.";
  if (senha.length > 128) return "A nova senha deve ter no máximo 128 caracteres.";
  if (!/\p{Lu}/u.test(senha)) {
    return "Inclua pelo menos uma letra maiúscula.";
  }
  if (!/\p{Ll}/u.test(senha)) {
    return "Inclua pelo menos uma letra minúscula.";
  }
  if (!/[0-9]/.test(senha)) return "Inclua pelo menos um número.";
  if (!/[\p{P}\p{S}]/u.test(senha)) {
    return "Inclua pelo menos um símbolo.";
  }
  return "";
}

function Alerta({ tipo, children }) {
  const sucesso = tipo === "sucesso";
  const classe = sucesso
    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
    : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300";

  return (
    <div
      role={sucesso ? "status" : "alert"}
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${classe}`}
    >
      {sucesso ? (
        <Check size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle
          size={17}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </div>
  );
}

function Secao({ icone: Icone, titulo, descricao, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line-subtle bg-surface">
      <header className="flex items-start gap-3 border-b border-line-subtle px-5 py-4 sm:px-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Icone size={19} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-fg">{titulo}</h2>
          <p className="mt-1 text-sm leading-relaxed text-fg-3">{descricao}</p>
        </div>
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export default function Configuracoes() {
  const { usuario, token, atualizarUsuario, logout } = useAuth();
  const navigate = useNavigate();
  const inputFotoRef = useRef(null);

  const [carregando, setCarregando] = useState(true);
  const [alerta, setAlerta] = useState(null);
  const [nome, setNome] = useState(usuario?.nome || "");
  const [emailAtual, setEmailAtual] = useState(usuario?.email || "");
  const [temFoto, setTemFoto] = useState(Boolean(usuario?.fotoPerfil));
  const [fotoUrl, setFotoUrl] = useState("");
  const [fotoVersao, setFotoVersao] = useState(0);
  const [carregandoFoto, setCarregandoFoto] = useState(
    Boolean(usuario?.fotoPerfil),
  );
  const [agora, setAgora] = useState(0);
  const [erroFoto, setErroFoto] = useState("");
  const [solicitacaoEmail, setSolicitacaoEmail] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null);

  const [salvandoNome, setSalvandoNome] = useState(false);
  const [salvandoFoto, setSalvandoFoto] = useState(false);
  const [solicitandoEmail, setSolicitandoEmail] = useState(false);
  const [confirmandoEmail, setConfirmandoEmail] = useState(false);
  const [reenviandoEmail, setReenviandoEmail] = useState(false);
  const [alterandoSenha, setAlterandoSenha] = useState(false);
  const [cancelandoEmail, setCancelandoEmail] = useState(false);

  const [novoEmail, setNovoEmail] = useState("");
  const [senhaEmail, setSenhaEmail] = useState("");
  const [codigoEmail, setCodigoEmail] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [mostrarSenhas, setMostrarSenhas] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    let ativo = true;

    async function carregarDados() {
      setCarregando(true);
      setAlerta(null);
      try {
        const [respostaUsuario, respostaEmail] = await Promise.all([
          authService.obterUsuarioAtual(token),
          authService.obterAlteracaoEmailPendente(token),
        ]);
        if (!ativo) return;

        const dadosUsuario = respostaUsuario.usuario;
        atualizarUsuario(dadosUsuario);
        setNome(dadosUsuario.nome);
        setEmailAtual(dadosUsuario.email);
        const possuiFoto = Boolean(dadosUsuario.fotoPerfil);
        setTemFoto(possuiFoto);
        setCarregandoFoto(possuiFoto);
        setFotoUrl("");
        setErroFoto("");
        setSolicitacaoEmail(respostaEmail.solicitacaoPendente);
      } catch (erro) {
        if (ativo) {
          setAlerta({
            tipo: "erro",
            mensagem: erro.message || "Não foi possível carregar as configurações.",
          });
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarDados();
    return () => {
      ativo = false;
    };
  }, [token, atualizarUsuario]);

  useEffect(() => {
    if (!solicitacaoEmail) return undefined;
    const intervalo = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(intervalo);
  }, [solicitacaoEmail]);

  useEffect(() => {
    let ativo = true;
    let urlTemporaria = "";

    if (!token || !temFoto) {
      return undefined;
    }

    authService
      .obterFotoPerfil(token)
      .then((imagem) => {
        if (!ativo) return;
        urlTemporaria = URL.createObjectURL(imagem);
        setFotoUrl(urlTemporaria);
      })
      .catch((erro) => {
        if (ativo) {
          setFotoUrl("");
          setErroFoto(erro.message || "Não foi possível carregar a foto.");
        }
      })
      .finally(() => {
        if (ativo) setCarregandoFoto(false);
      });

    return () => {
      ativo = false;
      if (urlTemporaria) URL.revokeObjectURL(urlTemporaria);
    };
  }, [token, temFoto, fotoVersao]);

  function exibirAlerta(tipo, mensagem) {
    setAlerta({ tipo, mensagem });
  }

  async function salvarNome(evento) {
    evento.preventDefault();
    const nomeNormalizado = nome.trim();
    if (nomeNormalizado.length < 2 || nomeNormalizado.length > 100) {
      exibirAlerta("erro", "O nome deve ter entre 2 e 100 caracteres.");
      return;
    }

    setSalvandoNome(true);
    setAlerta(null);
    try {
      await authService.atualizarNome(token, nomeNormalizado);
      setNome(nomeNormalizado);
      atualizarUsuario({ nome: nomeNormalizado });
      exibirAlerta("sucesso", "Nome atualizado com sucesso.");
    } catch (erro) {
      exibirAlerta("erro", erro.message || "Não foi possível atualizar o nome.");
    } finally {
      setSalvandoNome(false);
    }
  }

  async function selecionarFoto(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;

    if (!TIPOS_IMAGEM_PERMITIDOS.has(arquivo.type)) {
      exibirAlerta("erro", "Escolha uma imagem JPEG, PNG ou WebP.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
      exibirAlerta("erro", "A imagem deve ter no máximo 5 MiB.");
      return;
    }

    setSalvandoFoto(true);
    setAlerta(null);
    try {
      const resposta = await authService.atualizarFotoPerfil(token, arquivo);
      setCarregandoFoto(true);
      setErroFoto("");
      setTemFoto(true);
      setFotoVersao((versao) => versao + 1);
      atualizarUsuario({ fotoPerfil: resposta.fotoPerfil });
      exibirAlerta(
        "sucesso",
        resposta.limpezaRemotaPendente
          ? "Foto atualizada. A limpeza da imagem anterior será concluída em segundo plano."
          : "Foto de perfil atualizada com sucesso.",
      );
    } catch (erro) {
      exibirAlerta("erro", erro.message || "Não foi possível atualizar a foto.");
    } finally {
      setSalvandoFoto(false);
    }
  }

  async function solicitarAlteracaoEmail(evento) {
    evento.preventDefault();
    const emailNormalizado = novoEmail.trim().toLowerCase();
    if (!emailNormalizado || emailNormalizado === emailAtual.toLowerCase()) {
      exibirAlerta("erro", "Informe um e-mail diferente do endereço atual.");
      return;
    }

    setSolicitandoEmail(true);
    setAlerta(null);
    try {
      const resposta = await authService.solicitarAlteracaoEmail(
        token,
        emailNormalizado,
        senhaEmail,
      );
      setSenhaEmail("");
      setNovoEmail("");
      const agoraSolicitacao = Date.now();
      setSolicitacaoEmail({
        novoEmail: emailNormalizado,
        etapa: "CONFIRMAR_EMAIL_ATUAL",
        expiraEm: new Date(agoraSolicitacao + 10 * 60 * 1000).toISOString(),
        solicitadaEm: new Date(agoraSolicitacao).toISOString(),
        codigoEnviadoEm: new Date(agoraSolicitacao).toISOString(),
        reenvioDisponivelEm: new Date(agoraSolicitacao + 60 * 1000).toISOString(),
        reenviosRestantes: 3,
      });
      setCodigoEmail("");
      exibirAlerta(
        "sucesso",
        resposta.mensagem || "Solicitação enviada. Confirme o e-mail atual para continuar.",
      );
      try {
        const estado = await authService.obterAlteracaoEmailPendente(token);
        setSolicitacaoEmail(estado.solicitacaoPendente);
      } catch (erroEstado) {
        exibirAlerta(
          "erro",
          `A solicitação foi enviada, mas não foi possível atualizar seu status: ${erroEstado.message}`,
        );
      }
    } catch (erro) {
      exibirAlerta("erro", erro.message || "Não foi possível solicitar a alteração.");
    } finally {
      setSolicitandoEmail(false);
    }
  }

  async function confirmarEtapaEmail(evento) {
    evento.preventDefault();
    const codigoNormalizado = codigoEmail.trim();
    if (!/^\d{6}$/.test(codigoNormalizado)) {
      exibirAlerta("erro", "Informe o código numérico de 6 dígitos recebido por e-mail.");
      return;
    }
    if (!solicitacaoEmail) return;
    if (codigoExpirado) {
      exibirAlerta("erro", "O código expirou. Solicite um novo código para continuar.");
      return;
    }

    setConfirmandoEmail(true);
    setAlerta(null);
    try {
      if (solicitacaoEmail.etapa === "CONFIRMAR_EMAIL_ATUAL") {
        const resposta = await authService.confirmarEmailAtual(
          token,
          codigoNormalizado,
        );
        const agoraEtapaNova = Date.now();
        let estadoAtualizado = true;
        setSolicitacaoEmail({
          ...solicitacaoEmail,
          etapa: "CONFIRMAR_NOVO_EMAIL",
          expiraEm: new Date(agoraEtapaNova + 10 * 60 * 1000).toISOString(),
          codigoEnviadoEm: new Date(agoraEtapaNova).toISOString(),
          reenvioDisponivelEm: new Date(agoraEtapaNova + 60 * 1000).toISOString(),
          reenviosRestantes: 3,
        });
        try {
          const estado = await authService.obterAlteracaoEmailPendente(token);
          if (estado.solicitacaoPendente) {
            setSolicitacaoEmail(estado.solicitacaoPendente);
          } else {
            estadoAtualizado = false;
          }
        } catch {
          estadoAtualizado = false;
        }
        setCodigoEmail("");
        exibirAlerta(
          "sucesso",
          estadoAtualizado
            ? resposta.mensagem ||
                "E-mail atual confirmado. Verifique o novo endereço para a próxima confirmação."
            : "E-mail atual confirmado e código enviado ao novo endereço. O status não foi atualizado; recarregue a página para sincronizar.",
        );
      } else {
        await authService.confirmarNovoEmail(token, codigoNormalizado);
        await logout();
        navigate("/login", {
          replace: true,
          state: {
            mensagem: `E-mail alterado para ${solicitacaoEmail.novoEmail}. Entre novamente para continuar.`,
          },
        });
      }
    } catch (erro) {
      exibirAlerta("erro", erro.message || "Não foi possível confirmar o código.");
    } finally {
      setConfirmandoEmail(false);
    }
  }

  async function reenviarCodigoEmail() {
    if (!solicitacaoEmail) return;
    setReenviandoEmail(true);
    setAlerta(null);
    try {
      const resposta = await authService.reenviarCodigoAlteracaoEmail(token);
      const agoraReenvio = Date.now();
      setSolicitacaoEmail((atual) =>
        atual
          ? {
              ...atual,
              expiraEm: new Date(agoraReenvio + 10 * 60 * 1000).toISOString(),
              codigoEnviadoEm: new Date(agoraReenvio).toISOString(),
              reenvioDisponivelEm: new Date(agoraReenvio + 60 * 1000).toISOString(),
              reenviosRestantes: Math.max(0, (atual.reenviosRestantes ?? 1) - 1),
            }
          : atual,
      );
      let estadoAtualizado = true;
      try {
        const estado = await authService.obterAlteracaoEmailPendente(token);
        if (estado.solicitacaoPendente) {
          setSolicitacaoEmail(estado.solicitacaoPendente);
        } else {
          estadoAtualizado = false;
        }
      } catch {
        estadoAtualizado = false;
      }
      setCodigoEmail("");
      exibirAlerta(
        "sucesso",
        estadoAtualizado
          ? resposta.mensagem || "Um novo código foi enviado."
          : "Novo código enviado. O status não foi atualizado; recarregue a página para sincronizar.",
      );
    } catch (erro) {
      exibirAlerta("erro", erro.message || "Não foi possível reenviar o código.");
    } finally {
      setReenviandoEmail(false);
    }
  }

  async function confirmarOperacao() {
    if (!confirmacao) return;
    const operacao = confirmacao;
    setAlerta(null);
    if (operacao === "foto") setSalvandoFoto(true);
    else setCancelandoEmail(true);

    try {
      if (operacao === "foto") {
        const resposta = await authService.removerFotoPerfil(token);
        setTemFoto(false);
        setCarregandoFoto(false);
        setFotoUrl("");
        setErroFoto("");
        atualizarUsuario({ fotoPerfil: null });
        exibirAlerta(
          "sucesso",
          resposta.limpezaRemotaPendente
            ? "Foto removida. A limpeza remota será concluída em segundo plano."
            : "Foto de perfil removida.",
        );
      } else {
        await authService.cancelarAlteracaoEmail(token);
        setSolicitacaoEmail(null);
        setCodigoEmail("");
        exibirAlerta("sucesso", "Solicitação de alteração de e-mail cancelada.");
      }
      setConfirmacao(null);
    } catch (erro) {
      exibirAlerta(
        "erro",
        erro.message || "Não foi possível concluir a operação.",
      );
    } finally {
      setSalvandoFoto(false);
      setCancelandoEmail(false);
    }
  }

  async function alterarSenha(evento) {
    evento.preventDefault();
    const erroSenha = validarSenhaNova(novaSenha);
    if (erroSenha) {
      exibirAlerta("erro", erroSenha);
      return;
    }
    if (novaSenha !== confirmarNovaSenha) {
      exibirAlerta("erro", "A confirmação deve ser igual à nova senha.");
      return;
    }
    if (novaSenha === senhaAtual) {
      exibirAlerta("erro", "A nova senha deve ser diferente da senha atual.");
      return;
    }

    setAlterandoSenha(true);
    setAlerta(null);
    try {
      await authService.alterarSenha(token, {
        senhaAtual,
        novaSenha,
        confirmarNovaSenha,
      });
      await logout();
      navigate("/login", {
        replace: true,
        state: {
          mensagem: "Senha alterada. Todas as sessões foram encerradas; entre novamente com sua nova senha.",
        },
      });
    } catch (erro) {
      exibirAlerta("erro", erro.message || "Não foi possível alterar a senha.");
    } finally {
      setAlterandoSenha(false);
    }
  }

  const etapaEmailAtual =
    solicitacaoEmail?.etapa === "CONFIRMAR_EMAIL_ATUAL";
  const instanteAtual =
    agora ||
    Date.parse(solicitacaoEmail?.codigoEnviadoEm || "") ||
    0;
  const expiracao = formatarData(solicitacaoEmail?.expiraEm);
  const codigoExpirado =
    Boolean(solicitacaoEmail?.expiraEm) &&
    Date.parse(solicitacaoEmail.expiraEm) <= instanteAtual;
  const segundosAteReenvio = Math.max(
    0,
    Math.ceil(
      (Date.parse(solicitacaoEmail?.reenvioDisponivelEm || "") -
        instanteAtual) /
        1000,
    ) ||
      0,
  );
  const reenviosRestantes = solicitacaoEmail?.reenviosRestantes ?? 3;
  const destinatarioCodigo = etapaEmailAtual
    ? emailAtual
    : solicitacaoEmail?.novoEmail;
  const ocupado =
    salvandoNome ||
    salvandoFoto ||
    solicitandoEmail ||
    confirmandoEmail ||
    reenviandoEmail ||
    alterandoSenha ||
    cancelandoEmail;

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fadeIn">
      <header className="mb-1">
        <p className="text-sm font-medium text-accent">Conta do administrador</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
          Configurações
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-fg-2">
          Gerencie suas informações pessoais e a segurança da sua conta.
        </p>
      </header>

      {alerta && <Alerta tipo={alerta.tipo}>{alerta.mensagem}</Alerta>}

      {carregando ? (
        <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-2xl border border-line-subtle bg-surface">
          <LoaderCircle
            size={26}
            className="animate-spin text-accent"
            aria-hidden="true"
          />
          <p className="text-sm text-fg-3">Carregando configurações...</p>
        </div>
      ) : (
        <>
          <Secao
            icone={Image}
            titulo="Foto de perfil"
            descricao="Adicione ou atualize a imagem exibida na sua conta."
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-subtle bg-bg-2 text-2xl font-semibold text-accent">
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt={`Foto de perfil de ${usuario?.nome || "administrador"}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span aria-hidden="true">{iniciais(usuario?.nome)}</span>
                )}
                {carregandoFoto && (
                  <span className="absolute inset-0 flex items-center justify-center bg-surface/75">
                    <LoaderCircle
                      size={22}
                      className="animate-spin text-accent"
                      aria-label="Carregando foto de perfil"
                    />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium text-fg">{usuario?.nome || nome}</p>
                <p className="mt-1 break-all text-sm text-fg-3">{emailAtual}</p>
                <p className="mt-2 text-xs leading-relaxed text-fg-3">
                  JPEG, PNG ou WebP, até 5 MiB. Dimensões máximas: 4096 × 4096
                  pixels e 16 megapixels.
                </p>
                {erroFoto && (
                  <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">
                    {erroFoto}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <input
                  ref={inputFotoRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  aria-label="Selecionar foto de perfil"
                  onChange={selecionarFoto}
                  disabled={ocupado}
                />
                <button
                  type="button"
                  className={CLASSE_BOTAO}
                  onClick={() => inputFotoRef.current?.click()}
                  disabled={ocupado}
                >
                  {salvandoFoto ? (
                    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Camera size={16} aria-hidden="true" />
                  )}
                  {temFoto ? "Substituir foto" : "Adicionar foto"}
                </button>
                {temFoto && (
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line-subtle px-4 text-sm font-medium text-fg-2 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-60 dark:hover:border-rose-900/50 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
                    onClick={() => setConfirmacao("foto")}
                    disabled={ocupado}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    Excluir
                  </button>
                )}
              </div>
            </div>
          </Secao>

          <Secao
            icone={UserRound}
            titulo="Nome"
            descricao="Atualize o nome associado à sua conta de administrador."
          >
            <form className="space-y-4" onSubmit={salvarNome}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-fg-2">Nome completo</span>
                <input
                  className={CLASSE_CAMPO}
                  type="text"
                  name="nome"
                  autoComplete="name"
                  minLength={2}
                  maxLength={100}
                  value={nome}
                  onChange={(evento) => setNome(evento.target.value)}
                  disabled={ocupado}
                  required
                />
              </label>
              <div className="flex justify-end">
                <button type="submit" className={CLASSE_BOTAO} disabled={ocupado}>
                  {salvandoNome && (
                    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                  )}
                  Salvar nome
                </button>
              </div>
            </form>
          </Secao>

          <Secao
            icone={Mail}
            titulo="E-mail"
            descricao="O endereço atual permanece ativo até a confirmação do novo e-mail."
          >
            <div className="mb-5 rounded-xl border border-line-subtle bg-bg-2 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-fg-3">
                E-mail atual
              </p>
              <p className="mt-1 break-all text-sm font-medium text-fg">
                {emailAtual}
              </p>
            </div>

            {solicitacaoEmail ? (
              <div className="space-y-5">
                <div className="rounded-xl border border-accent/20 bg-accent-soft/50 p-4">
                  <div className="flex items-start gap-3">
                    <Clock3
                      size={18}
                      className="mt-0.5 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-fg">
                        Alteração de e-mail em andamento
                      </p>
                      <p className="mt-1 break-all text-sm text-fg-2">
                        Novo endereço: {solicitacaoEmail.novoEmail}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-fg-2">
                        {etapaEmailAtual
                          ? "Confirme o código enviado ao e-mail atual para autorizar a solicitação."
                          : "O e-mail atual foi confirmado. Confirme agora o código enviado ao novo endereço para concluir a alteração."}
                      </p>
                      <p className="mt-2 break-all text-sm font-medium text-fg">
                        Código enviado para: {destinatarioCodigo}
                      </p>
                      {expiracao && (
                        <p className="mt-2 text-xs text-fg-3">
                          {codigoExpirado
                            ? `O código expirou (${expiracao}).`
                            : `O código expira em ${expiracao}.`}
                        </p>
                      )}
                      {reenviosRestantes <= 0 && (
                        <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                          Limite de reenvios desta etapa atingido. Cancele a solicitação para iniciar outra.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-fg-3">
                  Informe o código numérico de uso único recebido no endereço
                  indicado. Cada código expira em 10 minutos.
                </p>
                <form className="space-y-4" onSubmit={confirmarEtapaEmail}>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-fg-2">
                      Código de confirmação
                    </span>
                    <input
                      className={CLASSE_CAMPO}
                      type="text"
                      name="codigoEmail"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      value={codigoEmail}
                      onChange={(evento) =>
                        setCodigoEmail(evento.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      disabled={ocupado || codigoExpirado}
                      required
                    />
                  </label>
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line-subtle px-4 text-sm font-medium text-fg-2 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => setConfirmacao("email")}
                      disabled={ocupado}
                    >
                      Cancelar solicitação
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line-subtle px-4 text-sm font-medium text-fg-2 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={reenviarCodigoEmail}
                      disabled={
                        ocupado ||
                        segundosAteReenvio > 0 ||
                        reenviosRestantes <= 0
                      }
                    >
                      {reenviandoEmail ? (
                        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <Mail size={16} aria-hidden="true" />
                      )}
                      {reenviosRestantes <= 0
                        ? "Limite de reenvios atingido"
                        : segundosAteReenvio > 0
                          ? `Reenviar em ${formatarDuracao(segundosAteReenvio)}`
                          : "Reenviar código"}
                    </button>
                    <button
                      type="submit"
                      className={CLASSE_BOTAO}
                      disabled={ocupado || codigoExpirado || codigoEmail.length !== 6}
                    >
                      {confirmandoEmail ? (
                        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <ShieldCheck size={16} aria-hidden="true" />
                      )}
                      {etapaEmailAtual
                        ? "Confirmar e-mail atual"
                        : "Confirmar novo e-mail"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={solicitarAlteracaoEmail}>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-fg-2">
                    Novo e-mail
                  </span>
                  <input
                    className={CLASSE_CAMPO}
                    type="email"
                    name="novoEmail"
                    autoComplete="email"
                    maxLength={254}
                    value={novoEmail}
                    onChange={(evento) => setNovoEmail(evento.target.value)}
                    disabled={ocupado}
                    required
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-fg-2">
                    Senha atual
                  </span>
                  <input
                    className={CLASSE_CAMPO}
                    type="password"
                    name="senhaEmail"
                    autoComplete="current-password"
                    maxLength={128}
                    value={senhaEmail}
                    onChange={(evento) => setSenhaEmail(evento.target.value)}
                    disabled={ocupado}
                    required
                  />
                </label>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className={CLASSE_BOTAO}
                    disabled={ocupado}
                  >
                    {solicitandoEmail ? (
                      <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Mail size={16} aria-hidden="true" />
                    )}
                    Solicitar alteração
                  </button>
                </div>
              </form>
            )}
          </Secao>

          <Secao
            icone={LockKeyhole}
            titulo="Senha"
            descricao="Use uma senha forte e exclusiva para proteger sua conta."
          >
            <form className="space-y-4" onSubmit={alterarSenha}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-fg-2">Senha atual</span>
                <input
                  className={CLASSE_CAMPO}
                  type={mostrarSenhas ? "text" : "password"}
                  name="senhaAtual"
                  autoComplete="current-password"
                  maxLength={128}
                  value={senhaAtual}
                  onChange={(evento) => setSenhaAtual(evento.target.value)}
                  disabled={ocupado}
                  required
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-fg-2">Nova senha</span>
                <input
                  className={CLASSE_CAMPO}
                  type={mostrarSenhas ? "text" : "password"}
                  name="novaSenha"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  value={novaSenha}
                  onChange={(evento) => setNovaSenha(evento.target.value)}
                  disabled={ocupado}
                  required
                />
                <span className="block text-xs leading-relaxed text-fg-3">
                  Use 8 a 128 caracteres, incluindo maiúscula, minúscula,
                  número e símbolo.
                </span>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-fg-2">
                  Confirmar nova senha
                </span>
                <input
                  className={CLASSE_CAMPO}
                  type={mostrarSenhas ? "text" : "password"}
                  name="confirmarNovaSenha"
                  autoComplete="new-password"
                  maxLength={128}
                  value={confirmarNovaSenha}
                  onChange={(evento) =>
                    setConfirmarNovaSenha(evento.target.value)
                  }
                  disabled={ocupado}
                  required
                />
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-fg-2">
                <input
                  type="checkbox"
                  checked={mostrarSenhas}
                  onChange={(evento) => setMostrarSenhas(evento.target.checked)}
                  disabled={ocupado}
                  className="h-4 w-4 rounded border-line accent-[#7656a8] focus:ring-focus"
                />
                Mostrar senhas
              </label>
              <div className="flex justify-end">
                <button type="submit" className={CLASSE_BOTAO} disabled={ocupado}>
                  {alterandoSenha ? (
                    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <LockKeyhole size={16} aria-hidden="true" />
                  )}
                  Alterar senha
                </button>
              </div>
            </form>
          </Secao>
        </>
      )}

      {confirmacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirmacao-titulo"
            aria-describedby="confirmacao-descricao"
            className="my-auto w-full max-w-md rounded-2xl border border-line-subtle bg-surface p-6 shadow-2xl"
          >
            <h2 id="confirmacao-titulo" className="text-lg font-bold text-fg">
              {confirmacao === "foto"
                ? "Excluir foto de perfil?"
                : "Cancelar alteração de e-mail?"}
            </h2>
            <p
              id="confirmacao-descricao"
              className="mt-2 text-sm leading-relaxed text-fg-2"
            >
              {confirmacao === "foto"
                ? "A foto atual será removida da sua conta."
                : "Os códigos enviados deixarão de ser válidos e o e-mail atual permanecerá ativo."}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-line-subtle px-4 text-sm font-medium text-fg-2 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => setConfirmacao(null)}
                disabled={ocupado}
              >
                Voltar
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-medium text-white transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={confirmarOperacao}
                disabled={ocupado}
              >
                {cancelandoEmail || (salvandoFoto && confirmacao === "foto") ? (
                  <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                ) : confirmacao === "foto" ? (
                  <Trash2 size={16} aria-hidden="true" />
                ) : (
                  <Mail size={16} aria-hidden="true" />
                )}
                {confirmacao === "foto" ? "Excluir foto" : "Cancelar solicitação"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
