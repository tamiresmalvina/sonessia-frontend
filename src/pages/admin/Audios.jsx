import { useEffect, useState } from "react";
import {
  AlertCircle,
  AudioLines,
  Check,
  LoaderCircle,
  Music,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/useAuth.js";
import { categoriasService } from "../../services/categorias.service.js";
import { audioService } from "../../services/sons.service.js";
import { criarFormularioEdicaoAudio } from "../../utils/audio-form.js";
import {
  OPCOES_ICONE_AUDIO,
  obterComponenteIconeAudio,
} from "../../data/icones-audio.js";

const CLASSE_CAMPO =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-fg placeholder:text-fg-disabled transition-all focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20";

function Alerta({ tipo, mensagem, onFechar }) {
  if (!mensagem) return null;
  const sucesso = tipo === "sucesso";
  const IconeAlerta = sucesso ? Check : AlertCircle;

  return (
    <div
      role={sucesso ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
        sucesso
          ? "border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
          : "border-rose-200 bg-rose-50/80 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
      }`}
    >
      <IconeAlerta size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
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

function CampoIconeAudio({ valor, onChange }) {
  const [galeriaAberta, setGaleriaAberta] = useState(false);
  const opcaoSelecionada = OPCOES_ICONE_AUDIO.find((opcao) => opcao.id === valor);
  const IconePrevia = opcaoSelecionada?.Componente || AudioLines;

  return (
    <div>
      <label htmlFor="audio-icone" className="mb-1.5 block text-sm font-medium text-fg">
        Ícone do áudio
      </label>
      <div className="flex gap-2">
        <button
          id="audio-icone"
          type="button"
          aria-expanded={galeriaAberta}
          aria-controls="galeria-icones-audio"
          onClick={() => setGaleriaAberta((aberta) => !aberta)}
          className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-line bg-surface px-3 text-left transition-colors hover:border-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <IconePrevia size={19} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-fg">
              {opcaoSelecionada?.nome || (valor ? valor : "Ícone genérico")}
            </span>
            <span className="block text-xs text-fg-3">
              {valor ? "Ícone selecionado" : "AudioLines será usado como padrão"}
            </span>
          </span>
          <span className="text-xs font-medium text-accent">
            {galeriaAberta ? "Fechar" : "Escolher"}
          </span>
        </button>
        {valor && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setGaleriaAberta(false);
            }}
            aria-label="Remover ícone do áudio"
            title="Remover ícone"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line-subtle text-icon-2 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus dark:hover:border-rose-900/50 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
          >
            <Trash2 size={17} aria-hidden="true" />
          </button>
        )}
      </div>

      {galeriaAberta && (
        <div
          id="galeria-icones-audio"
          role="group"
          aria-label="Opções de ícone para áudio"
          className="mt-3 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto rounded-xl border border-line-subtle bg-bg-2 p-3 sm:grid-cols-4"
        >
          {OPCOES_ICONE_AUDIO.map(({ id, nome, Componente }) => {
            const selecionado = valor === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selecionado}
                aria-label={`Selecionar ícone ${nome}`}
                onClick={() => {
                  onChange(id);
                  setGaleriaAberta(false);
                }}
                className={`relative flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                  selecionado
                    ? "border-accent bg-accent-soft text-accent shadow-xs"
                    : "border-line-subtle bg-surface text-fg-2 hover:border-line hover:bg-surface-hover hover:text-fg"
                }`}
              >
                {selecionado && (
                  <Check
                    size={14}
                    className="absolute right-2 top-2"
                    aria-hidden="true"
                  />
                )}
                <Componente size={21} strokeWidth={1.8} aria-hidden="true" />
                <span className="text-xs font-medium">{nome}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ModalAudio({
  audio,
  categorias,
  formulario,
  erro,
  salvando,
  onChange,
  onFechar,
  onSubmit,
}) {
  const titulo = audio ? "Editar áudio" : "Novo áudio";
  const categoriasDisponiveis = categorias.filter(
    (categoria) => categoria.ativa || categoria.nome === formulario.categoria,
  );

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
        aria-labelledby="modal-audio-titulo"
        className="my-auto w-full max-w-2xl rounded-2xl border border-line-subtle bg-surface p-5 shadow-2xl sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-audio-titulo" className="text-lg font-bold tracking-tight text-fg">
              {titulo}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-fg-2">
              {audio
                ? "Atualize os metadados e o ícone associado ao áudio."
                : "Preencha os metadados e selecione o arquivo de áudio."}
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
              <label htmlFor="audio-titulo" className="mb-1.5 block text-sm font-medium text-fg">
                Título
              </label>
              <input
                id="audio-titulo"
                value={formulario.titulo}
                onChange={(evento) => onChange("titulo", evento.target.value)}
                maxLength={255}
                required
                autoFocus
                className={CLASSE_CAMPO}
              />
            </div>
            <div>
              <label htmlFor="audio-titulo-original" className="mb-1.5 block text-sm font-medium text-fg">
                Título original
              </label>
              <input
                id="audio-titulo-original"
                value={formulario.tituloOriginal}
                onChange={(evento) => onChange("tituloOriginal", evento.target.value)}
                maxLength={255}
                required
                className={CLASSE_CAMPO}
              />
            </div>
            <div>
              <label htmlFor="audio-categoria" className="mb-1.5 block text-sm font-medium text-fg">
                Categoria
              </label>
              <select
                id="audio-categoria"
                value={formulario.categoria}
                onChange={(evento) => onChange("categoria", evento.target.value)}
                required
                className={CLASSE_CAMPO}
              >
                <option value="">Selecione uma categoria</option>
                {categoriasDisponiveis.map((categoria) => (
                  <option key={categoria.idCategoria} value={categoria.nome}>
                    {categoria.nome}{categoria.ativa ? "" : " (inativa)"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="audio-fonte" className="mb-1.5 block text-sm font-medium text-fg">
                Fonte
              </label>
              <input
                id="audio-fonte"
                value={formulario.fonte}
                onChange={(evento) => onChange("fonte", evento.target.value)}
                maxLength={255}
                required
                className={CLASSE_CAMPO}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="audio-licenca" className="mb-1.5 block text-sm font-medium text-fg">
                Licença
              </label>
              <input
                id="audio-licenca"
                value={formulario.licenca}
                onChange={(evento) => onChange("licenca", evento.target.value)}
                maxLength={255}
                required
                className={CLASSE_CAMPO}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="audio-descricao" className="mb-1.5 block text-sm font-medium text-fg">
                Descrição <span className="font-normal text-fg-3">(opcional)</span>
              </label>
              <textarea
                id="audio-descricao"
                value={formulario.descricao}
                onChange={(evento) => onChange("descricao", evento.target.value)}
                maxLength={1000}
                rows={3}
                className={`${CLASSE_CAMPO} resize-y`}
              />
            </div>
            <div className="sm:col-span-2">
              <CampoIconeAudio
                valor={formulario.icone}
                onChange={(valor) => onChange("icone", valor)}
              />
            </div>
            {!audio && (
              <div className="sm:col-span-2">
                <label htmlFor="audio-arquivo" className="mb-1.5 block text-sm font-medium text-fg">
                  Arquivo de áudio
                </label>
                <input
                  id="audio-arquivo"
                  type="file"
                  accept="audio/*"
                  required
                  onChange={(evento) => onChange("arquivo", evento.target.files?.[0] || null)}
                  className={`${CLASSE_CAMPO} file:mr-3 file:rounded-lg file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-accent`}
                />
                <p className="mt-1.5 text-xs text-fg-3">
                  Até 50 MB. O arquivo será enviado ao armazenamento de áudio.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-line-subtle pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onFechar}
              disabled={salvando}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-surface px-5 text-sm font-medium text-fg-2 transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] px-5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[image:linear-gradient(100deg,#684a98,#5667b8)] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
              {salvando ? "Salvando..." : audio ? "Salvar alterações" : "Cadastrar áudio"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

const FORMULARIO_VAZIO = {
  titulo: "",
  tituloOriginal: "",
  categoria: "",
  fonte: "",
  licenca: "",
  descricao: "",
  icone: "",
  arquivo: null,
};

export default function Audios() {
  const { token } = useAuth();
  const [audios, setAudios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [versaoCarregamento, setVersaoCarregamento] = useState(0);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [formularioAberto, setFormularioAberto] = useState(false);
  const [audioEditando, setAudioEditando] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VAZIO);
  const [erroFormulario, setErroFormulario] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregando(true);
      setErro("");

      try {
        const [respostaAudios, respostaCategorias] = await Promise.all([
          audioService.listarAudios(),
          categoriasService.listar(token, "AUDIO", true),
        ]);
        if (!Array.isArray(respostaAudios?.audios) || !Array.isArray(respostaCategorias?.categorias)) {
          throw new Error("A API retornou dados inválidos para o gerenciamento de áudios.");
        }
        if (ativo) {
          setAudios(respostaAudios.audios);
          setCategorias(respostaCategorias.categorias);
        }
      } catch (falha) {
        if (ativo) setErro(falha.message || "Não foi possível carregar os áudios.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarDados();
    return () => {
      ativo = false;
    };
  }, [token, versaoCarregamento]);

  function abrirCriacao() {
    setAudioEditando(null);
    setFormularioAberto(true);
    setFormulario({
      ...FORMULARIO_VAZIO,
      categoria: categorias.find((categoria) => categoria.ativa)?.nome || "",
    });
    setErroFormulario("");
    setErro("");
    setSucesso("");
  }

  function abrirEdicao(audio) {
    setAudioEditando(audio);
    setFormularioAberto(true);
    setFormulario(criarFormularioEdicaoAudio(audio));
    setErroFormulario("");
    setErro("");
    setSucesso("");
  }

  function limparFormulario() {
    setFormularioAberto(false);
    setAudioEditando(null);
    setFormulario(FORMULARIO_VAZIO);
    setErroFormulario("");
  }

  function fecharFormulario() {
    if (salvando) return;
    limparFormulario();
  }

  function atualizarCampo(campo, valor) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvarAudio(evento) {
    evento.preventDefault();
    setSalvando(true);
    setErroFormulario("");

    const metadados = {
      titulo: formulario.titulo.trim(),
      tituloOriginal: formulario.tituloOriginal.trim(),
      categoria: formulario.categoria,
      fonte: formulario.fonte.trim(),
      licenca: formulario.licenca.trim(),
      icone: formulario.icone || null,
    };
    const descricao = formulario.descricao.trim();
    if (descricao) metadados.descricao = descricao;
    else if (audioEditando) metadados.descricao = null;

    try {
      if (audioEditando) {
        await audioService.atualizarAudio(token, audioEditando.idAudio, metadados);
        setSucesso("Áudio atualizado com sucesso.");
      } else {
        if (!formulario.arquivo) {
          setErroFormulario("Selecione o arquivo do áudio.");
          return;
        }
        await audioService.criarAudio(token, metadados, formulario.arquivo);
        setSucesso("Áudio cadastrado com sucesso.");
      }
      limparFormulario();
      setVersaoCarregamento((atual) => atual + 1);
    } catch (falha) {
      setErroFormulario(falha.message || "Não foi possível salvar o áudio.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <section className="rounded-2xl border border-line-subtle bg-surface p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Music size={23} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">
                Gerenciamento de áudios
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-fg-2">
                Cadastre faixas, mantenha seus metadados e escolha o ícone que as identifica.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={abrirCriacao}
            disabled={carregando || categorias.length === 0}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] px-5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[image:linear-gradient(100deg,#684a98,#5667b8)] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={17} aria-hidden="true" />
            Novo áudio
          </button>
        </div>
      </section>

      {erro && (
        <Alerta
          tipo="erro"
          mensagem={erro}
          onFechar={() => setErro("")}
        />
      )}
      {sucesso && (
        <Alerta
          tipo="sucesso"
          mensagem={sucesso}
          onFechar={() => setSucesso("")}
        />
      )}

      <section className="overflow-hidden rounded-2xl border border-line-subtle bg-surface">
        <header className="flex items-center justify-between gap-3 border-b border-line-subtle px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Music size={18} className="text-accent" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-fg">Áudios cadastrados</h3>
          </div>
          {!carregando && (
            <span className="text-xs text-fg-3">
              {audios.length} {audios.length === 1 ? "áudio" : "áudios"}
            </span>
          )}
        </header>

        {carregando ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-8" role="status">
            <LoaderCircle size={25} className="animate-spin text-accent" aria-hidden="true" />
            <p className="text-sm text-fg-3">Carregando áudios...</p>
          </div>
        ) : erro ? (
          <div className="flex min-h-48 flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-fg-2">Não foi possível carregar esta lista.</p>
            <button
              type="button"
              onClick={() => setVersaoCarregamento((atual) => atual + 1)}
              className="mt-3 text-sm font-medium text-accent hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              Tentar novamente
            </button>
          </div>
        ) : audios.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-2 text-icon-muted">
              <AudioLines size={22} aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm font-medium text-fg">Nenhum áudio cadastrado</p>
            <p className="mt-1 max-w-sm text-sm text-fg-3">
              Cadastre o primeiro áudio para disponibilizá-lo no catálogo.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line-subtle">
            {audios.map((audio) => {
              const opcao = OPCOES_ICONE_AUDIO.find((item) => item.id === audio.icone);
              const IconeAudio = obterComponenteIconeAudio(audio.icone);
              return (
                <li
                  key={audio.idAudio}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:px-6"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <IconeAudio size={21} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-fg">{audio.titulo}</p>
                      <p className="mt-0.5 truncate text-xs text-fg-3">
                        {audio.categoria || "Sem categoria"}
                        {audio.icone ? ` · ${opcao?.nome || audio.icone}` : " · Ícone genérico"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:ml-auto">
                    {audio.arquivo && (
                      <a
                        href={audio.arquivo}
                        target="_blank"
                        rel="noreferrer"
                        className="mr-auto rounded-lg px-3 py-2 text-xs font-medium text-fg-2 transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:mr-0"
                      >
                        Abrir arquivo
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => abrirEdicao(audio)}
                      aria-label={`Editar áudio ${audio.titulo}`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line-subtle px-3 text-sm font-medium text-fg-2 transition-colors hover:border-line hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      <Pencil size={15} aria-hidden="true" />
                      Editar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {formularioAberto && (
        <ModalAudio
          audio={audioEditando}
          categorias={categorias}
          formulario={formulario}
          erro={erroFormulario}
          salvando={salvando}
          onChange={atualizarCampo}
          onFechar={fecharFormulario}
          onSubmit={salvarAudio}
        />
      )}
    </div>
  );
}
