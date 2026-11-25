import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Ellipsis,
  FolderOpen,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { useAuth } from "../../contexts/useAuth.js";
import { colecoesService } from "../../services/colecoes.service.js";

/* =========================================================
   CARD DE COLEÇÃO
   ========================================================= */

function ColecaoCard({ colecao }) {
  const id = colecao.idColecao || colecao.id;
  const nome = colecao.nome || colecao.name || "Sem título";
  const descricao = colecao.descricao || colecao.description;
  const quantidadeAmbientes =
    typeof colecao.quantidadeAmbientes === "number"
      ? colecao.quantidadeAmbientes
      : Array.isArray(colecao.ambientes)
        ? colecao.ambientes.length
        : 0;

  return (
    <li
      className="
        group relative
        rounded-xl border border-line-subtle
        bg-surface
        transition-colors duration-200
        hover:border-line hover:bg-surface-hover
      "
    >
      {/* Link para os detalhes da coleção */}
      <Link
        to={`/comum/colecoes/${id}`}
        aria-label={`Abrir coleção ${nome}`}
        className="
          flex gap-4 p-4
          rounded-xl
          outline-none
          focus-visible:ring-2
          focus-visible:ring-focus
        "
      >
        {/* Imagem / Ícone */}
        <span
          aria-hidden="true"
          className="
            grid size-[88px] shrink-0
            place-items-center overflow-hidden
            rounded-xl border border-line-subtle
            bg-bg-2
          "
        >
          {colecao.image || colecao.imagem ? (
            <img
              src={colecao.image || colecao.imagem}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <FolderOpen
              size={26}
              strokeWidth={1.3}
              className="text-icon-muted"
            />
          )}
        </span>

        {/* Informações */}
        <div className="min-w-0 flex-1 pr-8">
          <h3
            className="
              text-[15px] font-medium
              tracking-[-0.01em]
              group-hover:underline
              underline-offset-4
            "
          >
            {nome}
          </h3>

          <p
            className="
              mt-1.5 line-clamp-2
              text-[13px] leading-snug
              text-fg-2
            "
          >
            {descricao || "Sem descrição"}
          </p>

          <p
            className="
              mt-2.5 font-mono text-[10px]
              uppercase tracking-[0.18em]
              text-fg-3
            "
          >
            {quantidadeAmbientes}{" "}
            {quantidadeAmbientes === 1 ? "ambiente" : "ambientes"}
          </p>
        </div>
      </Link>

      {/* Mais ações (funcionalidade posterior) */}
      <button
        type="button"
        disabled
        aria-label={`Mais ações para ${nome}`}
        title="Ações disponíveis posteriormente"
        className="
          absolute right-1.5 top-1.5 z-10
          grid size-10 place-items-center
          rounded-full
          text-icon-2
          transition-colors duration-200
          hover:bg-surface-hover hover:text-fg
          outline-none focus-visible:ring-2
          focus-visible:ring-focus
          disabled:cursor-default
        "
      >
        <Ellipsis size={18} strokeWidth={1.6} />
      </button>
    </li>
  );
}

/* =========================================================
   ESTADO VAZIO
   ========================================================= */

function EstadoVazio({ pesquisando, onCriarColecao }) {
  return (
    <div
      className="
        flex flex-col items-center
        rounded-xl border border-line-subtle
        bg-surface px-6 py-14
        text-center
      "
    >
      <span
        className="
          grid size-12 place-items-center
          rounded-xl bg-accent-soft
          text-accent
        "
      >
        <FolderOpen size={22} strokeWidth={1.5} />
      </span>

      <h2 className="mt-5 text-base font-medium">
        {pesquisando
          ? "Nenhuma coleção encontrada"
          : "Você ainda não tem coleções"}
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-2">
        {pesquisando
          ? "Tente pesquisar por outro nome ou descrição."
          : "Organize seus ambientes em sequências para diferentes momentos."}
      </p>

      {!pesquisando && (
        <button
          type="button"
          onClick={onCriarColecao}
          className="user-button user-button-primary user-button-md mt-6"
        >
          <Plus size={16} strokeWidth={1.8} />
          Nova coleção
        </button>
      )}
    </div>
  );
}

/* =========================================================
   MODAL DE NOVA COLEÇÃO
   ========================================================= */

