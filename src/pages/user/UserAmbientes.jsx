import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Play,
  AudioLines,
  Plus,
  AlertCircle,
  RefreshCw,
  MoreHorizontal,
  SlidersHorizontal,
  Compass,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/useAuth.js";
import { usePlayer } from "../../contexts/usePlayer.js";
import { ambienteService } from "../../services/sons.service.js";
import ModalNovoAmbiente from "../../components/user/ModalNovoAmbiente.jsx";

/**
 * Card individual de ambiente sonoro.
 */
function AmbienteCard({
  ambiente,
  onPlay,
  onAbrir,
  onEditar,
  onExcluir,
  estaTocando,
}) {
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuAberto) return;
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuAberto]);

  const audios = Array.isArray(ambiente.audios) ? ambiente.audios : [];
  const nomesSons = audios
    .map((item) => item.titulo || item.audio?.titulo)
    .filter(Boolean)
    .join(" · ");

  const ehPlataforma =
    ambiente.origem === "PRE_CONFIGURADO" ||
    ambiente.origem === "PLATAFORMA" ||
    ambiente.origem === "preconfigurado" ||
    ambiente.publicado === true;

  return (
    <div className="group relative flex flex-col">
      {/* Imagem */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line-subtle bg-bg-2">
        {ambiente.imagem ? (
          <img
            src={ambiente.imagem}
            alt={ambiente.nome}
            onClick={() => onAbrir(ambiente.idAmbienteSonoro)}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02] cursor-pointer"
          />
        ) : (
          <div
            onClick={() => onAbrir(ambiente.idAmbienteSonoro)}
            className="grid size-full place-items-center text-icon-muted cursor-pointer"
          >
            <AudioLines size={32} strokeWidth={1.3} aria-hidden="true" />
          </div>
        )}

        {/* Badge Plataforma */}
        {ehPlataforma && (
          <span className="absolute left-3 top-3 rounded-full bg-[#F4F1FA]/95 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5a3f86]">
            Plataforma
          </span>
        )}

        {/* Menu de Opções para ambientes criados pelo usuário */}
        {!ehPlataforma && (onEditar || onExcluir) && (
          <div className="absolute right-2 top-2 z-20" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuAberto((prev) => !prev);
              }}
              aria-label={`Mais ações para ${ambiente.nome}`}
              title={`Mais ações para ${ambiente.nome}`}
              aria-expanded={menuAberto}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-black/35 text-white transition-colors duration-200 hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <MoreHorizontal size={18} strokeWidth={1.6} aria-hidden="true" />
            </button>

            {menuAberto && (
              <div
                role="menu"
                className="absolute top-11 right-0 z-40 min-w-[190px] rounded-2xl border border-line bg-surface p-1.5 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {onEditar && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuAberto(false);
                      onEditar(ambiente);
                    }}
                    className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-normal text-fg transition-colors duration-150 hover:bg-[#F4F1FA] focus-visible:bg-[#F4F1FA] dark:hover:bg-surface-hover outline-none"
                  >
                    <Pencil size={16} strokeWidth={1.6} className="text-fg-2 shrink-0" />
                    <span>Editar ambiente</span>
                  </button>
                )}

                {onExcluir && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuAberto(false);
                      onExcluir(ambiente);
                    }}
                    className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-normal text-[#a23838] dark:text-[#f87171] transition-colors duration-150 hover:bg-[#fcf3f3] focus-visible:bg-[#fcf3f3] dark:hover:bg-[#331c1e] outline-none"
                  >
                    <Trash2 size={16} strokeWidth={1.6} className="shrink-0 text-[#a23838] dark:text-[#f87171]" />
                    <span>Excluir...</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Botão Play */}
        <button
          type="button"
          onClick={() => onPlay(ambiente)}
          aria-label={estaTocando ? `Pausar ${ambiente.nome}` : `Reproduzir ${ambiente.nome}`}
          aria-pressed={estaTocando}
          className="z-10 absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-[#F4F1FA] text-accent transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {estaTocando ? (
            <Play size={15} fill="currentColor" strokeWidth={0} className="translate-x-px" aria-hidden="true" />
          ) : (
            <Play size={15} fill="currentColor" strokeWidth={0} className="translate-x-px" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Conteúdo textual */}
      <div className="p-4">
        <h3
          onClick={() => onAbrir(ambiente.idAmbienteSonoro)}
          className="cursor-pointer truncate text-sm font-semibold tracking-tight text-fg hover:text-accent transition-colors"
        >
          {ambiente.nome}
        </h3>

        {(ambiente.categoria || ambiente.finalidade) && (
          <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wider text-accent">
            {ambiente.categoria || ambiente.finalidade}
          </p>
        )}

        {ambiente.descricao && (
          <p className="mt-0.5 line-clamp-2 text-xs text-fg-2 leading-relaxed">
            {ambiente.descricao}
          </p>
        )}

        <p className="mt-1 truncate text-xs text-fg-3">
          {nomesSons || "Sem sons especificados"}
        </p>
      </div>
    </div>
  );
}

