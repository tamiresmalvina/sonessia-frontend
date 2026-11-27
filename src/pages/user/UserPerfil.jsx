import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, LoaderCircle, Trash2 } from "lucide-react";
import { useAuth } from "../../contexts/useAuth.js";
import { authService } from "../../services/auth.service.js";
import { validarIdade } from "../../utils/validacoes.js";
import { ConfirmDialog } from "../../components/user/ui/UserDialogs.jsx";
import { useToast } from "../../components/user/ui/useToast.js";

const TIPOS_IMAGEM = new Set(["image/jpeg", "image/png", "image/webp"]);
const TAMANHO_MAXIMO_IMAGEM = 2 * 1024 * 1024;

function dataParaInput(valor) {
  if (!valor) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  return String(valor).slice(0, 10);
}

function iniciaisDoNome(nome) {
  return (nome || "U").trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((parte) => parte[0]?.toLocaleUpperCase("pt-BR")).join("") || "U";
}

function mensagemErro(erro) {
  if (!erro?.status) return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  if (erro.status === 400) {
    const detalhe = erro.detalhes?.find((item) => ["nome", "dataNascimento"].includes(item?.campo));
    if (detalhe?.campo === "nome") return { campo: "nome", mensagem: detalhe.mensagem };
    if (detalhe?.campo === "dataNascimento") return { campo: "dataNascimento", mensagem: detalhe.mensagem };
    return "Confira os dados informados e tente novamente.";
  }
  return "Não foi possível salvar os dados agora. Tente novamente.";
}