function ModalNovaColecao({ onFechar, onCriar, salvando, erroApi }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState("");

  const erroExibicao = erro || erroApi;

  async function handleSubmit(event) {
    event.preventDefault();
    if (salvando) return;

    const nomeNormalizado = nome.trim();

    if (!nomeNormalizado) {
      setErro("Informe um nome para a coleção.");
      return;
    }

    if (nomeNormalizado.length > 255) {
      setErro("O nome deve ter no máximo 255 caracteres.");
      return;
    }

    const descricaoNormalizada = descricao.trim();
    if (descricaoNormalizada.length > 1000) {
      setErro("A descrição deve ter no máximo 1000 caracteres.");
      return;
    }

    await onCriar({
      nome: nomeNormalizado,
      descricao: descricaoNormalizada || null,
    });
  }

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-end justify-center
        bg-black/45 p-0
        backdrop-blur-[2px]
        sm:items-center sm:p-4
      "
      onMouseDown={(event) => {
        if (!salvando && event.target === event.currentTarget) {
          onFechar();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="nova-colecao-titulo"
        aria-describedby="nova-colecao-descricao"
        className="
          relative flex max-h-[92dvh] w-full
          flex-col rounded-t-2xl
          border border-line bg-surface
          shadow-2xl
          sm:max-w-[520px] sm:rounded-2xl
        "
      >
        {/* Cabeçalho */}
        <div
          className="
            flex items-start justify-between gap-4
            px-6 pb-4 pt-6
          "
        >
          <div className="min-w-0">
            <h2
              id="nova-colecao-titulo"
              className="
                text-[22px] font-light
                leading-tight tracking-[-0.03em]
              "
            >
              Nova coleção
            </h2>

            <p
              id="nova-colecao-descricao"
              className="mt-2 text-sm leading-relaxed text-fg-2"
            >
              Reúna seus ambientes em uma ordem de reprodução. Você adiciona os
              ambientes depois de criar.
            </p>
          </div>

          <button
            type="button"
            onClick={onFechar}
            disabled={salvando}
            aria-label="Fechar"
            title="Fechar"
            className="
              -mr-2 -mt-1 grid size-10 shrink-0
              place-items-center rounded-full
              text-icon-2
              transition-colors duration-200
              hover:bg-surface-hover hover:text-fg
              outline-none focus-visible:ring-2
              focus-visible:ring-focus
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </div>

        {/* Formulário */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          <form
            id="form-nova-colecao"
            onSubmit={handleSubmit}
            className="space-y-5 pt-2"
          >
            {/* Nome */}
            <div>
              <label
                htmlFor="nome-colecao"
                className="mb-2 block text-sm font-medium text-fg"
              >
                Nome
              </label>

              <input
                id="nome-colecao"
                type="text"
                value={nome}
                disabled={salvando}
                onChange={(event) => {
                  setNome(event.target.value);
                  setErro("");
                }}
                maxLength={255}
                spellCheck={false}
                placeholder="Ex.: Para dormir"
                autoFocus
                aria-invalid={Boolean(erroExibicao)}
                aria-describedby={erroExibicao ? "erro-nome-colecao" : undefined}
                className="
                  h-12 w-full rounded-lg
                  border border-line bg-surface
                  px-3.5 text-[15px] text-fg
                  outline-none transition-colors duration-200
                  placeholder:text-fg-3
                  hover:border-line-strong
                  focus:border-focus focus:ring-1 focus:ring-focus
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              />

              {erroExibicao && (
                <p
                  id="erro-nome-colecao"
                  role="alert"
                  className="mt-2 text-sm text-danger"
                >
                  {erroExibicao}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label
                  htmlFor="descricao-colecao"
                  className="text-sm font-medium text-fg"
                >
                  Descrição (opcional)
                </label>

                <span
                  aria-hidden="true"
                  className="
                    font-mono text-[11px]
                    tabular-nums text-fg-3
                  "
                >
                  {descricao.length}/1000
                </span>
              </div>

              <textarea
                id="descricao-colecao"
                rows={3}
                maxLength={1000}
                value={descricao}
                disabled={salvando}
                onChange={(event) => setDescricao(event.target.value)}
                className="
                  w-full resize-none rounded-lg
                  border border-line bg-surface
                  px-3.5 py-3 text-[15px]
                  leading-relaxed text-fg
                  outline-none transition-colors duration-200
                  placeholder:text-fg-3
                  hover:border-line-strong
                  focus:border-focus focus:ring-1 focus:ring-focus
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              />
            </div>
          </form>
        </div>

        {/* Ações */}
        <div
          className="
            flex flex-col-reverse gap-2
            border-t border-line-subtle
            px-6 py-4
            sm:flex-row sm:justify-end
          "
        >
          <button
            type="button"
            onClick={onFechar}
            disabled={salvando}
            className="user-button user-button-secondary user-button-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="form-nova-colecao"
            disabled={salvando}
            className="user-button user-button-primary user-button-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Plus size={16} strokeWidth={1.8} />
            {salvando ? "Criando..." : "Criar coleção"}
          </button>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   TELA DE COLEÇÕES
   ========================================================= */

export default function UserColecoes() {
  const { token } = useAuth();
  const [colecoes, setColecoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [versao, setVersao] = useState(0);

  const [pesquisa, setPesquisa] = useState("");
  const [ordenacao, setOrdenacao] = useState("recentes");
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroCriacao, setErroCriacao] = useState("");
  const [feedback, setFeedback] = useState("");

  /* ---------------------------------------------------------
     CARREGAMENTO DOS DADOS REAIS DA API
     --------------------------------------------------------- */

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      if (!token) {
        if (ativo) setCarregando(false);
        return;
      }

      try {
        const resposta = await colecoesService.listarColecoes(token);
        if (!ativo) return;
        const lista = Array.isArray(resposta?.colecoes) ? resposta.colecoes : [];
        setColecoes(lista);
        setErro(null);
      } catch (falha) {
        if (!ativo) return;
        setErro(
          falha?.mensagem ||
            falha?.message ||
            "Não foi possível carregar suas coleções. Tente novamente.",
        );
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregar();

    return () => {
      ativo = false;
    };
  }, [token, versao]);

  function handleRecarregar() {
    setCarregando(true);
    setErro(null);
    setVersao((v) => v + 1);
  }

  /* ---------------------------------------------------------
     PESQUISA E ORDENAÇÃO
     --------------------------------------------------------- */

  const colecoesFiltradas = useMemo(() => {
    const termoPesquisa = pesquisa.trim().toLowerCase();

    const resultado = colecoes.filter((colecao) => {
      const nome = (colecao.nome || colecao.name || "").toLowerCase();
      const desc = (colecao.descricao || colecao.description || "").toLowerCase();
      return nome.includes(termoPesquisa) || desc.includes(termoPesquisa);
    });

    switch (ordenacao) {
      case "nome":
        resultado.sort((a, b) => {
          const nomeA = a.nome || a.name || "";
          const nomeB = b.nome || b.name || "";
          return nomeA.localeCompare(nomeB, "pt-BR", {
            sensitivity: "base",
          });
        });
        break;

      case "ambientes":
        resultado.sort((a, b) => {
          const qtdA =
            typeof a.quantidadeAmbientes === "number"
              ? a.quantidadeAmbientes
              : Array.isArray(a.ambientes)
                ? a.ambientes.length
                : 0;
          const qtdB =
            typeof b.quantidadeAmbientes === "number"
              ? b.quantidadeAmbientes
              : Array.isArray(b.ambientes)
                ? b.ambientes.length
                : 0;
          return qtdB - qtdA;
        });
        break;

      case "recentes":
      default:
        // Preserva a ordem retornada pela API
        break;
    }

    return resultado;
  }, [colecoes, pesquisa, ordenacao]);

  /* ---------------------------------------------------------
     CRIAR COLEÇÃO COM ENDPOINT REAL
     --------------------------------------------------------- */

  async function handleCriarColecao(dados) {
    if (salvando) return;
    setSalvando(true);
    setErroCriacao("");

    try {
      const resposta = await colecoesService.criarColecao(token, {
        nome: dados.nome,
        descricao: dados.descricao || null,
      });

      const nova = resposta?.colecao;
      if (nova) {
        setColecoes((atuais) => [nova, ...atuais]);
      } else {
        setVersao((v) => v + 1);
      }

      setPesquisa("");
      setOrdenacao("recentes");
      setModalAberto(false);
      setFeedback(`Coleção "${dados.nome}" criada com sucesso.`);
    } catch (falha) {
      setErroCriacao(
        falha?.mensagem ||
          falha?.message ||
          "Não foi possível criar a coleção. Verifique os dados e tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  /* ---------------------------------------------------------
     RENDERIZAÇÃO
     --------------------------------------------------------- */

  return (
    <main
      id="conteudo"
      tabIndex="-1"
      className="
        mx-auto w-full max-w-[1120px]
        px-5 pt-8 outline-none
        md:px-10 md:pt-14
        pb-28 md:pb-20
      "
    >
      {/* =====================================================
          CABEÇALHO
      ===================================================== */}

      <header
        className="
          flex flex-wrap items-end
          justify-between gap-x-8 gap-y-5
        "
      >
        <div className="min-w-0 max-w-xl">
          <p className="user-page-eyebrow">Minha área</p>

          <h1 className="user-page-title">Coleções</h1>

          <p className="user-page-description">
            Agrupe seus ambientes e defina a ordem em que serão tocados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFeedback("");
            setErroCriacao("");
            setModalAberto(true);
          }}
          className="
            user-button user-button-primary
            user-button-md shrink-0
          "
        >
          <Plus size={16} strokeWidth={1.8} />
          Nova coleção
        </button>
      </header>

      {/* =====================================================
          ESTADO: CARREGANDO
      ===================================================== */}

      {carregando && (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-fg-3">
          <div className="size-8 animate-spin rounded-full border-2 border-line border-t-accent" />
          <p className="text-sm">Carregando coleções…</p>
        </div>
      )}

      {/* =====================================================
          ESTADO: ERRO
      ===================================================== */}

      {!carregando && erro && (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-500">
            <AlertCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-fg">{erro}</p>
            <p className="mt-1 text-xs text-fg-3">
              Verifique sua conexão e tente novamente.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRecarregar}
            className="inline-flex items-center gap-2 rounded-xl border border-line-subtle bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-hover"
          >
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      )}

      {/* =====================================================
          CONTEÚDO PRINCIPAL (QUANDO CARREGADO COM SUCESSO)
      ===================================================== */}

      {!carregando && !erro && (
        <>
          {/* PESQUISA E ORDENAÇÃO */}
          <div
            className="
              mt-10 flex flex-col gap-3
              sm:flex-row sm:items-center
              sm:justify-between
            "
          >
            {/* Pesquisa */}
            <div className="relative w-full sm:max-w-[320px]">
              <label htmlFor="pesquisa-colecoes" className="sr-only">
                Pesquisar coleções
              </label>

              <Search
                size={16}
                strokeWidth={1.6}
                aria-hidden="true"
                className="
                  pointer-events-none absolute
                  left-3.5 top-1/2
                  -translate-y-1/2 text-icon-muted
                "
              />

              <input
                id="pesquisa-colecoes"
                type="search"
                value={pesquisa}
                onChange={(event) => setPesquisa(event.target.value)}
                placeholder="Pesquisar coleções"
                autoComplete="off"
                className="
                  h-11 w-full rounded-[10px]
                  border border-line bg-surface
                  pl-10 pr-10 text-sm text-fg
                  outline-none transition-colors duration-200
                  placeholder:text-fg-3
                  hover:border-line-strong
                  focus:border-focus focus:ring-1 focus:ring-focus
                "
              />

              {pesquisa && (
                <button
                  type="button"
                  onClick={() => setPesquisa("")}
                  aria-label="Limpar pesquisa"
                  className="
                    absolute right-2 top-1/2
                    grid size-8 -translate-y-1/2
                    place-items-center rounded-full
                    text-icon-muted hover:bg-surface-hover
                    hover:text-fg
                  "
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-2.5">
              <label
                htmlFor="ordenacao-colecoes"
                className="shrink-0 text-[13px] text-fg-3"
              >
                Ordenar por
              </label>

              <select
                id="ordenacao-colecoes"
                value={ordenacao}
                onChange={(event) => setOrdenacao(event.target.value)}
                className="
                  h-11 rounded-[10px]
                  border border-line bg-surface
                  px-3 text-sm text-fg
                  outline-none transition-colors duration-200
                  hover:border-line-strong
                  focus:border-focus focus:ring-1 focus:ring-focus
                "
              >
                <option value="recentes">Mais recentes</option>
                <option value="nome">Nome (A–Z)</option>
                <option value="ambientes">Mais ambientes</option>
              </select>
            </div>
          </div>

          <p aria-live="polite" className="sr-only">
            {colecoesFiltradas.length}{" "}
            {colecoesFiltradas.length === 1
              ? "coleção encontrada"
              : "coleções encontradas"}
          </p>

          {/* Feedback da criação */}
          {feedback && (
            <div
              role="status"
              className="
                mt-5 rounded-lg border border-line
                bg-accent-soft px-4 py-3
                text-sm text-fg
              "
            >
              {feedback}
            </div>
          )}

          {/* Lista ou Estado Vazio */}
          {colecoesFiltradas.length > 0 ? (
            <ul
              className="
                mt-8 grid gap-4
                md:grid-cols-2 xl:grid-cols-3
              "
            >
              {colecoesFiltradas.map((colecao) => (
                <ColecaoCard key={colecao.idColecao || colecao.id} colecao={colecao} />
              ))}
            </ul>
          ) : (
            <div className="mt-8">
              <EstadoVazio
                pesquisando={Boolean(pesquisa.trim())}
                onCriarColecao={() => {
                  setFeedback("");
                  setErroCriacao("");
                  setModalAberto(true);
                }}
              />
            </div>
          )}
        </>
      )}

      {/* =====================================================
          MODAL DE CRIAÇÃO
      ===================================================== */}

      {modalAberto && (
        <ModalNovaColecao
          onFechar={() => {
            if (!salvando) {
              setModalAberto(false);
              setErroCriacao("");
            }
          }}
          onCriar={handleCriarColecao}
          salvando={salvando}
          erroApi={erroCriacao}
        />
      )}
    </main>
  );
}
