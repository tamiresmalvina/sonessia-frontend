import { useState, useEffect, useRef, useCallback, createElement } from "react";
import { X, Upload, Trash2, CircleAlert, ImageIcon, Check } from "lucide-react";
import { audioService, ambienteService } from "../../services/sons.service.js";
import { categoriasService } from "../../services/categorias.service.js";
import { obterComponenteIconeAudio } from "../../data/icones-audio.js";
import { obterCorCategoria } from "../../utils/cor-categoria.js";
import { useReprodutor } from "../../hooks/useReprodutor.js";
import { usePlayer } from "../../contexts/usePlayer.js";

/* ─── Constantes ────────────────────────────────────────────────── */
const TAMANHO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const FORMATOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];
const LIMITE_NOME = 255;
const LIMITE_DESCRICAO = 120;


/* ─── Sub-componente: Slider de volume com ícone correspondente ─── */
function SliderVolume({ idAudio, titulo, volume, icone, categoria, onChange }) {
  const pct = `${volume}%`;
  const ativo = volume > 0;
  const cor = obterCorCategoria(categoria);

  return (
    <div className="flex items-center gap-3.5">
      {/* Botão com o ícone: clicar nele ativa (50%) ou desativa (0%) o som */}
      <button
        type="button"
        onClick={() => onChange(idAudio, ativo ? 0 : 50)}
        title={ativo ? `Desativar ${titulo}` : `Ativar ${titulo}`}
        aria-label={ativo ? `Desativar ${titulo}` : `Ativar ${titulo}`}
        className={`grid size-11 shrink-0 place-items-center rounded-xl border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus ${
          ativo
            ? "border-line bg-surface shadow-xs"
            : "border-line-subtle bg-bg-2 hover:border-line hover:bg-surface"
        }`}
        style={{ color: cor }}
      >
        {createElement(obterComponenteIconeAudio(icone), {
          size: 20,
          strokeWidth: 1.5,
          "aria-hidden": "true",
        })}
      </button>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span
            className={`truncate text-sm transition-colors ${
              ativo ? "font-medium text-fg" : "text-fg-2"
            }`}
          >
            {titulo}
          </span>
          <span className="shrink-0 font-mono text-xs tabular-nums text-fg-3 w-8 text-right">
            {pct}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={volume}
          onChange={(e) => onChange(idAudio, Number(e.target.value))}
          aria-label={`Volume de ${titulo}: ${pct}`}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        />
      </div>
    </div>
  );
}

