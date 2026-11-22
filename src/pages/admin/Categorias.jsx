import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  FolderTree,
  LoaderCircle,
  Music,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/useAuth.js";
import { categoriasService } from "../../services/categorias.service.js";

const SECOES = [
  { tipo: "AUDIO", rotulo: "Categorias de áudios", icone: Music },
  { tipo: "AMBIENTE", rotulo: "Categorias de ambientes", icone: Sparkles },
];

const FILTROS_STATUS = [
  { valor: "TODAS", rotulo: "Todas" },
  { valor: "ATIVAS", rotulo: "Ativas" },
  { valor: "INATIVAS", rotulo: "Inativas" },
];

function Alerta({ tipo, mensagem, onFechar, id }) {
  if (!mensagem) return null;

  const sucesso = tipo === "sucesso";
  return (
    <div
      id={id}
      role={sucesso ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
        sucesso
          ? "border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
          : "border-rose-200 bg-rose-50/80 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
      }`}
    >
      {sucesso ? (
        <Check size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      )}
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

function ModalCategoria({
  tipo,
  categoria,
  nome,
  erro,
  salvando,
  onNomeChange,
  onFechar,
  onSubmit,
}) {
  const titulo = categoria ? "Editar categoria" : "Nova categoria";
  const descricao = categoria
    ? `Altere o nome da categoria ${categoria.nome}.`
    : `A categoria será criada em ${tipo === "AUDIO" ? "áudios" : "ambientes"}.`;

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
        aria-labelledby="modal-categoria-titulo"
        aria-describedby="modal-categoria-descricao"
        className="my-auto w-full max-w-md rounded-2xl border border-line-subtle bg-surface p-6 shadow-2xl sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-categoria-titulo" className="text-lg font-bold tracking-tight text-fg">
              {titulo}
            </h2>
            <p id="modal-categoria-descricao" className="mt-1 text-sm leading-relaxed text-fg-2">
              {descricao}
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

        {erro && <Alerta id="categoria-form-erro" tipo="erro" mensagem={erro} />}

        <form onSubmit={onSubmit} className="mt-5 space-y-5">
          <div>
            <label htmlFor="nome-categoria" className="mb-1.5 block text-sm font-medium text-fg">
              Nome
            </label>
            <input
              id="nome-categoria"
              type="text"
              value={nome}
              onChange={(evento) => onNomeChange(evento.target.value)}
              placeholder="Ex.: Natureza"
              maxLength={255}
              autoFocus
              required
              aria-invalid={Boolean(erro)}
              aria-describedby={erro ? "categoria-form-erro" : undefined}
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-fg placeholder:text-fg-disabled transition-all focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20"
            />
            <p className="mt-1.5 text-xs text-fg-3">
              Tipo: {tipo === "AUDIO" ? "Áudio" : "Ambiente"}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
              disabled={salvando || !nome.trim()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] px-5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[image:linear-gradient(100deg,#684a98,#5667b8)] hover:shadow active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
              {salvando ? "Salvando..." : categoria ? "Salvar alterações" : "Criar categoria"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ModalExclusao({ categoria, erro, excluindo, onFechar, onConfirmar }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/45 p-4 backdrop-blur-xs"
      role="presentation"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !excluindo) onFechar();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-exclusao-titulo"
        aria-describedby="modal-exclusao-descricao"
        className="my-auto w-full max-w-md rounded-2xl border border-line-subtle bg-surface p-6 shadow-2xl sm:p-7"
      >
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
          <Trash2 size={20} aria-hidden="true" />
        </div>
        <h2 id="modal-exclusao-titulo" className="text-lg font-bold tracking-tight text-fg">
          Excluir categoria?
        </h2>
        <p id="modal-exclusao-descricao" className="mt-2 text-sm leading-relaxed text-fg-2">
          A categoria <span className="font-semibold text-fg">“{categoria.nome}”</span> será removida
          permanentemente. Esta ação não pode ser desfeita.
        </p>

        {erro && <div className="mt-4"><Alerta tipo="erro" mensagem={erro} /></div>}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onFechar}
            disabled={excluindo}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-surface px-5 text-sm font-medium text-fg-2 transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={excluindo}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-medium text-white transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {excluindo && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
            {excluindo ? "Excluindo..." : "Excluir categoria"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function Categorias() {
  const { token } = useAuth();
  const [tipoSelecionado, setTipoSelecionado] = useState("AUDIO");
  const [filtroStatus, setFiltroStatus] = useState("TODAS");
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [versaoCarregamento, setVersaoCarregamento] = useState(0);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [modal, setModal] = useState(null);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [categoriaExcluindo, setCategoriaExcluindo] = useState(null);
  const [nome, setNome] = useState("");
  const [erroModal, setErroModal] = useState("");
  const [erroExclusao, setErroExclusao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [operacaoEmAndamento, setOperacaoEmAndamento] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarCategorias() {
      setCarregando(true);
      setErro("");
      setCategorias([]);

      try {
        const resposta = await categoriasService.listar(token, tipoSelecionado, true);
        if (!Array.isArray(resposta?.categorias)) {
          throw new Error("A resposta da API não contém uma lista válida de categorias.");
        }
        if (ativo) setCategorias(resposta.categorias);
      } catch (falha) {
        if (ativo) {
          setErro(falha.message || "Não foi possível carregar as categorias.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarCategorias();
    return () => {
      ativo = false;
    };
  }, [token, tipoSelecionado, versaoCarregamento]);

  const categoriasVisiveis = useMemo(() => {
    const filtradas = categorias.filter((categoria) => {
      if (filtroStatus === "ATIVAS") return categoria.ativa;
      if (filtroStatus === "INATIVAS") return !categoria.ativa;
      return true;
    });
    return filtradas.slice().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [categorias, filtroStatus]);

  const contagemStatus = useMemo(
    () => ({
      TODAS: categorias.length,
      ATIVAS: categorias.filter((categoria) => categoria.ativa).length,
      INATIVAS: categorias.filter((categoria) => !categoria.ativa).length,
    }),
    [categorias],
  );

  function abrirCriacao() {
    setCategoriaEditando(null);
    setNome("");
    setErroModal("");
    setModal("criar");
    setErro("");
    setSucesso("");
  }

  function abrirEdicao(categoria) {
    setCategoriaEditando(categoria);
    setNome(categoria.nome);
    setErroModal("");
    setModal("editar");
    setErro("");
    setSucesso("");
  }

  function fecharModal() {
    if (salvando) return;
    setModal(null);
    setCategoriaEditando(null);
    setErroModal("");
  }

  async function salvarCategoria(evento) {
    evento.preventDefault();
    const nomeNormalizado = nome.trim();

    if (!nomeNormalizado) {
      setErroModal("Informe o nome da categoria.");
      return;
    }

    setSalvando(true);
    setErroModal("");
    setErro("");
    setSucesso("");

    try {
      if (modal === "criar") {
        await categoriasService.criar(token, {
          nome: nomeNormalizado,
          tipo: tipoSelecionado,
        });
        setSucesso("Categoria criada com sucesso.");
      } else {
        await categoriasService.atualizar(
          token,
          categoriaEditando.idCategoria,
          { nome: nomeNormalizado },
        );
        setSucesso("Categoria atualizada com sucesso.");
      }

      setVersaoCarregamento((atual) => atual + 1);
      setModal(null);
      setCategoriaEditando(null);
      setNome("");
    } catch (falha) {
      setErroModal(falha.message || "Não foi possível salvar a categoria.");
    } finally {
      setSalvando(false);
    }
  }

  async function alternarStatus(categoria) {
    setOperacaoEmAndamento(categoria.idCategoria);
    setErro("");
    setSucesso("");

    try {
      const resposta = await categoriasService.atualizar(token, categoria.idCategoria, {
        ativa: !categoria.ativa,
      });
      setVersaoCarregamento((atual) => atual + 1);
      setSucesso(`Categoria ${resposta.categoria.ativa ? "ativada" : "desativada"} com sucesso.`);
    } catch (falha) {
      setErro(falha.message || "Não foi possível alterar o status da categoria.");
    } finally {
      setOperacaoEmAndamento("");
    }
  }

  function abrirExclusao(categoria) {
    setCategoriaExcluindo(categoria);
    setErroExclusao("");
    setErro("");
    setSucesso("");
  }

  async function confirmarExclusao() {
    if (!categoriaExcluindo) return;

    const idCategoria = categoriaExcluindo.idCategoria;
    setOperacaoEmAndamento(idCategoria);
    setErroExclusao("");

    try {
      await categoriasService.excluir(token, idCategoria);
      setVersaoCarregamento((atual) => atual + 1);
      setCategoriaExcluindo(null);
      setSucesso("Categoria excluída com sucesso.");
    } catch (falha) {
      setErroExclusao(
        falha.codigo === "CATEGORIA_POSSUI_ASSOCIACOES"
          ? "Esta categoria está vinculada a áudios ou ambientes sonoros e não pode ser excluída. Você pode desativá-la para impedir novos usos."
          : falha.message || "Não foi possível excluir a categoria.",
      );
    } finally {
      setOperacaoEmAndamento("");
    }
  }

  const secaoSelecionada = SECOES.find((secao) => secao.tipo === tipoSelecionado);
  const IconeSecao = secaoSelecionada.icone;

  return (
    <div className="space-y-6 animate-fadeIn">
      <section className="rounded-2xl border border-line-subtle bg-surface p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <FolderTree size={23} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">
                Categorias sonoras
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-fg-2">
                Organize as categorias disponíveis para áudios e ambientes do Sonessia.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={abrirCriacao}
            disabled={carregando || Boolean(operacaoEmAndamento)}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] px-5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[image:linear-gradient(100deg,#684a98,#5667b8)] hover:shadow active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={17} aria-hidden="true" />
            Nova categoria
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-line-subtle pt-5 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="tablist"
            aria-label="Tipo de categoria"
            className="inline-flex w-full gap-1 rounded-xl border border-line-subtle bg-bg-2 p-1 sm:w-fit"
          >
            {SECOES.map((secao) => {
              const Icone = secao.icone;
              const selecionada = tipoSelecionado === secao.tipo;
              return (
                <button
                  key={secao.tipo}
                  type="button"
                  role="tab"
                  aria-selected={selecionada}
                  onClick={() => {
                    setTipoSelecionado(secao.tipo);
                    setFiltroStatus("TODAS");
                    setErro("");
                    setSucesso("");
                  }}
                  className={`inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:flex-none sm:px-4 ${
                    selecionada
                      ? "bg-surface text-accent shadow-xs"
                      : "text-fg-2 hover:bg-surface-hover hover:text-fg"
                  }`}
                >
                  <Icone size={16} aria-hidden="true" />
                  <span>{secao.tipo === "AUDIO" ? "Áudios" : "Ambientes"}</span>
                </button>
              );
            })}
          </div>

          <div
            role="group"
            aria-label="Filtrar por status"
            className="flex w-full gap-1 overflow-x-auto rounded-xl border border-line-subtle bg-bg-2 p-1 sm:w-fit"
          >
            {FILTROS_STATUS.map((filtro) => (
              <button
                key={filtro.valor}
                type="button"
                aria-pressed={filtroStatus === filtro.valor}
                onClick={() => setFiltroStatus(filtro.valor)}
                className={`inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:flex-none ${
                  filtroStatus === filtro.valor
                    ? "bg-surface text-fg shadow-xs"
                    : "text-fg-3 hover:bg-surface-hover hover:text-fg"
                }`}
              >
                {filtro.rotulo}
                <span className="text-[11px] text-fg-3">{contagemStatus[filtro.valor]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {erro && <Alerta tipo="erro" mensagem={erro} onFechar={() => setErro("")} />}
      {sucesso && <Alerta tipo="sucesso" mensagem={sucesso} onFechar={() => setSucesso("")} />}

      <section
        aria-label={secaoSelecionada.rotulo}
        className="overflow-hidden rounded-2xl border border-line-subtle bg-surface"
      >
        <header className="flex items-center justify-between gap-3 border-b border-line-subtle px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <IconeSecao size={18} className="text-accent" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-fg">{secaoSelecionada.rotulo}</h3>
          </div>
          {!carregando && (
            <span className="text-xs text-fg-3">
              {categoriasVisiveis.length} {categoriasVisiveis.length === 1 ? "categoria" : "categorias"}
            </span>
          )}
        </header>

        {carregando ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-8" role="status">
            <LoaderCircle size={25} className="animate-spin text-accent" aria-hidden="true" />
            <p className="text-sm text-fg-3">Carregando categorias...</p>
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
        ) : categoriasVisiveis.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bg-2 text-icon-muted">
              <FolderTree size={22} aria-hidden="true" />
            </div>
            <h4 className="mt-4 text-sm font-semibold text-fg">
              {categorias.length === 0
                ? "Nenhuma categoria cadastrada"
                : `Nenhuma categoria ${filtroStatus === "ATIVAS" ? "ativa" : "inativa"}`}
            </h4>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-fg-3">
              {categorias.length === 0
                ? "Crie a primeira categoria desta seção para organizar o catálogo."
                : "Tente outro filtro de status para ver as categorias disponíveis."}
            </p>
            {categorias.length === 0 && (
              <button
                type="button"
                onClick={abrirCriacao}
                className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                <Plus size={16} aria-hidden="true" />
                Criar categoria
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-line-subtle">
            {categoriasVisiveis.map((categoria) => {
              const operando = operacaoEmAndamento === categoria.idCategoria;
              return (
                <li
                  key={categoria.idCategoria}
                  className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-bg/60 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line-subtle bg-bg text-icon-2">
                      <IconeSecao size={17} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-fg">{categoria.nome}</p>
                      <p className="mt-0.5 text-xs text-fg-3">
                        {tipoSelecionado === "AUDIO" ? "Categoria de áudio" : "Categoria de ambiente"}
                      </p>
                    </div>
                    <span
                      className={`ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium sm:ml-2 ${
                        categoria.ativa
                          ? "border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                          : "border-line-subtle bg-bg-2 text-fg-3"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${categoria.ativa ? "bg-emerald-500" : "bg-fg-3"}`} />
                      {categoria.ativa ? "Ativa" : "Inativa"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => abrirEdicao(categoria)}
                      disabled={Boolean(operacaoEmAndamento)}
                      aria-label={`Editar categoria ${categoria.nome}`}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line-subtle bg-surface px-3 text-xs font-medium text-fg-2 transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Pencil size={14} aria-hidden="true" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => alternarStatus(categoria)}
                      disabled={Boolean(operacaoEmAndamento)}
                      aria-label={`${categoria.ativa ? "Desativar" : "Ativar"} categoria ${categoria.nome}`}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line-subtle bg-surface px-3 text-xs font-medium text-fg-2 transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {operando ? (
                        <LoaderCircle size={14} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <Check size={14} aria-hidden="true" />
                      )}
                      {categoria.ativa ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => abrirExclusao(categoria)}
                      disabled={Boolean(operacaoEmAndamento)}
                      aria-label={`Excluir categoria ${categoria.nome}`}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-surface px-3 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
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

      {modal && (
        <ModalCategoria
          tipo={tipoSelecionado}
          categoria={categoriaEditando}
          nome={nome}
          erro={erroModal}
          salvando={salvando}
          onNomeChange={(valor) => {
            setNome(valor);
            setErroModal("");
          }}
          onFechar={fecharModal}
          onSubmit={salvarCategoria}
        />
      )}

      {categoriaExcluindo && (
        <ModalExclusao
          categoria={categoriaExcluindo}
          erro={erroExclusao}
          excluindo={operacaoEmAndamento === categoriaExcluindo.idCategoria}
          onFechar={() => {
            if (operacaoEmAndamento) return;
            setCategoriaExcluindo(null);
            setErroExclusao("");
          }}
          onConfirmar={confirmarExclusao}
        />
      )}
    </div>
  );
}
