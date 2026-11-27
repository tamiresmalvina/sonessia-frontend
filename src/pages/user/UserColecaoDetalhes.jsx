import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Play, Plus, RotateCw, X } from "lucide-react";

import { useAuth } from "../../contexts/useAuth.js";
import { colecoesService } from "../../services/colecoes.service.js";
import { ambienteService } from "../../services/sons.service.js";
import ColecaoAmbienteItem from "../../components/user/ColecaoAmbienteItem";
import ModalAdicionarAmbiente from "../../components/user/ModalAdicionarAmbiente";

/* =========================================================================
 * Sub-componentes de estado
 * ======================================================================= */

function EstadoVazio({ onAdicionarAmbientes }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl border border-line-subtle bg-surface">
        <Plus size={22} className="text-icon-muted" />
      </div>

      <h2 className="text-base font-medium text-fg">Sua coleção está vazia</h2>

      <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-2">
        Adicione ambientes sonoros para criar sua sequência personalizada.
      </p>

      {onAdicionarAmbientes && (
        <button
          type="button"
          onClick={onAdicionarAmbientes}
          className="user-button user-button-secondary user-button-md mt-5"
        >
          <Plus size={16} strokeWidth={1.8} />
          Adicionar ambientes
        </button>
      )}
    </div>
  );
}