/* ─── Componente principal ──────────────────────────────────────── */
export default function ModalNovoAmbiente({
  token,
  ambienteParaEditar = null,
  onFechar,
  onCriado,
  onSalvo,
}) {
  const isEdicao = Boolean(ambienteParaEditar);

  /* ── Form state ── */
  const [nome, setNome] = useState(() => ambienteParaEditar?.nome || "");
  const [descricao, setDescricao] = useState(() => ambienteParaEditar?.descricao || "");
  const [idCategoria, setIdCategoria] = useState(() => ambienteParaEditar?.idCategoria || "");
  const [categoriasAmbiente, setCategoriasAmbiente] = useState([]);

  /* ── Imagem ── */
  const [arquivoImagem, setArquivoImagem] = useState(null);
  const [previewImagem, setPreviewImagem] = useState(() => ambienteParaEditar?.imagem || null);
  const [erroImagem, setErroImagem] = useState(null);
  const inputImagemRef = useRef(null);

  /* ── Áudios e Categorias ── */
  const [audios, setAudios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [carregandoAudios, setCarregandoAudios] = useState(true);

  /* ── Submissão ── */
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState(null);
  const [erroNome, setErroNome] = useState(null);

  /* ── Reprodução e Preview de Áudio em tempo real ── */
  const reprodutor = useReprodutor();
  const { tocando: tocandoGlobal, reproduzirPausar: pausarGlobal } = usePlayer();
  const iniciandoReproducaoRef = useRef(false);

  /* ── Carregar áudios reais e categorias do backend ── */
  const { sincronizarAudios, definirVolume } = reprodutor;
  useEffect(() => {
    let ativo = true;
    Promise.allSettled([
      audioService.listarAudios(),
      categoriasService.listar(token, "AUDIO"),
      categoriasService.listar(token, "AMBIENTE"),
    ]).then(([resAudios, resCategorias, resCategoriasAmbiente]) => {
      if (!ativo) return;

      if (resAudios.status === "fulfilled") {
        const lista = Array.isArray(resAudios.value?.audios)
          ? resAudios.value.audios
          : [];
        setAudios(lista);
        sincronizarAudios(lista);

        // Se for edição, pré-carregar os volumes salvos do ambiente
        if (ambienteParaEditar && Array.isArray(ambienteParaEditar.audios)) {
          for (const item of ambienteParaEditar.audios) {
            const idAudio = item.idAudio || item.audio?.idAudio;
            const vol = Number(item.volume) || 0;
            if (idAudio && vol > 0) {
              void definirVolume(idAudio, vol);
            }
          }
        }
      }

      if (resCategorias.status === "fulfilled") {
        const nomes = (resCategorias.value?.categorias ?? []).map((c) => c.nome);
        setCategorias(["Todos", ...nomes]);
      } else {
        setCategorias(["Todos"]);
      }

      if (resCategoriasAmbiente.status === "fulfilled") {
        const disponiveis = (resCategoriasAmbiente.value?.categorias ?? []).filter(
          (categoria) => categoria.tipo === "AMBIENTE" && categoria.ativa,
        );
        setCategoriasAmbiente(disponiveis);
      } else {
        setCategoriasAmbiente([]);
      }

      setCarregandoAudios(false);
    });
    return () => {
      ativo = false;
    };
  }, [token, sincronizarAudios, definirVolume, ambienteParaEditar]);

  /* ── Fechar modal parando áudios ── */
  const fecharModal = useCallback(() => {
    if (salvando) return;
    reprodutor.limparTudo();
    onFechar();
  }, [salvando, onFechar, reprodutor]);

  /* ── Fechar com Escape ── */
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && !salvando) {
        fecharModal();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [salvando, fecharModal]);

  /* ── Handlers de imagem ── */
  function handleArquivoImagem(arquivo) {
    setErroImagem(null);
    if (!arquivo) return;
    if (!FORMATOS_ACEITOS.includes(arquivo.type)) {
      setErroImagem("Formato inválido. Use JPEG, PNG ou WebP.");
      return;
    }
    if (arquivo.size > TAMANHO_MAX_BYTES) {
      setErroImagem("A imagem deve ter no máximo 5 MB.");
      return;
    }
    setArquivoImagem(arquivo);
    setPreviewImagem(URL.createObjectURL(arquivo));
  }

  function handleDropImagem(e) {
    e.preventDefault();
    const arquivo = e.dataTransfer.files?.[0];
    if (arquivo) handleArquivoImagem(arquivo);
  }

  function removerImagem() {
    if (previewImagem) URL.revokeObjectURL(previewImagem);
    setArquivoImagem(null);
    setPreviewImagem(null);
    setErroImagem(null);
    if (inputImagemRef.current) inputImagemRef.current.value = "";
  }

  /* ── Handler de volume e preview de áudio em tempo real ── */
  const handleVolume = useCallback(
    async (idAudio, valor) => {
      await reprodutor.definirVolume(idAudio, valor);

      if (valor > 0) {
        // Pausar player global se estiver tocando para ouvir o preview claramente
        if (tocandoGlobal) {
          void pausarGlobal();
        }

        // Se ainda não estiver tocando, iniciar reprodução
        if (!reprodutor.tocando && !iniciandoReproducaoRef.current) {
          iniciandoReproducaoRef.current = true;
          try {
            await reprodutor.reproduzirPausar();
          } finally {
            iniciandoReproducaoRef.current = false;
          }
        }
      }
    },
    [reprodutor, tocandoGlobal, pausarGlobal],
  );

  /* ── Áudios filtrados por categoria ── */
  const audiosFiltrados =
    categoriaAtiva === "Todos"
      ? audios
      : audios.filter(
          (a) =>
            (a.categoria || "").toLowerCase() ===
            categoriaAtiva.toLowerCase(),
        );

  /* ── Composição: somente áudios com volume > 0 ── */
  const composicao = audios
    .filter((a) => (reprodutor.volumes[a.idAudio] ?? 0) > 0)
    .map((a) => ({ idAudio: a.idAudio, volume: reprodutor.volumes[a.idAudio] }));

  const totalAtivos = composicao.length;

  /* ── Submissão ── */
  async function handleSubmit(e) {
    e.preventDefault();

    setErroNome(null);
    setErroGeral(null);

    const nomeTrimado = nome.trim();
    if (!nomeTrimado) {
      setErroNome("O nome é obrigatório.");
      return;
    }
    if (nomeTrimado.length > LIMITE_NOME) {
      setErroNome(`O nome deve ter no máximo ${LIMITE_NOME} caracteres.`);
      return;
    }
    if (composicao.length === 0) {
      setErroGeral("Adicione ao menos um áudio com volume acima de 0%.");
      return;
    }
    if (!categoriasAmbiente.some((categoria) => categoria.idCategoria === idCategoria)) {
      setErroGeral("Selecione uma categoria de ambiente ativa.");
      return;
    }

    setSalvando(true);
    try {
      const dados = {
        nome: nomeTrimado,
        descricao: descricao.trim() || null,
        idCategoria,
        audios: composicao,
      };

      let resposta;
      if (isEdicao) {
        resposta = await ambienteService.atualizarAmbiente(
          token,
          ambienteParaEditar.idAmbienteSonoro,
          dados,
        );
      } else {
        resposta = await ambienteService.criarAmbienteComImagem(
          token,
          dados,
          arquivoImagem,
        );
      }

      reprodutor.limparTudo();
      const callback = onSalvo || onCriado;
      callback?.(resposta?.ambiente ?? resposta);
    } catch (err) {
      setErroGeral(err.message || (isEdicao ? "Não foi possível atualizar o ambiente. Tente novamente." : "Não foi possível criar o ambiente. Tente novamente."));
    } finally {
      setSalvando(false);
    }
  }

  /* ── Render ── */
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => {
        if (!salvando) fecharModal();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-novo-ambiente"
        className="relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-line bg-surface sm:max-w-[560px] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Cabeçalho ── */}
        <header className="flex items-start justify-between gap-4 px-6 pb-4 pt-6 shrink-0">
          <div>
            <h2
              id="titulo-novo-ambiente"
              className="text-[22px] font-light leading-tight tracking-[-0.03em]"
            >
              {isEdicao ? "Editar ambiente" : "Novo ambiente"}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-fg-2">
              Combine sons, ajuste o volume de cada um e escolha uma capa.
            </p>
          </div>

          <button
            type="button"
            onClick={fecharModal}
            disabled={salvando}
            aria-label="Fechar"
            className="grid size-10 shrink-0 place-items-center rounded-full text-icon-2 transition-colors hover:bg-surface-hover hover:text-fg outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg -mr-2 -mt-1 disabled:opacity-50"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </header>

        {/* ── Corpo com scroll ── */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2">
          <form id="form-novo-ambiente" onSubmit={handleSubmit} noValidate>
            {/* Erro geral */}
            {erroGeral && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2.5 rounded-lg border border-line-subtle bg-danger-soft p-3 text-xs leading-relaxed text-danger"
              >
                <CircleAlert size={16} className="mt-0.5 shrink-0" />
                <span>{erroGeral}</span>
              </div>
            )}

            {/* ── Nome ── */}
            <div className="mb-5">
              <label htmlFor="amb-nome" className="user-field-label">
                Nome
              </label>
              <input
                id="amb-nome"
                type="text"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  if (erroNome) setErroNome(null);
                }}
                placeholder="Ex.: Tarde de estudo"
                maxLength={LIMITE_NOME}
                autoComplete="off"
                className={`user-input${erroNome ? " border-danger focus:border-danger focus:ring-danger" : ""}`}
              />
              {erroNome && <p className="user-field-error">{erroNome}</p>}
            </div>

            {/* ── Descrição ── */}
            <div className="mb-5">
              <div className="flex items-baseline justify-between mb-2">
                <label htmlFor="amb-descricao" className="user-field-label mb-0">
                  Descrição <span className="font-normal text-fg-3">(opcional)</span>
                </label>
                <span className="font-mono text-xs tabular-nums text-fg-3">
                  {descricao.length}/{LIMITE_DESCRICAO}
                </span>
              </div>
              <textarea
                id="amb-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value.slice(0, LIMITE_DESCRICAO))}
                rows={3}
                placeholder=""
                className="user-textarea min-h-[88px]"
              />
              <p className="user-field-hint">
                Uma frase curta para lembrar quando usar este ambiente.
              </p>
            </div>

            {/* ── Categoria do ambiente ── */}
            <div className="mb-5">
              <label htmlFor="amb-categoria" className="user-field-label">
                Categoria
              </label>
              <select
                id="amb-categoria"
                value={idCategoria}
                onChange={(e) => setIdCategoria(e.target.value)}
                className="user-input"
                required
              >
                <option value="" disabled>Selecione uma categoria</option>
                {categoriasAmbiente.map((categoria) => (
                  <option key={categoria.idCategoria} value={categoria.idCategoria}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Capa ── */}
            <div className="mb-6">
              <span className="user-field-label block">Capa</span>

              {previewImagem ? (
                /* Preview da imagem selecionada */
                <div className="relative w-full overflow-hidden rounded-xl border border-line-subtle">
                  <img
                    src={previewImagem}
                    alt="Prévia da capa"
                    className="h-44 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-end justify-end gap-2 p-3">
                    <button
                      type="button"
                      onClick={() => inputImagemRef.current?.click()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80 backdrop-blur-sm transition-colors"
                    >
                      <Upload size={13} />
                      Substituir
                    </button>
                    <button
                      type="button"
                      onClick={removerImagem}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80 backdrop-blur-sm transition-colors"
                    >
                      <Trash2 size={13} />
                      Remover
                    </button>
                  </div>
                </div>
              ) : (
                /* Área de upload */
                <button
                  type="button"
                  onClick={() => inputImagemRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDropImagem}
                  className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-bg-2 text-fg-3 transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <ImageIcon size={24} strokeWidth={1.4} />
                  <span className="text-sm">Clique ou arraste uma imagem</span>
                  <span className="text-xs text-fg-3">
                    JPEG, PNG ou WebP · máx. 5 MB
                  </span>
                </button>
              )}

              <input
                ref={inputImagemRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => handleArquivoImagem(e.target.files?.[0] ?? null)}
              />

              {erroImagem && <p className="user-field-error">{erroImagem}</p>}
            </div>

            {/* ── Sons ── */}
            <div className="mb-4">
              <div className="flex items-baseline justify-between mb-3">
                <span className="user-field-label mb-0">Sons</span>
                <span className="font-mono text-xs uppercase tracking-widest text-fg-3">
                  {totalAtivos} {totalAtivos === 1 ? "ativo" : "ativos"}
                </span>
              </div>

              <p className="mb-4 text-sm text-fg-2">
                Mova o controle para incluir um som. Em 0%, ele fica fora do ambiente.
              </p>

              {/* Filtro por categoria */}
              {categorias.length > 1 && (
                <div className="-mx-6 flex overflow-x-auto px-6 pb-3 mb-2">
                  <div
                    role="group"
                    aria-label="Filtrar sons por categoria"
                    className="flex shrink-0 gap-0.5 rounded-[10px] border border-line-subtle bg-bg-2 p-1"
                  >
                    {categorias.map((cat) => {
                      const ativa = cat === categoriaAtiva;
                      return (
                        <button
                          key={cat}
                          type="button"
                          aria-pressed={ativa}
                          onClick={() => setCategoriaAtiva(cat)}
                          className={`h-8 shrink-0 rounded-[7px] px-3.5 text-[12px] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
                            ativa
                              ? "lift bg-accent font-medium text-on-accent hover:bg-accent-hover"
                              : "text-fg-2 hover:bg-surface-hover hover:text-fg"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Lista de sliders */}
              {carregandoAudios ? (
                <div className="flex flex-col items-center gap-3 py-10 text-fg-3">
                  <div className="size-6 animate-spin rounded-full border-2 border-line border-t-accent" />
                  <p className="text-sm">Carregando sons…</p>
                </div>
              ) : audiosFiltrados.length === 0 ? (
                <p className="py-6 text-center text-sm text-fg-3">
                  Nenhum som nesta categoria.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6">
                  {audiosFiltrados.map((audio) => (
                    <SliderVolume
                      key={audio.idAudio}
                      idAudio={audio.idAudio}
                      titulo={audio.titulo}
                      icone={audio.icone}
                      categoria={audio.categoria}
                      volume={reprodutor.volumes[audio.idAudio] ?? 0}
                      onChange={handleVolume}
                    />
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* ── Rodapé fixo ── */}
        <footer className="flex flex-col-reverse gap-2 border-t border-line-subtle px-6 py-4 shrink-0 sm:flex-row sm:justify-end [&>button]:max-sm:w-full">
          <button
            type="button"
            onClick={fecharModal}
            disabled={salvando}
            className="user-button user-button-secondary user-button-md"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="form-novo-ambiente"
            disabled={salvando || composicao.length === 0 || !nome.trim()}
            className="user-button user-button-primary user-button-md lift disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {salvando ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-on-accent/40 border-t-on-accent" />
                {isEdicao ? "Salvando…" : "Criando…"}
              </>
            ) : isEdicao ? (
              <>
                <Check size={16} strokeWidth={2} />
                Salvar alterações
              </>
            ) : (
              <>
                <Check size={16} strokeWidth={2} />
                + Criar ambiente
              </>
            )}
          </button>
        </footer>
      </section>
    </div>
  );
}
