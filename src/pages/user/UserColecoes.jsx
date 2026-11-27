import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  FolderOpen,
  Plus,
  RefreshCw,
  Save,
  Search,
  X,
} from "lucide-react";

import { useAuth } from "../../contexts/useAuth.js";
import { colecoesService } from "../../services/colecoes.service.js";
import { ambienteService } from "../../services/sons.service.js";
import MenuAcoesCard from "../../components/user/MenuAcoesCard.jsx";
import ModalConfirmarExclusao from "../../components/user/ModalConfirmarExclusao.jsx";
import ModalColecaoForm from "../../components/user/ModalColecaoForm.jsx";

/* =========================================================
   CARD DE COLEÇÃO
   ========================================================= */

function ColecaoCard({ colecao, onEditar, onExcluir }) {
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
        colecao-card
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
          {colecao.image || colecao.imagem || colecao.ambientes?.[0]?.imagem ? (
            <img
              src={colecao.image || colecao.imagem || colecao.ambientes?.[0]?.imagem}
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

      <MenuAcoesCard nome={nome} tipo="coleção" onEditar={onEditar} onExcluir={onExcluir} />
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
  const [colecaoEditando, setColecaoEditando] = useState(null);
  const [abrindoEdicao, setAbrindoEdicao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroCriacao, setErroCriacao] = useState("");
  const [ambientesDisponiveis, setAmbientesDisponiveis] = useState([]);
  const [carregandoAmbientes, setCarregandoAmbientes] = useState(false);
  const [erroAmbientes, setErroAmbientes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [colecaoParaExcluir, setColecaoParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState("");

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

  async function carregarAmbientesDisponiveis() {
    setCarregandoAmbientes(true);
    setErroAmbientes("");
    setAmbientesDisponiveis([]);
    try {
      const resposta = await ambienteService.listarAmbientes(token);
      setAmbientesDisponiveis(Array.isArray(resposta?.ambientes) ? resposta.ambientes : []);
    } catch (falha) {
      setErroAmbientes(
        falha?.mensagem || falha?.message || "Não foi possível carregar os ambientes disponíveis.",
      );
    } finally {
      setCarregandoAmbientes(false);
    }
  }

  function abrirModalNovaColecao() {
    setFeedback("");
    setErroCriacao("");
    setErroAmbientes("");
    setColecaoEditando(null);
    setModalAberto(true);
    void carregarAmbientesDisponiveis();
  }

  async function abrirModalEdicao(colecaoResumo) {
    if (abrindoEdicao) return;
    setAbrindoEdicao(true);
    setFeedback("");
    setErroCriacao("");
    setErroAmbientes("");
    try {
      const [respostaColecao, respostaAmbientes] = await Promise.all([
        colecoesService.obterColecao(token, colecaoResumo.idColecao || colecaoResumo.id),
        ambienteService.listarAmbientes(token),
      ]);
      const disponiveis = Array.isArray(respostaAmbientes?.ambientes)
        ? respostaAmbientes.ambientes
        : [];
      const idsPermitidos = new Set(disponiveis.map((ambiente) => ambiente.idAmbienteSonoro || ambiente.id));
      const detalhes = respostaColecao.colecao;
      const associacoesLegadas = (detalhes.ambientes ?? []).filter(
        (ambiente) => !idsPermitidos.has(ambiente.idAmbienteSonoro),
      );
      setAmbientesDisponiveis(disponiveis);
      setColecaoEditando({ ...detalhes, associacoesLegadas });
      setModalAberto(true);
    } catch (falha) {
      setFeedback(
        falha?.mensagem || falha?.message || "Não foi possível carregar a coleção para edição.",
      );
    } finally {
      setAbrindoEdicao(false);
    }
  }

  async function handleConfirmarExclusao() {
    if (!colecaoParaExcluir || excluindo) return;
    setExcluindo(true);
    setErroExclusao("");
    try {
      await colecoesService.excluirColecao(token, colecaoParaExcluir.idColecao || colecaoParaExcluir.id);
      setColecoes((atuais) => atuais.filter((colecao) =>
        (colecao.idColecao || colecao.id) !== (colecaoParaExcluir.idColecao || colecaoParaExcluir.id)));
      setFeedback(`A coleção “${colecaoParaExcluir.nome || colecaoParaExcluir.name}” foi excluída com sucesso.`);
      setColecaoParaExcluir(null);
    } catch (falha) {
      setErroExclusao(falha?.message || "Não foi possível excluir a coleção. Tente novamente.");
    } finally {
      setExcluindo(false);
    }
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

  async function handleSalvarColecao(dados) {
    if (salvando) return;
    setSalvando(true);
    setErroCriacao("");

    try {
      const payload = {
        nome: dados.nome,
        descricao: dados.descricao || null,
        idsAmbientesSonoros: dados.idsAmbientesSonoros,
      };
      if (colecaoEditando) {
        const resposta = await colecoesService.atualizarColecao(
          token,
          colecaoEditando.idColecao,
          payload,
        );
        const atualizada = resposta?.colecao;
        if (atualizada) {
          const atualizadaComImagem = {
            ...atualizada,
            imagem: atualizada.ambientes?.[0]?.imagem ?? null,
          };
          setColecoes((atuais) => atuais.map((colecao) =>
            (colecao.idColecao || colecao.id) === atualizadaComImagem.idColecao
              ? atualizadaComImagem
              : colecao,
          ));
        } else {
          setVersao((v) => v + 1);
        }
        setFeedback(`Coleção "${dados.nome}" atualizada com sucesso.`);
      } else {
        const resposta = await colecoesService.criarColecao(token, payload);
        const nova = resposta?.colecao;
        if (nova) {
          const novaComImagem = { ...nova, imagem: nova.ambientes?.[0]?.imagem ?? null };
          setColecoes((atuais) => [novaComImagem, ...atuais]);
        } else {
          setVersao((v) => v + 1);
        }
        setFeedback(`Coleção "${dados.nome}" criada com sucesso.`);
      }

      setPesquisa("");
      setOrdenacao("recentes");
      setModalAberto(false);
      setColecaoEditando(null);
    } catch (falha) {
      setErroCriacao(
          falha?.mensagem ||
          falha?.message ||
          `Não foi possível ${colecaoEditando ? "atualizar" : "criar"} a coleção. Verifique os dados e tente novamente.`,
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
          onClick={abrirModalNovaColecao}
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
                <ColecaoCard key={colecao.idColecao || colecao.id} colecao={colecao}
                  onEditar={() => void abrirModalEdicao(colecao)}
                  onExcluir={() => { setErroExclusao(""); setColecaoParaExcluir(colecao); }} />
              ))}
            </ul>
          ) : (
            <div className="mt-8">
              <EstadoVazio
                pesquisando={Boolean(pesquisa.trim())}
                onCriarColecao={abrirModalNovaColecao}
              />
            </div>
          )}
        </>
      )}

      {/* =====================================================
          MODAL DE CRIAÇÃO
      ===================================================== */}

      {abrindoEdicao && (
        <p role="status" className="mt-5 text-sm text-fg-2">
          Carregando a coleção para edição...
        </p>
      )}

      {modalAberto && (
        <ModalColecaoForm
          key={colecaoEditando?.idColecao ?? "nova-colecao"}
          titulo={colecaoEditando ? "Editar coleção" : "Nova coleção"}
          textoAuxiliar={colecaoEditando
            ? "Atualize os dados e a ordem de reprodução dos ambientes."
            : "Reúna seus ambientes em uma ordem de reprodução."}
          aviso={colecaoEditando
            ? colecaoEditando.associacoesLegadas?.length
              ? `${colecaoEditando.associacoesLegadas.length} associação(ões) antiga(s) com ambientes da plataforma será(ão) preservada(s) após os ambientes permitidos. Para removê-la(s), use o menu do ambiente nos detalhes da coleção.`
              : undefined
            : "Adicionar ambientes agora não é obrigatório. A coleção pode começar vazia e você adiciona ambientes depois."}
          valoresIniciais={colecaoEditando ?? undefined}
          ambientesDisponiveis={ambientesDisponiveis}
          idsAmbientesSelecionadosIniciais={colecaoEditando
            ? colecaoEditando.ambientes
              .filter((ambiente) => ambientesDisponiveis.some(
                (disponivel) => (disponivel.idAmbienteSonoro || disponivel.id) === ambiente.idAmbienteSonoro,
              ))
              .map((ambiente) => ambiente.idAmbienteSonoro)
            : []}
          carregandoAmbientes={carregandoAmbientes}
          erroAmbientes={erroAmbientes}
          onTentarCarregarAmbientes={carregarAmbientesDisponiveis}
          onFechar={() => {
            if (!salvando) {
              setModalAberto(false);
              setErroCriacao("");
              setColecaoEditando(null);
            }
          }}
          onSalvar={handleSalvarColecao}
          salvando={salvando}
          erroApi={erroCriacao}
          textoBotao={colecaoEditando ? "Salvar alterações" : "Criar coleção"}
          textoSalvando={colecaoEditando ? "Salvando..." : "Criando..."}
          IconeAcao={colecaoEditando ? Save : Plus}
        />
      )}
      {colecaoParaExcluir && <ModalConfirmarExclusao
        item={{ ...colecaoParaExcluir, nome: colecaoParaExcluir.nome || colecaoParaExcluir.name }}
        tipo="coleção"
        descricao="será removida da sua conta. Os ambientes vinculados continuarão disponíveis. Essa ação não pode ser desfeita."
        excluindo={excluindo}
        erro={erroExclusao}
        onConfirmar={handleConfirmarExclusao}
        onCancelar={() => { if (!excluindo) setColecaoParaExcluir(null); }}
      />}
    </main>
  );
}
