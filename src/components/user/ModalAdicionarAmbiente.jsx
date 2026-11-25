import { useState } from "react";
import { Plus, X, Check, CircleAlert, AudioLines } from "lucide-react";

/**
 * Modal para selecionar ambientes que serão adicionados à coleção.
 */
export default function ModalAdicionarAmbiente({
  ambientesDisponiveis = [],
  ambientesDaColecao = [],
  onFechar,
  onAdicionar,
  nomeColecao,
  salvando = false,
  carregando = false,
  erro = null,
}) {
  const [selecoesUsuario, setSelecoesUsuario] = useState([]);

  // Identificadores de ambientes já presentes na coleção
  const idsColecao = new Set(
    ambientesDaColecao.map((a) =>
      typeof a === "string" ? a : a.idAmbienteSonoro || a.id,
    ),
  );

  // Evita oferecer ambientes que já fazem parte da coleção.
  const ambientesDisponiveisParaAdicionar = ambientesDisponiveis.filter(
    (ambiente) => {
      const id = ambiente.idAmbienteSonoro || ambiente.id;
      return id && !idsColecao.has(id);
    },
  );

  // Seleções ativas derivadas: mantém apenas itens que continuam disponíveis para adição
  const ambientesSelecionados = selecoesUsuario.filter((id) =>
    ambientesDisponiveisParaAdicionar.some(
      (a) => (a.idAmbienteSonoro || a.id) === id,
    ),
  );

  function alternarSelecao(idAmbiente) {
    if (salvando) return;

    setSelecoesUsuario((selecionados) => {
      const jaSelecionado = selecionados.includes(idAmbiente);

      if (jaSelecionado) {
        return selecionados.filter((id) => id !== idAmbiente);
      }

      return [...selecionados, idAmbiente];
    });
  }

  function confirmarAdicao() {
    if (ambientesSelecionados.length === 0 || salvando) return;
    onAdicionar(ambientesSelecionados);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => {
        if (!salvando) onFechar();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-adicionar"
        aria-describedby="descricao-modal-adicionar"
        className="lift relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-line bg-surface sm:max-w-[520px] sm:rounded-2xl"
        onClick={(evento) => evento.stopPropagation()}
      >
        {/* Cabeçalho */}
        <header className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
          <div className="min-w-0">
            <h2
              id="titulo-modal-adicionar"
              className="text-[22px] font-light leading-tight tracking-[-0.03em]"
            >
              Adicionar ambientes
            </h2>

            <p
              id="descricao-modal-adicionar"
              className="mt-2 text-sm leading-relaxed text-fg-2"
            >
              Escolha os ambientes que entram em “{nomeColecao}”. Eles são
              adicionados ao final, na ordem em que você os marcar.
            </p>
          </div>

          <button
            type="button"
            onClick={onFechar}
            disabled={salvando}
            aria-label="Fechar"
            title="Fechar"
            className="grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg text-icon-2 hover:bg-surface-hover hover:text-fg -mr-2 -mt-1 disabled:opacity-50"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </header>

        {/* Lista de ambientes */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          {erro && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2.5 rounded-lg border border-line-subtle bg-danger-soft p-3 text-xs leading-relaxed text-danger"
            >
              <CircleAlert size={16} className="mt-0.5 shrink-0" />
              <span className="flex-1">{erro}</span>
            </div>
          )}

          {carregando ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 size-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              <p className="text-sm text-fg-2">
                Carregando ambientes disponíveis...
              </p>
            </div>
          ) : ambientesDisponiveisParaAdicionar.length > 0 ? (
            <fieldset className="pt-1">
              <legend className="sr-only">Ambientes disponíveis</legend>

              <ul className="divide-y divide-line-subtle">
                {ambientesDisponiveisParaAdicionar.map((ambiente) => {
                  const id = ambiente.idAmbienteSonoro || ambiente.id;
                  const selecionado = ambientesSelecionados.includes(id);
                  const sonsFormatados =
                    ambiente.sons ||
                    (Array.isArray(ambiente.audios)
                      ? ambiente.audios
                          .map((a) => a.titulo || a.audio?.titulo)
                          .filter(Boolean)
                          .join(" · ")
                      : "");

                  return (
                    <li key={id}>
                      <label className="flex min-h-[72px] cursor-pointer items-center gap-3.5 py-2.5">
                        {/* Imagem */}
                        <span
                          aria-hidden="true"
                          className="grid shrink-0 place-items-center overflow-hidden rounded-xl border border-line-subtle bg-bg-2"
                          style={{ width: 52, height: 52 }}
                        >
                          {ambiente.imagem ? (
                            <img
                              src={ambiente.imagem}
                              alt=""
                              loading="lazy"
                              className="size-full object-cover"
                            />
                          ) : (
                            <AudioLines
                              size={20}
                              className="text-icon-muted"
                              strokeWidth={1.5}
                            />
                          )}
                        </span>

                        {/* Informações */}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {ambiente.nome}
                          </span>

                          <span className="mt-0.5 block truncate text-[13px] text-fg-3">
                            {sonsFormatados}
                          </span>
                        </span>

                        {/* Checkbox personalizado */}
                        <span className="relative grid size-[22px] shrink-0 place-items-center">
                          <input
                            type="checkbox"
                            checked={selecionado}
                            disabled={salvando}
                            onChange={() => alternarSelecao(id)}
                            className="peer size-[22px] cursor-pointer appearance-none rounded-[6px] border border-line-strong bg-surface checked:border-accent checked:bg-accent transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50"
                          />

                          <Check
                            size={14}
                            strokeWidth={2.8}
                            className="pointer-events-none absolute text-on-accent opacity-0 peer-checked:opacity-100"
                          />
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm text-fg-2">
                {ambientesDisponiveis.length === 0
                  ? "Você ainda não possui ambientes sonoros criados. Crie um ambiente personalizado para adicioná-lo à sua coleção."
                  : "Todos os ambientes disponíveis já estão nesta coleção."}
              </p>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <footer className="flex flex-col-reverse gap-2 border-t border-line-subtle px-6 py-4 sm:flex-row sm:justify-end [&>button]:max-sm:w-full">
          <button
            type="button"
            onClick={onFechar}
            disabled={salvando}
            className="user-button user-button-secondary user-button-md disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={confirmarAdicao}
            disabled={ambientesSelecionados.length === 0 || salvando}
            className="
              user-button user-button-primary user-button-md lift
              disabled:bg-surface-active
              disabled:text-fg-disabled
              disabled:shadow-none
              disabled:opacity-100
            "
          >
            <Plus size={16} strokeWidth={1.8} />
            {salvando
              ? "Adicionando..."
              : `Adicionar${ambientesSelecionados.length > 0 ? ` (${ambientesSelecionados.length})` : ""}`}
          </button>
        </footer>
      </section>
    </div>
  );
}
