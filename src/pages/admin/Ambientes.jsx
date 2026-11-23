import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/useAuth.js";
import { categoriasService } from "../../services/categorias.service.js";
import { ambienteService, audioService } from "../../services/sons.service.js";
import {
  obterComponenteIconeAudio,
} from "../../data/icones-audio.js";
import { ambienteDuplicado } from "../../utils/ambiente-duplicado.js";

const CLASSE_CAMPO =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-disabled transition-all focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20";

const FINALIDADES = [
  { valor: "ESTUDO", rotulo: "Estudo" },
  { valor: "RELAXAMENTO", rotulo: "Relaxamento" },
  { valor: "SONO", rotulo: "Sono" },
  { valor: "MEDITACAO", rotulo: "Meditação" },
  { valor: "CONCENTRACAO", rotulo: "Concentração" },
  { valor: "TRABALHO", rotulo: "Trabalho" },
];

const FORMULARIO_VAZIO = {
  nome: "",
  descricao: "",
  finalidade: "RELAXAMENTO",
  idCategoria: "",
  publicado: false,
  imagem: "",
  autorImagem: "",
  tituloOriginalImagem: "",
  fonteImagem: "",
  licencaImagem: "",
  audios: [],
  imagemArquivo: null,
  imagemPrevia: "",
  removerImagem: false,
};

function rotuloFinalidade(valor) {
  return FINALIDADES.find((item) => item.valor === valor)?.rotulo || valor;
}