/**
 * Cabeçalho de seção padronizado com contador e subtítulo opcional.
 */
function SecaoHeader({ titulo, contagem, descricao }) {
  return (
    <div className="user-section-heading mb-6">
      <div>
        <h2 className="user-section-title">
          {titulo}
          <span className="user-section-count">{contagem}</span>
        </h2>
        {descricao && <p className="user-section-hint">{descricao}</p>}
      </div>
    </div>
  );
}

/**
 * Modal de confirmação para exclusão de ambiente sonoro.
 * Reproduz com fidelidade o design visual do protótipo Figma Make.
 */
function ModalExcluirAmbiente({
  ambiente,
  onConfirmar,
  onCancelar,
  excluindo,
  erro,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && !excluindo) {
        onCancelar();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [excluindo, onCancelar]);

  if (!ambiente) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#141216]/50 animate-fade-in"
      onClick={(e) => {
        if (!excluindo && e.target === e.currentTarget) {
          onCancelar();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-excluir-titulo"
    >
      <div className="relative w-full max-w-[440px] rounded-2xl border border-line-subtle bg-surface shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-6 pb-5">
          <div className="flex items-center justify-between">
            <h2
              id="modal-excluir-titulo"
              className="text-xl font-medium tracking-tight text-fg"
            >
              Excluir ambiente?
            </h2>
            <button
              type="button"
              onClick={onCancelar}
              disabled={excluindo}
              aria-label="Fechar"
              className="grid size-8 place-items-center rounded-lg text-icon-muted transition-colors hover:bg-surface-hover hover:text-fg outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
            >
              <X size={18} strokeWidth={1.8} />
            </button>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-fg-2">
            “{ambiente.nome}” será removido da sua conta e das coleções em que
            está. Essa ação não pode ser desfeita.
          </p>
          {erro && (
            <p className="mt-3 text-xs text-danger">{erro}</p>
          )}
        </div>

        <div className="border-t border-line-subtle" />

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-surface">
          <button
            type="button"
            onClick={onCancelar}
            disabled={excluindo}
            className="h-10 rounded-xl border border-line bg-surface px-5 text-sm font-medium text-fg transition-colors hover:bg-surface-hover outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={excluindo}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#a23838] px-5 text-sm font-medium text-white transition-colors hover:bg-[#8e2f2f] active:bg-[#7d2828] outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60"
          >
            {excluindo ? "Excluindo…" : "Excluir ambiente"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Tela Ambientes da área autenticada do usuário comum.
 * Exibe ambientes criados pelo próprio usuário e ambientes prontos da plataforma,
 * com filtros por categoria e busca por nome.
 */
export default function UserAmbientes() {
  const { usuario, token } = useAuth();
  const navigate = useNavigate();

  const [ambientesUsuario, setAmbientesUsuario] = useState([]);
  const [ambientesPlataforma, setAmbientesPlataforma] = useState([]);
  const [filtro, setFiltro] = useState("todos"); // "todos" | "usuario" | "plataforma"
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [versao, setVersao] = useState(0);
  const [modalAberto, setModalAberto] = useState(false);
  const [ambienteParaEditar, setAmbienteParaEditar] = useState(null);
  const [ambienteParaExcluir, setAmbienteParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    let ativo = true;

    Promise.allSettled([
      ambienteService.listarAmbientes(token),
      ambienteService.listarAmbientesPublicos(),
    ]).then(([resUsuario, resPlataforma]) => {
      if (!ativo) return;

      let algumSucesso = false;

      if (resUsuario.status === "fulfilled") {
        const dados = resUsuario.value;
        setAmbientesUsuario(
          Array.isArray(dados?.ambientes)
            ? dados.ambientes
            : Array.isArray(dados?.ambientesSonoros)
              ? dados.ambientesSonoros
              : []
        );
        algumSucesso = true;
      }

      if (resPlataforma.status === "fulfilled") {
        const dados = resPlataforma.value;
        setAmbientesPlataforma(
          Array.isArray(dados?.ambientes)
            ? dados.ambientes
            : Array.isArray(dados?.ambientesSonoros)
              ? dados.ambientesSonoros
              : []
        );
        algumSucesso = true;
      }

      if (!algumSucesso) {
        const msg =
          resUsuario.reason?.message ||
          resPlataforma.reason?.message ||
          "Não foi possível carregar os ambientes. Tente novamente.";
        setErro(msg);
      } else {
        setErro(null);
      }

      setCarregando(false);
    });

    return () => {
      ativo = false;
    };
  }, [token, versao]);

  const termoBusca = busca.trim().toLowerCase();

  const filtrarPorBusca = (lista) =>
    termoBusca
      ? lista.filter((a) => a.nome?.toLowerCase().includes(termoBusca))
      : lista;

  const listaUsuario = useMemo(
    () => filtrarPorBusca(ambientesUsuario),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ambientesUsuario, termoBusca]
  );

  const listaPlataforma = useMemo(
    () => filtrarPorBusca(ambientesPlataforma),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ambientesPlataforma, termoBusca]
  );

  const { tocarAmbiente, ambienteAtual, tocando, reproduzirPausar } = usePlayer();

  const totalResultados =
    (filtro !== "plataforma" ? listaUsuario.length : 0) +
    (filtro !== "usuario" ? listaPlataforma.length : 0);

  function handlePlay(ambiente) {
    if (ambienteAtual?.idAmbienteSonoro === ambiente.idAmbienteSonoro) {
      void reproduzirPausar();
    } else {
      void tocarAmbiente(ambiente);
    }
  }

  function handleAbrir(id) {
    navigate(`/player/${id}`);
  }

  function handleRetry() {
    setCarregando(true);
    setErro(null);
    setVersao((v) => v + 1);
  }

  function handleAbrirNovo() {
    setAmbienteParaEditar(null);
    setModalAberto(true);
  }

  function handleEditar(ambiente) {
    setAmbienteParaEditar(ambiente);
    setModalAberto(true);
  }

  function handleSolicitarExclusao(ambiente) {
    setErroExclusao(null);
    setAmbienteParaExcluir(ambiente);
  }

  async function handleConfirmarExclusao() {
    if (!ambienteParaExcluir || excluindo) return;
    setExcluindo(true);
    setErroExclusao(null);
    try {
      await ambienteService.excluirAmbiente(
        token,
        ambienteParaExcluir.idAmbienteSonoro,
      );

      if (
        ambienteAtual?.idAmbienteSonoro === ambienteParaExcluir.idAmbienteSonoro &&
        tocando
      ) {
        void reproduzirPausar();
      }

      setAmbientesUsuario((prev) =>
        prev.filter(
          (a) => a.idAmbienteSonoro !== ambienteParaExcluir.idAmbienteSonoro,
        ),
      );
      setFeedback(`O ambiente “${ambienteParaExcluir.nome}” foi excluído com sucesso.`);
      setAmbienteParaExcluir(null);
    } catch (err) {
      setErroExclusao(
        err?.message || "Não foi possível excluir o ambiente. Tente novamente.",
      );
    } finally {
      setExcluindo(false);
    }
  }

  const handleAmbienteSalvo = useCallback(
    (ambienteRetornado) => {
      setModalAberto(false);
      const eraEdicao = Boolean(ambienteParaEditar);
      setAmbienteParaEditar(null);

      if (!ambienteRetornado?.idAmbienteSonoro) {
        setVersao((v) => v + 1);
        return;
      }

      setAmbientesUsuario((prev) => {
        const idx = prev.findIndex(
          (a) => a.idAmbienteSonoro === ambienteRetornado.idAmbienteSonoro,
        );
        if (idx >= 0) {
          const copia = [...prev];
          copia[idx] = { ...copia[idx], ...ambienteRetornado };
          return copia;
        }
        return [ambienteRetornado, ...prev];
      });

      setFeedback(
        eraEdicao
          ? `Ambiente “${ambienteRetornado.nome}” atualizado com sucesso.`
          : `Ambiente “${ambienteRetornado.nome}” criado com sucesso.`,
      );
    },
    [ambienteParaEditar],
  );

  const nomeUsuario = usuario?.nome?.split(" ")[0] || "você";

  return (
    <>
    <main
      id="conteudo"
      tabIndex="-1"
      className="user-page px-5 pt-8 outline-none md:px-10 md:pt-14 pb-28 md:pb-20"
    >
      {/* Cabeçalho da página */}
      <header className="user-page-header">
        <div className="user-page-header-content">
          <p className="user-page-eyebrow">Minha área</p>
          <h1 className="user-page-title">Ambientes</h1>
          <p className="user-page-description">
            Os ambientes que você criou e os prontos da plataforma, todos para
            tocar quando quiser.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAbrirNovo}
          className="user-button user-button-primary user-button-md shrink-0"
        >
          <Plus size={16} strokeWidth={1.8} />
          Novo ambiente
        </button>
      </header>

      {/* Filtros e Busca */}
      <div className="mt-8 mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs de filtro */}
        <div className="-mx-5 flex overflow-x-auto px-5 sm:mx-0 sm:overflow-x-visible sm:px-0">
          <div
            role="group"
            aria-label="Filtrar por origem"
            className="flex shrink-0 gap-0.5 rounded-[10px] border border-line-subtle bg-bg-2 p-1"
          >
            {[
              { label: "Todos", valor: "todos" },
              { label: "Criados por você", valor: "usuario" },
              { label: "Da plataforma", valor: "plataforma" },
            ].map((tab) => (
              <button
                key={tab.valor}
                type="button"
                aria-pressed={filtro === tab.valor}
                onClick={() => setFiltro(tab.valor)}
                className={`h-9 shrink-0 rounded-[7px] px-4 text-[13px] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
                  filtro === tab.valor
                    ? "lift bg-accent font-medium text-on-accent hover:bg-accent-hover active:bg-accent-active"
                    : "text-fg-2 hover:bg-surface-hover hover:text-fg active:bg-surface-active"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Campo de busca */}
        <div className="relative sm:w-80">
          <Search
            size={15}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-icon-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Pesquisar ambientes"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="h-9 w-full rounded-xl border border-line-subtle bg-surface pl-9 pr-4 text-sm text-fg placeholder:text-fg-3 focus:outline-none focus:ring-2 focus:ring-focus transition-shadow"
          />
        </div>
      </div>

      {/* Estado: carregando */}
      {carregando && (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-fg-3">
          <div className="size-8 animate-spin rounded-full border-2 border-line border-t-accent" />
          <p className="text-sm">Carregando ambientes…</p>
        </div>
      )}

      {/* Estado: erro */}
      {!carregando && erro && (
        <div className="user-empty-state mt-8 border-line-subtle bg-danger-soft">
          <div className="user-empty-icon bg-surface text-danger">
            <AlertCircle size={22} />
          </div>
          <h3 className="user-empty-title">{erro}</h3>
          <p className="user-empty-description">
            Verifique sua conexão e tente novamente.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="user-button user-button-secondary user-button-sm mt-5"
          >
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      )}

      {/* Conteúdo principal */}
      {!carregando && !erro && (
        <>
          {/* Seção: Criados por você */}
          {filtro !== "plataforma" && (
            <section className="user-section" aria-labelledby="sec-usuario">
              <SecaoHeader
                titulo="Criados por você"
                contagem={listaUsuario.length}
              />

              {listaUsuario.length === 0 ? (
                <div className="user-empty-state">
                  <div className="user-empty-icon">
                    <SlidersHorizontal size={22} />
                  </div>
                  <h3 className="user-empty-title">
                    {termoBusca
                      ? `Nenhum ambiente encontrado para "${busca}"`
                      : "Você ainda não criou nenhum ambiente"}
                  </h3>
                  <p className="user-empty-description">
                    {termoBusca
                      ? "Tente outro termo de busca."
                      : "Em breve você poderá criar ambientes sonoros personalizados com os sons que preferir."}
                  </p>
                </div>
              ) : (
                <div className="user-card-grid">
                  {listaUsuario.map((amb) => (
                    <AmbienteCard
                      key={amb.idAmbienteSonoro}
                      ambiente={amb}
                      onPlay={handlePlay}
                      onAbrir={handleAbrir}
                      onEditar={handleEditar}
                      onExcluir={handleSolicitarExclusao}
                      estaTocando={
                        ambienteAtual?.idAmbienteSonoro === amb.idAmbienteSonoro && tocando
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Seção: Da plataforma */}
          {filtro !== "usuario" && (
            <section className="user-section" aria-labelledby="sec-plataforma">
              <SecaoHeader
                titulo="Da plataforma"
                contagem={listaPlataforma.length}
                descricao="Todos ambientes prontos da plataforma. Para personalizar, crie uma cópia."
              />

              {listaPlataforma.length === 0 ? (
                <div className="user-empty-state">
                  <div className="user-empty-icon">
                    <Compass size={22} />
                  </div>
                  <h3 className="user-empty-title">
                    {termoBusca
                      ? `Nenhum ambiente da plataforma encontrado para "${busca}"`
                      : "Nenhum ambiente da plataforma disponível"}
                  </h3>
                  <p className="user-empty-description">
                    {termoBusca
                      ? "Tente outro termo de busca."
                      : "Os ambientes prontos criados pelo Sonessia aparecerão aqui."}
                  </p>
                </div>
              ) : (
                <div className="user-card-grid">
                  {listaPlataforma.map((amb) => (
                    <AmbienteCard
                      key={amb.idAmbienteSonoro}
                      ambiente={amb}
                      onPlay={handlePlay}
                      onAbrir={handleAbrir}
                      estaTocando={
                        ambienteAtual?.idAmbienteSonoro === amb.idAmbienteSonoro && tocando
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Estado: busca sem resultados em qualquer filtro */}
          {termoBusca && totalResultados === 0 && (
            <div className="user-empty-state mt-8">
              <div className="user-empty-icon">
                <Search size={22} />
              </div>
              <h3 className="user-empty-title">
                Nenhum resultado para &ldquo;{busca}&rdquo;
              </h3>
              <p className="user-empty-description">
                Tente buscar com outro nome ou limpe a busca para ver todos os
                ambientes de {nomeUsuario}.
              </p>
              <button
                type="button"
                onClick={() => setBusca("")}
                className="user-button user-button-secondary user-button-sm mt-5"
              >
                Limpar busca
              </button>
            </div>
          )}
        </>
      )}
    </main>

    {/* Toast flutuante de feedback de sucesso */}
    {feedback && (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-6 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-3 rounded-xl border border-line bg-surface py-2.5 pl-4 pr-3 text-sm text-fg shadow-lg"
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
          <Check size={13} strokeWidth={2.5} />
        </span>
        <span className="min-w-0">{feedback}</span>
        <button
          type="button"
          onClick={() => setFeedback(null)}
          className="ml-2 rounded-md p-1 text-icon-muted hover:bg-surface-hover hover:text-fg outline-none focus-visible:ring-2 focus-visible:ring-focus"
          aria-label="Fechar aviso"
        >
          <X size={15} />
        </button>
      </div>
    )}

    {/* Modal de confirmação de exclusão */}
    {ambienteParaExcluir && (
      <ModalExcluirAmbiente
        ambiente={ambienteParaExcluir}
        excluindo={excluindo}
        erro={erroExclusao}
        onConfirmar={handleConfirmarExclusao}
        onCancelar={() => {
          if (!excluindo) setAmbienteParaExcluir(null);
        }}
      />
    )}

    {/* Modal para criar ou editar ambiente */}
    {modalAberto && (
      <ModalNovoAmbiente
        key={ambienteParaEditar?.idAmbienteSonoro || "novo"}
        token={token}
        ambienteParaEditar={ambienteParaEditar}
        onFechar={() => {
          setModalAberto(false);
          setAmbienteParaEditar(null);
        }}
        onSalvo={handleAmbienteSalvo}
        onCriado={handleAmbienteSalvo}
      />
    )}
    </>
  );
}