export default function UserPerfil() {
  const { usuario, token, atualizarUsuario } = useAuth();
  const toast = useToast();
  const inputFotoRef = useRef(null);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [original, setOriginal] = useState({ nome: "", dataNascimento: "" });
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [removendoFoto, setRemovendoFoto] = useState(false);
  const [confirmarRemocao, setConfirmarRemocao] = useState(false);
  const [fotoCarregada, setFotoCarregada] = useState({ caminho: "", url: "" });
  const [erro, setErro] = useState("");
  const [erroNome, setErroNome] = useState("");
  const [erroData, setErroData] = useState("");
  const [nomeTocado, setNomeTocado] = useState(false);
  const [dataTocada, setDataTocada] = useState(false);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      try {
        const resposta = await authService.obterUsuarioAtual(token);
        if (!ativo) return;
        const dados = resposta.usuario;
        const perfil = { nome: dados.nome || "", dataNascimento: dataParaInput(dados.dataNascimento) };
        atualizarUsuario(dados);
        setNome(perfil.nome);
        setDataNascimento(perfil.dataNascimento);
        setOriginal(perfil);
      } catch {
        if (ativo) setErro("Não foi possível carregar seus dados. Atualize a página para tentar novamente.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    if (token) carregar();
    return () => { ativo = false; };
  }, [token, atualizarUsuario]);

  useEffect(() => {
    let ativo = true;
    let urlTemporaria = "";
    if (!token || !usuario?.fotoPerfil) {
      return undefined;
    }
    authService.obterFotoPerfil(token).then((imagem) => {
      if (!ativo) return;
      urlTemporaria = URL.createObjectURL(imagem);
      setFotoCarregada({ caminho: usuario.fotoPerfil, url: urlTemporaria });
    }).catch(() => {
      if (ativo) setFotoCarregada({ caminho: usuario.fotoPerfil, url: "" });
    });
    return () => {
      ativo = false;
      if (urlTemporaria) URL.revokeObjectURL(urlTemporaria);
    };
  }, [token, usuario?.fotoPerfil]);

  const fotoUrl = fotoCarregada.caminho === usuario?.fotoPerfil ? fotoCarregada.url : "";

  const nomeNormalizado = nome.trim();
  const validacaoData = useMemo(() => validarIdade(dataNascimento), [dataNascimento]);
  const dataMudou = dataNascimento !== original.dataNascimento;
  const nomeMudou = nomeNormalizado !== original.nome;
  const nomeValido = nomeNormalizado.length >= 2 && nomeNormalizado.length <= 100;
  const nomeErroExibido = erroNome || (nomeTocado && !nomeValido ? "O nome deve ter entre 2 e 100 caracteres." : "");
  const dataErroExibido = erroData || (dataTocada && !validacaoData.valido
    ? validacaoData.erro.includes("16 anos") ? "Obrigatório. É preciso ter pelo menos 16 anos." : validacaoData.erro
    : "");
  const formularioValido = nomeValido && validacaoData.valido;
  const temAlteracoes = nomeMudou || dataMudou;
  const podeSalvar = !carregando && !salvando && temAlteracoes && formularioValido;

  async function salvar(evento) {
    evento.preventDefault();
    if (!podeSalvar) return;
    setErro("");
    setErroNome(nomeValido ? "" : "O nome deve ter entre 2 e 100 caracteres.");
    setErroData(validacaoData.valido ? "" : (dataNascimento ? validacaoData.erro : "Obrigatório. É preciso ter pelo menos 16 anos."));
    setSalvando(true);
    let nomeSalvo = original.nome;
    let dataSalva = original.dataNascimento;
    try {
      if (nomeMudou) {
        const respostaNome = await authService.atualizarNome(token, nomeNormalizado);
        nomeSalvo = respostaNome.usuario?.nome || nomeNormalizado;
        atualizarUsuario({ nome: nomeSalvo });
      }
      if (dataMudou) {
        const respostaData = await authService.atualizarDataNascimento(token, dataNascimento);
        dataSalva = dataParaInput(respostaData.usuario?.dataNascimento || dataNascimento);
        atualizarUsuario({ dataNascimento: respostaData.usuario?.dataNascimento || dataSalva });
      }
      const perfilSalvo = { nome: nomeSalvo, dataNascimento: dataSalva };
      setOriginal(perfilSalvo);
      setNome(nomeSalvo);
      setDataNascimento(dataSalva);
      setErroNome("");
      setErroData("");
      toast("Dados pessoais atualizados com sucesso.", { tone: "success" });
    } catch (falha) {
      setOriginal({ nome: nomeSalvo, dataNascimento: dataSalva });
      atualizarUsuario({ nome: nomeSalvo, dataNascimento: dataSalva });
      const mensagem = mensagemErro(falha);
      if (typeof mensagem === "object") {
        if (mensagem.campo === "nome") setErroNome(mensagem.mensagem);
        else setErroData(mensagem.mensagem);
      } else setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  async function selecionarFoto(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;
    setErro("");
    if (!TIPOS_IMAGEM.has(arquivo.type)) {
      toast("Escolha uma imagem JPG, PNG ou WebP.", { tone: "error" });
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_IMAGEM) {
      toast("A imagem deve ter no máximo 2 MB.", { tone: "error" });
      return;
    }
    if (enviandoFoto) return;
    setEnviandoFoto(true);
    try {
      const resposta = await authService.atualizarFotoPerfil(token, arquivo);
      const caminho = resposta.fotoPerfil ? `${resposta.fotoPerfil}?v=${Date.now()}` : null;
      atualizarUsuario({ fotoPerfil: caminho });
      toast("Foto de perfil atualizada.", { tone: "success" });
    } catch (falha) {
      const mensagem = falha.codigo === "IMAGEM_INVALIDA" || falha.codigo === "FORMATO_IMAGEM_NAO_SUPORTADO"
        ? "O arquivo não é uma imagem válida. Escolha um JPG, PNG ou WebP." : "Não foi possível atualizar a foto. Tente novamente.";
      toast(mensagem, { tone: "error" });
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function removerFoto() {
    if (removendoFoto) return;
    setRemovendoFoto(true);
    try {
      await authService.removerFotoPerfil(token);
      atualizarUsuario({ fotoPerfil: null });
      setConfirmarRemocao(false);
      toast("Foto removida.", { tone: "success" });
    } catch {
      toast("Não foi possível remover a foto. Tente novamente.", { tone: "error" });
    } finally {
      setRemovendoFoto(false);
    }
  }

  return (
    <div className="user-page px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header>
        <p className="user-page-eyebrow">Minha área</p>
        <h1 className="user-page-title">Perfil e conta</h1>
        <p className="user-page-description">Dados de acesso e preferências da sua conta.</p>
      </header>

      {erro && <p role="alert" className="mt-6 text-sm text-danger">{erro}</p>}
      {carregando ? (
        <div role="status" className="mt-8 flex min-h-40 items-center justify-center text-fg-3"><LoaderCircle className="animate-spin" aria-hidden="true" /><span className="sr-only">Carregando perfil</span></div>
      ) : (
        <div className="mt-8 grid max-w-[800px] gap-6 sm:mt-10">
          <section aria-labelledby="foto-perfil-titulo" className="rounded-2xl border border-line-subtle bg-surface p-5 sm:p-7 lg:p-9">
            <h2 id="foto-perfil-titulo" className="text-xl font-medium tracking-[-0.02em] text-fg">Foto de perfil</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-2">JPG, PNG ou WebP, até 2 MB.</p>
            <div className="mt-7 flex flex-wrap items-center gap-5 sm:gap-7">
              <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full bg-accent-soft text-3xl font-medium text-accent sm:size-[106px]" aria-label={fotoUrl ? `Foto de ${nome}` : `Iniciais ${iniciaisDoNome(nome)}`}>
                {fotoUrl ? <img src={fotoUrl} alt={`Foto de perfil de ${nome}`} className="size-full object-cover" /> : iniciaisDoNome(nome)}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <input ref={inputFotoRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Selecionar foto de perfil" onChange={selecionarFoto} />
                <button type="button" disabled={enviandoFoto || removendoFoto} onClick={() => inputFotoRef.current?.click()} className="user-button user-button-md user-button-secondary min-h-11">
                  {enviandoFoto ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Camera size={16} aria-hidden="true" />}
                  {enviandoFoto ? "Enviando…" : usuario?.fotoPerfil ? "Alterar foto" : "Adicionar foto"}
                </button>
                {usuario?.fotoPerfil && <button type="button" disabled={enviandoFoto || removendoFoto} onClick={() => setConfirmarRemocao(true)} className="user-button user-button-md user-button-ghost min-h-11 text-fg-2"><Trash2 size={16} aria-hidden="true" />Remover foto</button>}
              </div>
            </div>
          </section>

          <section aria-labelledby="dados-pessoais-titulo" className="rounded-2xl border border-line-subtle bg-surface p-5 sm:p-7 lg:p-9">
            <h2 id="dados-pessoais-titulo" className="text-xl font-medium tracking-[-0.02em] text-fg">Dados pessoais</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-2">Você pode alterar seu nome, sua data de nascimento a qualquer momento. Depois de editar, clique em “Salvar alterações”.</p>
            <form className="mt-7 space-y-5" onSubmit={salvar} noValidate>
              <label htmlFor="perfil-nome" className="block space-y-2">
                <span className="text-sm font-medium text-fg">Nome</span>
                <input id="perfil-nome" name="nome" autoComplete="name" maxLength={100} value={nome} disabled={salvando} aria-invalid={Boolean(nomeErroExibido)} aria-describedby={nomeErroExibido ? "perfil-nome-erro" : undefined} onChange={(evento) => { setNome(evento.target.value); setNomeTocado(true); setErroNome(""); setErro(""); }} className={`user-input ${nomeErroExibido ? "border-danger" : ""}`} />
                {nomeErroExibido && <span id="perfil-nome-erro" role="alert" className="block text-xs text-danger">{nomeErroExibido}</span>}
              </label>
              <label htmlFor="perfil-data-nascimento" className="block space-y-2">
                <span className="text-sm font-medium text-fg">Data de nascimento</span>
                <input id="perfil-data-nascimento" name="dataNascimento" type="date" autoComplete="bday" max={new Date().toISOString().slice(0, 10)} value={dataNascimento} disabled={salvando} aria-invalid={Boolean(dataErroExibido)} aria-describedby="perfil-data-ajuda" onChange={(evento) => { setDataNascimento(evento.target.value); setDataTocada(true); setErroData(""); setErro(""); }} className={`user-input ${dataErroExibido ? "border-danger" : ""}`} />
                <span id="perfil-data-ajuda" className={`block text-[13px] ${dataErroExibido ? "text-danger" : "text-fg-3"}`}>{dataErroExibido || "Obrigatório. É preciso ter pelo menos 16 anos."}</span>
              </label>
              <button type="submit" disabled={!podeSalvar} aria-busy={salvando || undefined} className="user-button user-button-md user-button-primary min-h-11">
                {salvando && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
                {salvando ? "Salvando…" : "Salvar alterações"}
              </button>
            </form>
          </section>
        </div>
      )}

      {confirmarRemocao && <ConfirmDialog title="Remover foto de perfil?" confirmLabel="Remover foto" cancelLabel="Cancelar" loading={removendoFoto} onCancel={() => setConfirmarRemocao(false)} onConfirm={removerFoto}>Sua foto será removida e suas iniciais voltarão a aparecer no lugar. Você pode adicionar outra foto quando quiser.</ConfirmDialog>}
    </div>
  );
}