function EstadoErro({ mensagem, onTentarNovamente }) {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 pt-8 pb-28 outline-none md:px-10 md:pt-14 md:pb-20">
      <Link
        to="/comum/colecoes"
        className="-ml-2 inline-flex h-10 items-center gap-2 rounded-md px-2 text-sm text-fg-2 transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <ArrowLeft size={16} strokeWidth={1.6} />
        Coleções
      </Link>

      <div
        role="alert"
        className="mt-10 flex flex-col items-center rounded-xl border border-line-subtle bg-danger-soft px-6 py-16 text-center"
      >
        <h2 className="text-xl font-medium tracking-[-0.02em]">
          {mensagem ?? "Não foi possível carregar a coleção"}
        </h2>
        <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-fg-2">
          Houve um problema de conexão. Seus dados estão seguros — tente
          novamente em instantes.
        </p>
        {onTentarNovamente && (
          <button
            type="button"
            onClick={onTentarNovamente}
            className="user-button user-button-secondary user-button-md mt-7"
          >
            <RotateCw size={15} strokeWidth={1.8} />
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}

function EstadoNaoEncontrado() {
  return (
    <main className="mx-auto w-full max-w-[1120px] px-5 pt-8 md:px-10 md:pt-14">
      <Link
        to="/comum/colecoes"
        className="inline-flex items-center gap-2 rounded-md text-sm text-fg-2 transition-colors hover:text-fg"
      >
        <ArrowLeft size={16} />
        Voltar para coleções
      </Link>

      <div className="py-20 text-center">
        <h1 className="text-2xl font-light text-fg">Coleção não encontrada</h1>
        <p className="mt-3 text-sm text-fg-2">
          Essa coleção não existe ou não está disponível para você.
        </p>
      </div>
    </main>
  );
}

function SkeletonDetalhes() {
  return (
    <main className="mx-auto w-full max-w-[1120px] animate-pulse px-5 pt-8 pb-28 outline-none md:px-10 md:pt-14 md:pb-20">
      <div className="h-5 w-24 rounded-md bg-surface-hover" />

      <header className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end">
        <span className="grid size-32 shrink-0 place-items-center overflow-hidden rounded-xl border border-line-subtle bg-surface-hover" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-3 w-28 rounded bg-surface-hover" />
          <div className="h-10 w-72 rounded bg-surface-hover" />
          <div className="h-4 w-56 rounded bg-surface-hover" />
        </div>
      </header>

      <section className="mt-12 space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-line-subtle py-3"
          >
            <div className="size-10 rounded-md bg-surface-hover" />
            <div className="size-14 rounded-xl bg-surface-hover" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-surface-hover" />
              <div className="h-3 w-28 rounded bg-surface-hover" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

/* =========================================================================
 * Função auxiliar: monta a string de sons do ambiente
 * Reutiliza os dados retornados pela API (audios[].titulo)
 * ======================================================================= */
function montarSons(audios) {
  if (!Array.isArray(audios) || audios.length === 0) return "";
  return audios
    .map((a) => a.titulo || a.audio?.titulo)
    .filter(Boolean)
    .join(" · ");
}

/* =========================================================================
 * Componente principal
 * ======================================================================= */
export default function UserColecaoDetalhes() {
  const { idColecao } = useParams();
  const navegar = useNavigate();
  const { token } = useAuth();

  const [estado, setEstado] = useState({
    colecao: null,
    carregando: true,
    erro: null,
    naoEncontrada: false,
  });
  const [tentativa, setTentativa] = useState(0);

  // Estados da funcionalidade de adicionar ambientes
  const [modalAdicionarAberto, setModalAdicionarAberto] = useState(false);
  const [ambientesDisponiveis, setAmbientesDisponiveis] = useState([]);
  const [carregandoAmbientes, setCarregandoAmbientes] = useState(false);
  const [salvandoAmbientes, setSalvandoAmbientes] = useState(false);
  const [modalErro, setModalErro] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [erroOperacao, setErroOperacao] = useState(null);
  const alteracaoPendente = useRef(false);
  const [indiceArrastado, setIndiceArrastado] = useState(null);

  function carregarColecao() {
    setTentativa((t) => t + 1);
  }

  useEffect(() => {
    if (!idColecao) return;

    let cancelado = false;

    colecoesService
      .obterColecao(token, idColecao)
      .then((dados) => {
        if (cancelado) return;
        setEstado({
          colecao: dados.colecao,
          carregando: false,
          erro: null,
          naoEncontrada: false,
        });
      })
      .catch((e) => {
        if (cancelado) return;
        const status = e?.status ?? 0;
        setEstado({
          colecao: null,
          carregando: false,
          erro: status === 404 || status === 400 ? null : (e?.message ?? null),
          naoEncontrada: status === 404 || status === 400,
        });
      });

    return () => {
      cancelado = true;
    };
    // tentativa é o gatilho intencional de retry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idColecao, tentativa]);

  /* -----------------------------------------------------------------------
   * Estados de carregamento / erro / não encontrado
   * --------------------------------------------------------------------- */
  const { colecao, carregando, erro, naoEncontrada } = estado;

  if (carregando) {
    return <SkeletonDetalhes />;
  }

  if (naoEncontrada) {
    return <EstadoNaoEncontrado />;
  }

  if (erro || !colecao) {
    return (
      <EstadoErro
        mensagem={erro}
        onTentarNovamente={carregarColecao}
      />
    );
  }

  /* -----------------------------------------------------------------------
   * Dados reais da coleção
   * --------------------------------------------------------------------- */
  const ambientes = colecao.ambientes ?? [];

  async function salvarOrdemAmbientes(novaOrdem) {
    if (alteracaoPendente.current) return;
    alteracaoPendente.current = true;
    const ordemAnterior = ambientes;
    setEstado((anterior) => ({
      ...anterior,
      colecao: { ...anterior.colecao, ambientes: novaOrdem },
    }));
    try {
      await colecoesService.reordenarAmbientes(
        token,
        idColecao,
        novaOrdem.map((ambiente) => ambiente.idAmbienteSonoro),
      );
    } catch (erro) {
      setEstado((anterior) => ({
        ...anterior,
        colecao: { ...anterior.colecao, ambientes: ordemAnterior },
      }));
      setErroOperacao(erro?.message || "Não foi possível salvar a ordem dos ambientes.");
    } finally {
      alteracaoPendente.current = false;
    }
  }

  function moverAmbiente(indiceOrigem, deslocamento) {
    const indiceDestino = indiceOrigem + deslocamento;
    if (indiceDestino < 0 || indiceDestino >= ambientes.length) return;
    const novaOrdem = [...ambientes];
    [novaOrdem[indiceOrigem], novaOrdem[indiceDestino]] = [
      novaOrdem[indiceDestino],
      novaOrdem[indiceOrigem],
    ];
    void salvarOrdemAmbientes(novaOrdem);
  }

  async function removerAmbiente(idAmbienteSonoro) {
    if (alteracaoPendente.current) return;
    alteracaoPendente.current = true;
    const ordemAnterior = ambientes;
    setEstado((anterior) => ({
      ...anterior,
      colecao: {
        ...anterior.colecao,
        ambientes: anterior.colecao.ambientes.filter(
          (ambiente) => ambiente.idAmbienteSonoro !== idAmbienteSonoro,
        ),
      },
    }));
    try {
      await colecoesService.removerAmbiente(token, idColecao, idAmbienteSonoro);
      setFeedback("Ambiente removido da coleção.");
    } catch (erro) {
      setEstado((anterior) => ({
        ...anterior,
        colecao: { ...anterior.colecao, ambientes: ordemAnterior },
      }));
      setErroOperacao(erro?.message || "Não foi possível remover o ambiente da coleção.");
    } finally {
      alteracaoPendente.current = false;
    }
  }

  function soltarAmbiente(indiceDestino) {
    if (indiceArrastado === null || indiceArrastado === indiceDestino) return;
    const novaOrdem = [...ambientes];
    const [ambienteMovido] = novaOrdem.splice(indiceArrastado, 1);
    novaOrdem.splice(indiceDestino, 0, ambienteMovido);
    setIndiceArrastado(null);
    void salvarOrdemAmbientes(novaOrdem);
  }

  /**
   * Abre o modal de adição e busca ambientes personalizados do usuário
   */
  function abrirModalAdicionar() {
    setModalErro(null);
    setModalAdicionarAberto(true);
    setCarregandoAmbientes(true);

    ambienteService
      .listarAmbientes(token)
      .then((res) => {
        const lista = res?.ambientes || [];
        // Conforme regras do backend:
        // Apenas ambientes com origem personalizada pertencentes ao usuário podem ser associados
        const personalizados = lista.filter(
          (a) =>
            a.origem === "personalizado" ||
            a.origem === "PERSONALIZADO" ||
            !a.origem,
        );
        setAmbientesDisponiveis(personalizados);
        setCarregandoAmbientes(false);
      })
      .catch((err) => {
        setCarregandoAmbientes(false);
        setModalErro(
          err?.message || "Não foi possível carregar os ambientes disponíveis.",
        );
      });
  }

  /**
   * Adiciona múltiplos ambientes à coleção com tratamento de falhas parciais
   */
  async function handleAdicionarAmbientes(idsSelecionados) {
    if (
      !idsSelecionados ||
      idsSelecionados.length === 0 ||
      salvandoAmbientes
    ) {
      return;
    }

    setSalvandoAmbientes(true);
    setModalErro(null);

    const sucessos = [];
    const falhas = [];

    // O backend adiciona um ambiente por requisição
    for (const idAmbiente of idsSelecionados) {
      try {
        await colecoesService.adicionarAmbiente(token, idColecao, idAmbiente);
        sucessos.push(idAmbiente);
      } catch (err) {
        const amb = ambientesDisponiveis.find(
          (a) => (a.idAmbienteSonoro || a.id) === idAmbiente,
        );
        const nome = amb?.nome || "Ambiente";
        falhas.push({
          id: idAmbiente,
          nome,
          mensagem: err?.message || "Erro ao adicionar à coleção.",
        });
      }
    }

    // Se houve algum sucesso, atualiza os dados da coleção a partir do backend
    if (sucessos.length > 0) {
      try {
        const dadosAtualizados = await colecoesService.obterColecao(
          token,
          idColecao,
        );
        setEstado((prev) => ({
          ...prev,
          colecao: dadosAtualizados.colecao,
        }));
      } catch {
        // Se a releitura falhar, mantemos o estado prévio
      }
    }

    setSalvandoAmbientes(false);

    if (falhas.length === 0) {
      // Sucesso total
      setModalAdicionarAberto(false);
      setFeedback(
        `${sucessos.length} ${sucessos.length === 1 ? "ambiente adicionado" : "ambientes adicionados"} com sucesso à coleção.`,
      );
    } else if (sucessos.length > 0) {
      // Falha parcial: modal permanece aberto para retry das falhas
      const detalheFalhas = falhas
        .map((f) => `"${f.nome}": ${f.mensagem}`)
        .join("; ");
      setModalErro(
        `${sucessos.length} ambiente(s) adicionado(s) com sucesso. Porém, ${falhas.length} não pôde(ram) ser incluído(s): ${detalheFalhas}`,
      );
    } else {
      // Falha total: modal permanece aberto com as seleções preservadas
      const detalheFalhas = falhas
        .map((f) => `"${f.nome}": ${f.mensagem}`)
        .join("; ");
      setModalErro(`Não foi possível adicionar os ambientes: ${detalheFalhas}`);
    }
  }

  /**
   * Inicia a reprodução do primeiro ambiente da coleção.
   * Navega para a rota existente do Player.
   */
  function reproduzirColecao() {
    if (ambientes.length === 0) return;
    navegar(`/ambientes/${ambientes[0].idAmbienteSonoro}`);
  }

  /**
   * Navega para o Player de um ambiente específico.
   */
  function reproduzirAmbiente(idAmbienteSonoro) {
    navegar(`/ambientes/${idAmbienteSonoro}`);
  }

  /* -----------------------------------------------------------------------
   * Layout principal da coleção
   * --------------------------------------------------------------------- */
  return (
    <>
      <main
        id="conteudo"
        tabIndex="-1"
        className="mx-auto w-full max-w-[1120px] px-5 pt-8 pb-28 outline-none md:px-10 md:pt-14 md:pb-20"
      >
        {/* Voltar para coleções */}
        <Link
          to="/comum/colecoes"
          className="-ml-2 inline-flex h-10 items-center gap-2 rounded-md px-2 text-sm text-fg-2 transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <ArrowLeft size={16} strokeWidth={1.6} />
          Coleções
        </Link>

        {/* Feedback de sucesso */}
        {feedback && (
          <div
            role="status"
            className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-line-subtle bg-success-soft px-4 py-3 text-sm text-success"
          >
            <span>{feedback}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="rounded text-success hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              aria-label="Fechar aviso"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {erroOperacao && (
          <div role="alert" className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
            <span>{erroOperacao}</span>
            <button
              type="button"
              onClick={() => setErroOperacao(null)}
              className="rounded hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              aria-label="Fechar aviso de erro"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Cabeçalho da coleção */}
        <header className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end">
          <span
            className="grid size-32 shrink-0 place-items-center overflow-hidden rounded-xl border border-line-subtle bg-bg-2"
          >
            {ambientes[0]?.imagem && (
              <img src={ambientes[0].imagem} alt="" className="size-full object-cover" />
            )}
          </span>

          {/* Informações */}
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
              Coleção · {ambientes.length}{" "}
              {ambientes.length === 1 ? "ambiente" : "ambientes"}
            </p>

            <h1 className="mt-3 text-[40px] font-light leading-[1.02] tracking-[-0.045em] text-fg md:text-[52px]">
              {colecao.nome}
            </h1>

            {colecao.descricao && (
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-fg-2">
                {colecao.descricao}
              </p>
            )}
          </div>

          {/* Ações */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tocar coleção */}
            <button
              type="button"
              onClick={reproduzirColecao}
              disabled={ambientes.length === 0}
              className="
                user-button user-button-primary user-button-md lift
                disabled:bg-surface-active
                disabled:text-fg-disabled
                disabled:shadow-none
                disabled:opacity-100
              "
            >
              <Play size={16} strokeWidth={1.8} fill="currentColor" />
              Tocar coleção
            </button>

            {/* Adicionar ambientes */}
            <button
              type="button"
              onClick={abrirModalAdicionar}
              className="user-button user-button-secondary user-button-md"
            >
              <Plus size={16} strokeWidth={1.8} />
              Adicionar ambientes
            </button>
          </div>
        </header>

        {/* Lista de ambientes */}
        <section aria-label="Ambientes da coleção" className="mt-12">
          {ambientes.length > 0 ? (
            <>
              {/* Instruções */}
              <p className="mb-4 flex items-center gap-2 text-[13px] text-fg-3">
                <span aria-hidden="true" className="text-lg leading-none">
                  ⠿
                </span>
                Arraste pela alça para mudar a ordem de reprodução. Pelo teclado, use as setas na alça.
              </p>

              <ol className="divide-y divide-line-subtle border-y border-line-subtle">
                {ambientes.map((ambiente, indice) => (
                  <ColecaoAmbienteItem
                    key={ambiente.idAmbienteSonoro}
                    ambiente={{
                      id: ambiente.idAmbienteSonoro,
                      nome: ambiente.nome,
                      imagem: ambiente.imagem ?? null,
                      sons: montarSons(ambiente.audios),
                    }}
                    posicao={indice + 1}
                    totalAmbientes={ambientes.length}
                    onReordenar={(deslocamento) => moverAmbiente(indice, deslocamento)}
                    onRemover={() => removerAmbiente(ambiente.idAmbienteSonoro)}
                    onReproduzir={() =>
                      reproduzirAmbiente(ambiente.idAmbienteSonoro)
                    }
                    onArrastarInicio={setIndiceArrastado}
                    onSoltar={soltarAmbiente}
                    onArrastarFim={() => setIndiceArrastado(null)}
                    aoMoverParaCima={() => moverAmbiente(indice, -1)}
                    aoMoverParaBaixo={() => moverAmbiente(indice, 1)}
                    podeMoverParaCima={indice > 0}
                    podeMoverParaBaixo={indice < ambientes.length - 1}
                  />
                ))}
              </ol>

              {/* Orientação */}
              <p className="mt-5 max-w-lg text-[13px] leading-relaxed text-fg-3">
                "Tocar coleção" começa pelo primeiro ambiente. Use os botões de
                anterior e próximo no player para seguir a ordem. Remover um
                ambiente da coleção não o exclui.
              </p>
            </>
          ) : (
            <EstadoVazio onAdicionarAmbientes={abrirModalAdicionar} />
          )}
        </section>
      </main>

      {/* Modal de adição */}
      {modalAdicionarAberto && (
        <ModalAdicionarAmbiente
          ambientesDisponiveis={ambientesDisponiveis}
          ambientesDaColecao={ambientes}
          nomeColecao={colecao.nome}
          onFechar={() => {
            if (!salvandoAmbientes) {
              setModalAdicionarAberto(false);
              setModalErro(null);
            }
          }}
          onAdicionar={handleAdicionarAmbientes}
          salvando={salvandoAmbientes}
          carregando={carregandoAmbientes}
          erro={modalErro}
        />
      )}
    </>
  );
}