function Alerta({ tipo, mensagem, onFechar }) {
  if (!mensagem) return null;
  const sucesso = tipo === "sucesso";
  const Icone = sucesso ? Check : AlertCircle;

  return (
    <div
      role={sucesso ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
        sucesso
          ? "border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
          : "border-rose-200 bg-rose-50/80 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
      }`}
    >
      <Icone size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span className="flex-1 leading-relaxed">{mensagem}</span>
      {onFechar && (
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar mensagem"
          className="rounded-md p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

function ModalAmbiente({
  ambiente,
  audios,
  categorias,
  formulario,
  erro,
  salvando,
  onChange,
  onFechar,
  onSubmit,
}) {
  const editando = Boolean(ambiente);
  const idsSelecionados = new Set(formulario.audios.map((item) => item.idAudio));
  const categoriasDisponiveis = categorias.filter(
    (categoria) => categoria.ativa || categoria.nome === ambiente?.categoria,
  );

  function adicionarAudio(idAudio) {
    if (!idAudio || idsSelecionados.has(idAudio)) return;
    onChange("audios", [...formulario.audios, { idAudio, volume: 50 }]);
  }

  function alterarVolume(idAudio, volume) {
    onChange(
      "audios",
      formulario.audios.map((item) =>
        item.idAudio === idAudio
          ? { ...item, volume: Math.max(0, Math.min(100, Number(volume) || 0)) }
          : item,
      ),
    );
  }

  function removerAudio(idAudio) {
    onChange(
      "audios",
      formulario.audios.filter((item) => item.idAudio !== idAudio),
    );
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-xs"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !salvando) onFechar();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-ambiente-titulo"
        className="my-auto max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-line-subtle bg-surface p-5 shadow-2xl sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-ambiente-titulo" className="text-lg font-bold tracking-tight text-fg">
              {editando ? "Editar ambiente pronto" : "Novo ambiente pronto"}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-fg-2">
              {editando
                ? "Atualize os metadados e a composição do ambiente."
                : "Configure os dados e selecione os áudios da composição."}
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            disabled={salvando}
            aria-label="Fechar formulário"
            className="rounded-lg p-2 text-icon-muted transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {erro && <Alerta tipo="erro" mensagem={erro} />}

        <form onSubmit={onSubmit} className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ambiente-nome" className="mb-1.5 block text-sm font-medium text-fg">
                Nome
              </label>
              <input
                id="ambiente-nome"
                value={formulario.nome}
                onChange={(evento) => onChange("nome", evento.target.value)}
                maxLength={255}
                required
                autoFocus
                className={CLASSE_CAMPO}
              />
            </div>
            <div>
              <label htmlFor="ambiente-finalidade" className="mb-1.5 block text-sm font-medium text-fg">
                Finalidade
              </label>
              <select
                id="ambiente-finalidade"
                value={formulario.finalidade}
                onChange={(evento) => onChange("finalidade", evento.target.value)}
                required
                className={CLASSE_CAMPO}
              >
                {FINALIDADES.map((finalidade) => (
                  <option key={finalidade.valor} value={finalidade.valor}>
                    {finalidade.rotulo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ambiente-categoria" className="mb-1.5 block text-sm font-medium text-fg">
                Categoria <span className="font-normal text-fg-3">(opcional)</span>
              </label>
              <select
                id="ambiente-categoria"
                value={formulario.idCategoria}
                onChange={(evento) => onChange("idCategoria", evento.target.value)}
                className={CLASSE_CAMPO}
              >
                <option value="">Sem categoria</option>
                {categoriasDisponiveis.map((categoria) => (
                  <option key={categoria.idCategoria} value={categoria.idCategoria}>
                    {categoria.nome}{categoria.ativa ? "" : " (inativa)"}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="ambiente-descricao" className="mb-1.5 block text-sm font-medium text-fg">
                Descrição <span className="font-normal text-fg-3">(opcional)</span>
              </label>
              <textarea
                id="ambiente-descricao"
                value={formulario.descricao}
                onChange={(evento) => onChange("descricao", evento.target.value)}
                maxLength={1000}
                rows={3}
                className={`${CLASSE_CAMPO} resize-y`}
              />
            </div>
          </div>

          <fieldset className="rounded-xl border border-line-subtle p-4">
            <legend className="px-1 text-sm font-medium text-fg">Imagem <span className="font-normal text-fg-3">(opcional)</span></legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="ambiente-imagem-arquivo" className="mb-1.5 block text-sm font-medium text-fg">Arquivo da imagem</label>
                <input
                  id="ambiente-imagem-arquivo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(evento) => {
                    const arquivo = evento.target.files?.[0] || null;
                    if (arquivo) {
                      onChange("imagemArquivo", arquivo);
                      onChange("imagemPrevia", URL.createObjectURL(arquivo));
                      onChange("removerImagem", false);
                    } else {
                      onChange("imagemArquivo", null);
                      onChange("imagemPrevia", "");
                    }
                  }}
                  className={`${CLASSE_CAMPO} file:mr-3 file:rounded-lg file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-accent`}
                />
                <p className="mt-1.5 text-xs text-fg-3">
                  JPEG, PNG ou WebP, até 5 MB.
                </p>
                {(formulario.imagemPrevia || (!formulario.removerImagem && formulario.imagem)) && (
                  <div className="mt-3 flex items-start gap-3">
                    <img
                      src={formulario.imagemPrevia || formulario.imagem}
                      alt="Prévia da capa do ambiente"
                      className="h-28 w-40 rounded-xl border border-line-subtle object-cover"
                    />
                    {editando && (
                      <button
                        type="button"
                        onClick={() => {
                          onChange("removerImagem", true);
                          onChange("imagemArquivo", null);
                          onChange("imagemPrevia", "");
                        }}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        Remover imagem
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="ambiente-autor" className="mb-1.5 block text-sm font-medium text-fg">Autor</label>
                <input id="ambiente-autor" value={formulario.autorImagem} onChange={(evento) => onChange("autorImagem", evento.target.value)} maxLength={255} className={CLASSE_CAMPO} />
              </div>
              <div>
                <label htmlFor="ambiente-titulo-imagem" className="mb-1.5 block text-sm font-medium text-fg">Título original da imagem</label>
                <input id="ambiente-titulo-imagem" value={formulario.tituloOriginalImagem} onChange={(evento) => onChange("tituloOriginalImagem", evento.target.value)} maxLength={255} className={CLASSE_CAMPO} />
              </div>
              <div>
                <label htmlFor="ambiente-fonte-imagem" className="mb-1.5 block text-sm font-medium text-fg">Fonte da imagem</label>
                <input id="ambiente-fonte-imagem" value={formulario.fonteImagem} onChange={(evento) => onChange("fonteImagem", evento.target.value)} maxLength={255} className={CLASSE_CAMPO} />
              </div>
              <div>
                <label htmlFor="ambiente-licenca-imagem" className="mb-1.5 block text-sm font-medium text-fg">Licença da imagem</label>
                <input id="ambiente-licenca-imagem" value={formulario.licencaImagem} onChange={(evento) => onChange("licencaImagem", evento.target.value)} maxLength={255} className={CLASSE_CAMPO} />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-line-subtle p-4">
            <legend className="px-1 text-sm font-medium text-fg">
              Composição <span className="font-normal text-fg-3">({formulario.audios.length} selecionado(s))</span>
            </legend>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <label htmlFor="audio-composicao" className="mb-1.5 block text-sm font-medium text-fg">Adicionar áudio</label>
                <select
                  id="audio-composicao"
                  value=""
                  onChange={(evento) => adicionarAudio(evento.target.value)}
                  className={CLASSE_CAMPO}
                >
                  <option value="">Selecione um áudio</option>
                  {audios
                    .filter((audio) => !idsSelecionados.has(audio.idAudio))
                    .map((audio) => (
                      <option key={audio.idAudio} value={audio.idAudio}>
                        {audio.titulo} — {audio.categoria || "Sem categoria"}
                      </option>
                    ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                {formulario.audios.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-line-subtle p-4 text-sm text-fg-3">
                    Selecione pelo menos um áudio para a composição.
                  </p>
                ) : (
                  <ul className="divide-y divide-line-subtle overflow-hidden rounded-xl border border-line-subtle">
                    {formulario.audios.map((item) => {
                      const audio = audios.find((opcao) => opcao.idAudio === item.idAudio);
                      const IconeAudio = obterComponenteIconeAudio(audio?.icone);
                      return (
                        <li key={item.idAudio} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                            <IconeAudio size={18} aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-fg">{audio?.titulo || item.idAudio}</p>
                            <p className="text-xs text-fg-3">{audio?.categoria || "Sem categoria"}</p>
                          </div>
                          <div className="flex items-center gap-3 sm:min-w-56">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={item.volume}
                              onChange={(evento) => alterarVolume(item.idAudio, evento.target.value)}
                              aria-label={`Volume de ${audio?.titulo || "áudio"}`}
                              className="vol min-w-0 flex-1"
                              style={{ "--v": `${item.volume}%` }}
                            />
                            <output className="w-10 text-right text-xs tabular-nums text-fg">{item.volume}%</output>
                            <button
                              type="button"
                              onClick={() => removerAudio(item.idAudio)}
                              aria-label={`Remover ${audio?.titulo || "áudio"} da composição`}
                              className="rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:hover:bg-rose-950/30"
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </fieldset>

          {editando ? null : (
            <label className="flex items-center gap-3 text-sm text-fg-2">
              <input
                type="checkbox"
                checked={formulario.publicado}
                onChange={(evento) => onChange("publicado", evento.target.checked)}
                className="size-4 accent-[var(--color-accent)]"
              />
              Publicar imediatamente
            </label>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-line-subtle pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onFechar} disabled={salvando} className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-surface px-5 text-sm font-medium text-fg-2 transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-60">
              Cancelar
            </button>
            <button type="submit" disabled={salvando || formulario.audios.length === 0} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] px-5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[image:linear-gradient(100deg,#684a98,#5667b8)] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
              {salvando && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
              {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar ambiente"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ModalExclusaoAmbiente({ ambiente, erro, excluindo, onFechar, onConfirmar }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !excluindo) onFechar();
      }}
    >
      <section role="alertdialog" aria-modal="true" aria-labelledby="excluir-ambiente-titulo" className="w-full max-w-md rounded-2xl border border-line-subtle bg-surface p-6 shadow-2xl sm:p-7">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
          <Trash2 size={20} aria-hidden="true" />
        </div>
        <h2 id="excluir-ambiente-titulo" className="text-lg font-bold tracking-tight text-fg">Excluir ambiente pronto?</h2>
        <p className="mt-2 text-sm leading-relaxed text-fg-2">
          O ambiente <span className="font-semibold text-fg">“{ambiente.nome}”</span> será removido permanentemente. Esta ação não pode ser desfeita.
        </p>
        {erro && <div className="mt-4"><Alerta tipo="erro" mensagem={erro} /></div>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onFechar} disabled={excluindo} className="inline-flex h-11 items-center justify-center rounded-xl border border-line px-5 text-sm font-medium text-fg-2 hover:bg-surface-hover disabled:opacity-60">Cancelar</button>
          <button type="button" onClick={onConfirmar} disabled={excluindo} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60">
            {excluindo && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
            {excluindo ? "Excluindo..." : "Excluir ambiente"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function Ambientes() {
  const { token } = useAuth();
  const [ambientes, setAmbientes] = useState([]);
  const [audios, setAudios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [versao, setVersao] = useState(0);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [ambienteEditando, setAmbienteEditando] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
  const [erroFormulario, setErroFormulario] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [ambienteExcluindo, setAmbienteExcluindo] = useState(null);
  const [erroExclusao, setErroExclusao] = useState("");
  const [operacaoEmAndamento, setOperacaoEmAndamento] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregando(true);
      setErro("");
      try {
        const [ambientesResposta, audiosResposta, categoriasResposta] = await Promise.all([
          ambienteService.listarAmbientesPreConfigurados(token),
          audioService.listarAudios(),
          categoriasService.listar(token, "AMBIENTE", true),
        ]);
        if (!Array.isArray(ambientesResposta?.ambientes) ||
            !Array.isArray(audiosResposta?.audios) ||
            !Array.isArray(categoriasResposta?.categorias)) {
          throw new Error("A API retornou dados inválidos para os ambientes prontos.");
        }
        if (ativo) {
          setAmbientes(ambientesResposta.ambientes);
          setAudios(audiosResposta.audios);
          setCategorias(categoriasResposta.categorias);
        }
      } catch (falha) {
        if (ativo) setErro(falha.message || "Não foi possível carregar os ambientes prontos.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarDados();
    return () => { ativo = false; };
  }, [token, versao]);

  function atualizarCampo(campo, valor) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  function abrirCriacao() {
    setAmbienteEditando(null);
    setFormulario({ ...FORMULARIO_VAZIO, audios: [] });
    setErroFormulario("");
    setErro("");
    setSucesso("");
    setFormularioAberto(true);
  }

  async function abrirEdicao(ambiente) {
    setOperacaoEmAndamento(ambiente.idAmbienteSonoro);
    setErro("");
    setSucesso("");
    setErroFormulario("");
    try {
      const resposta = await ambienteService.obterAmbientePreConfigurado(token, ambiente.idAmbienteSonoro);
      const dados = resposta?.ambiente;
      if (!dados) throw new Error("Não foi possível carregar os dados do ambiente.");
      setAmbienteEditando(dados);
      setFormulario({
        nome: dados.nome || "",
        descricao: dados.descricao || "",
        finalidade: dados.finalidade || "RELAXAMENTO",
        idCategoria: dados.idCategoria || "",
        publicado: Boolean(dados.publicado),
        imagem: dados.imagem || "",
        imagemArquivo: null,
        imagemPrevia: "",
        removerImagem: false,
        autorImagem: dados.autorImagem || "",
        tituloOriginalImagem: dados.tituloOriginalImagem || "",
        fonteImagem: dados.fonteImagem || "",
        licencaImagem: dados.licencaImagem || "",
        audios: (dados.audios || []).map((item) => ({
          idAudio: item.idAudio,
          volume: item.volume,
        })),
      });
      setFormularioAberto(true);
    } catch (falha) {
      setErro(falha.message || "Não foi possível abrir o ambiente para edição.");
    } finally {
      setOperacaoEmAndamento("");
    }
  }

  function fecharFormulario() {
    if (salvando) return;
    setFormularioAberto(false);
    setAmbienteEditando(null);
    setFormulario(FORMULARIO_VAZIO);
    setErroFormulario("");
  }

  function opcional(valor) {
    const texto = typeof valor === "string" ? valor.trim() : "";
    return texto || null;
  }

  async function salvarAmbiente(evento) {
    evento.preventDefault();
    setSalvando(true);
    setErroFormulario("");
    setErro("");
    setSucesso("");

    if (formulario.imagemArquivo) {
      const tiposPermitidos = new Set(["image/jpeg", "image/png", "image/webp"]);
      if (!tiposPermitidos.has(formulario.imagemArquivo.type)) {
        setErroFormulario("A imagem deve estar no formato JPEG, PNG ou WebP.");
        setSalvando(false);
        return;
      }
      if (formulario.imagemArquivo.size > 5 * 1024 * 1024) {
        setErroFormulario("A imagem não pode exceder 5 MB.");
        setSalvando(false);
        return;
      }
    }

    if (formulario.audios.length === 0) {
      setErroFormulario("A composição deve conter pelo menos um áudio.");
      setSalvando(false);
      return;
    }
    if (new Set(formulario.audios.map((item) => item.idAudio)).size !== formulario.audios.length) {
      setErroFormulario("Não é permitido adicionar o mesmo áudio duas vezes.");
      setSalvando(false);
      return;
    }
    if (formulario.audios.some((item) => !Number.isInteger(item.volume) || item.volume < 0 || item.volume > 100)) {
      setErroFormulario("Os volumes devem ser números inteiros entre 0 e 100.");
      setSalvando(false);
      return;
    }

    const candidato = {
      nome: formulario.nome,
      audios: formulario.audios,
    };
    if (
      ambienteDuplicado(
        candidato,
        ambientes,
        ambienteEditando?.idAmbienteSonoro,
      )
    ) {
      setErroFormulario(
        "Já existe um ambiente pronto com este nome e esta composição de áudios e volumes.",
      );
      setSalvando(false);
      return;
    }

    const dados = {
      nome: formulario.nome.trim(),
      descricao: opcional(formulario.descricao),
      finalidade: formulario.finalidade,
      idCategoria: opcional(formulario.idCategoria),
      autorImagem: opcional(formulario.autorImagem),
      tituloOriginalImagem: opcional(formulario.tituloOriginalImagem),
      fonteImagem: opcional(formulario.fonteImagem),
      licencaImagem: opcional(formulario.licencaImagem),
      audios: formulario.audios.map((item) => ({
        idAudio: item.idAudio,
        volume: item.volume,
      })),
    };
    if (formulario.removerImagem) dados.imagem = null;

    try {
      if (ambienteEditando) {
        delete dados.publicado;
        if (formulario.imagemArquivo) {
          await ambienteService.atualizarAmbientePreConfiguradoComImagem(
            token,
            ambienteEditando.idAmbienteSonoro,
            dados,
            formulario.imagemArquivo,
          );
        } else {
          await ambienteService.atualizarAmbientePreConfigurado(
            token,
            ambienteEditando.idAmbienteSonoro,
            dados,
          );
        }
        setSucesso("Ambiente pronto atualizado com sucesso.");
      } else {
        dados.publicado = formulario.publicado;
        if (formulario.imagemArquivo) {
          await ambienteService.criarAmbientePreConfiguradoComImagem(
            token,
            dados,
            formulario.imagemArquivo,
          );
        } else {
          await ambienteService.criarAmbientePreConfigurado(token, dados);
        }
        setSucesso("Ambiente pronto cadastrado com sucesso.");
      }
      fecharFormulario();
      setVersao((atual) => atual + 1);
    } catch (falha) {
      setErroFormulario(
        falha.codigo === "AMBIENTE_PRE_CONFIGURADO_DUPLICADO"
          ? "Já existe um ambiente pronto com este nome e esta composição de áudios e volumes."
          : falha.message || "Não foi possível salvar o ambiente pronto.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alterarPublicacao(ambiente) {
    const novoEstado = !ambiente.publicado;
    if (
      novoEstado &&
      ambienteDuplicado(
        ambiente,
        ambientes,
        ambiente.idAmbienteSonoro,
      )
    ) {
      setErro(
        "Não é possível publicar este ambiente: já existe outro ambiente pronto com este nome e esta composição de áudios e volumes.",
      );
      return;
    }
    setOperacaoEmAndamento(ambiente.idAmbienteSonoro);
    setErro("");
    setSucesso("");
    try {
      const resposta = await ambienteService.alterarPublicacaoAmbientePreConfigurado(
        token,
        ambiente.idAmbienteSonoro,
        novoEstado,
      );
      setAmbientes((atuais) =>
        atuais.map((item) =>
          item.idAmbienteSonoro === ambiente.idAmbienteSonoro
            ? resposta?.ambiente || { ...item, publicado: novoEstado }
            : item,
        ),
      );
      setSucesso(novoEstado ? "Ambiente publicado com sucesso." : "Ambiente despublicado com sucesso.");
    } catch (falha) {
      setErro(
        falha.codigo === "AMBIENTE_PRE_CONFIGURADO_DUPLICADO"
          ? "Não é possível publicar este ambiente: já existe outro ambiente pronto com este nome e esta composição de áudios e volumes."
          : falha.message || "Não foi possível alterar a publicação do ambiente.",
      );
    } finally {
      setOperacaoEmAndamento("");
    }
  }

  function abrirExclusao(ambiente) {
    setAmbienteExcluindo(ambiente);
    setErroExclusao("");
    setErro("");
    setSucesso("");
  }

  async function confirmarExclusao() {
    if (!ambienteExcluindo) return;
    setOperacaoEmAndamento(ambienteExcluindo.idAmbienteSonoro);
    setErroExclusao("");
    try {
      await ambienteService.excluirAmbientePreConfigurado(token, ambienteExcluindo.idAmbienteSonoro);
      setAmbientes((atuais) =>
        atuais.filter((item) => item.idAmbienteSonoro !== ambienteExcluindo.idAmbienteSonoro),
      );
      setAmbienteExcluindo(null);
      setSucesso("Ambiente pronto excluído com sucesso.");
    } catch (falha) {
      setErroExclusao(falha.message || "Não foi possível excluir o ambiente pronto.");
    } finally {
      setOperacaoEmAndamento("");
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <section className="rounded-2xl border border-line-subtle bg-surface p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Sparkles size={23} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">Gerenciamento de ambientes prontos</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-fg-2">
                Cadastre composições, configure volumes individuais e publique os ambientes disponíveis.
              </p>
            </div>
          </div>
          <button type="button" onClick={abrirCriacao} disabled={carregando} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] px-5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[image:linear-gradient(100deg,#684a98,#5667b8)] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
            <Plus size={17} aria-hidden="true" />
            Novo ambiente
          </button>
        </div>
      </section>

      {erro && <Alerta tipo="erro" mensagem={erro} onFechar={() => setErro("")} />}
      {sucesso && <Alerta tipo="sucesso" mensagem={sucesso} onFechar={() => setSucesso("")} />}

      <section className="overflow-hidden rounded-2xl border border-line-subtle bg-surface">
        <header className="flex items-center justify-between gap-3 border-b border-line-subtle px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-accent" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-fg">Ambientes prontos cadastrados</h3>
          </div>
          {!carregando && (
            <span className="text-xs text-fg-3">
              {ambientes.length} {ambientes.length === 1 ? "ambiente" : "ambientes"}
            </span>
          )}
        </header>

        {carregando ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-8" role="status">
            <LoaderCircle size={25} className="animate-spin text-accent" aria-hidden="true" />
            <p className="text-sm text-fg-3">Carregando ambientes...</p>
          </div>
        ) : erro ? (
          <div className="flex min-h-48 flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-fg-2">Não foi possível carregar esta lista.</p>
            <button type="button" onClick={() => setVersao((atual) => atual + 1)} className="mt-3 text-sm font-medium text-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
              Tentar novamente
            </button>
          </div>
        ) : ambientes.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-2 text-icon-muted">
              <Sparkles size={22} aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm font-medium text-fg">Nenhum ambiente pronto cadastrado</p>
            <p className="mt-1 max-w-sm text-sm text-fg-3">Cadastre o primeiro ambiente para disponibilizá-lo na curadoria.</p>
          </div>
        ) : (
          <ul className="divide-y divide-line-subtle">
            {ambientes.map((ambiente) => {
              const operando = operacaoEmAndamento === ambiente.idAmbienteSonoro;
              return (
                <li key={ambiente.idAmbienteSonoro} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:px-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-fg">{ambiente.nome}</p>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${ambiente.publicado ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" : "bg-bg-2 text-fg-3"}`}>
                        {ambiente.publicado ? "Publicado" : "Rascunho"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-fg-3">
                      {rotuloFinalidade(ambiente.finalidade)}
                      {ambiente.categoria ? ` · ${ambiente.categoria}` : ""}
                      {" · "}
                      {ambiente.audios?.length || 0} {(ambiente.audios?.length || 0) === 1 ? "áudio" : "áudios"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <button type="button" onClick={() => abrirEdicao(ambiente)} disabled={Boolean(operacaoEmAndamento)} aria-label={`Editar ambiente ${ambiente.nome}`} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line-subtle px-3 text-xs font-medium text-fg-2 hover:bg-surface-hover disabled:opacity-50">
                      {operando ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <Pencil size={14} aria-hidden="true" />}
                      Editar
                    </button>
                    <button type="button" onClick={() => alterarPublicacao(ambiente)} disabled={Boolean(operacaoEmAndamento)} aria-label={`${ambiente.publicado ? "Despublicar" : "Publicar"} ambiente ${ambiente.nome}`} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line-subtle px-3 text-xs font-medium text-fg-2 hover:bg-surface-hover disabled:opacity-50">
                      {ambiente.publicado ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                      {ambiente.publicado ? "Despublicar" : "Publicar"}
                    </button>
                    <button type="button" onClick={() => abrirExclusao(ambiente)} disabled={Boolean(operacaoEmAndamento)} aria-label={`Excluir ambiente ${ambiente.nome}`} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/30 disabled:opacity-50">
                      <Trash2 size={14} aria-hidden="true" />
                      Excluir
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {formularioAberto && (
        <ModalAmbiente
          ambiente={ambienteEditando}
          audios={audios}
          categorias={categorias}
          formulario={formulario}
          erro={erroFormulario}
          salvando={salvando}
          onChange={atualizarCampo}
          onFechar={fecharFormulario}
          onSubmit={salvarAmbiente}
        />
      )}

      {ambienteExcluindo && (
        <ModalExclusaoAmbiente
          ambiente={ambienteExcluindo}
          erro={erroExclusao}
          excluindo={operacaoEmAndamento === ambienteExcluindo.idAmbienteSonoro}
          onFechar={() => {
            if (operacaoEmAndamento) return;
            setAmbienteExcluindo(null);
            setErroExclusao("");
          }}
          onConfirmar={confirmarExclusao}
        />
      )}
    </div>
  );
}
