import { Folder } from "lucide-react";

/**
 * Seção lateral de coleções do usuário.
 * Exibe a lista de coleções existentes ou estado vazio amigável quando nenhuma foi criada.
 *
 * @param {{ colecoes: Array }} props
 */
export default function ColecoesUsuario({ colecoes = [] }) {
  return (
    <section aria-labelledby="titulo-suas-colecoes" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="titulo-suas-colecoes" className="text-base sm:text-lg font-semibold tracking-tight text-fg">
          Suas coleções
        </h2>

        <span
          title="Gestão completa de coleções será disponibilizada na próxima etapa"
          className="text-xs font-medium text-fg-3 cursor-default"
        >
          Ver todas &rarr;
        </span>
      </div>

      {colecoes.length === 0 ? (
        <div className="rounded-2xl border border-line-subtle bg-surface p-5 text-center">
          <div className="mx-auto grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
            <Folder size={18} />
          </div>
          <h3 className="mt-2.5 text-xs font-semibold text-fg">
            Você ainda não possui coleções
          </h3>
          <p className="mt-1 text-[11px] leading-relaxed text-fg-3">
            Em breve você poderá organizar e agrupar seus ambientes favoritos em coleções
            personalizadas para cada momento do seu dia.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {colecoes.map((colecao) => {
            const qtd = typeof colecao.quantidadeAmbientes === "number"
              ? colecao.quantidadeAmbientes
              : Array.isArray(colecao.ambientes)
                ? colecao.ambientes.length
                : 0;

            return (
              <div
                key={colecao.idColecao}
                className="group flex items-center gap-3 rounded-2xl border border-line-subtle bg-surface p-2.5 transition-colors hover:bg-surface-hover"
              >
                {/* Miniatura da Coleção */}
                <div className="size-11 shrink-0 overflow-hidden rounded-xl border border-line-subtle bg-bg-2 grid place-items-center text-icon-muted">
                  <Folder size={20} strokeWidth={1.5} className="text-accent" />
                </div>

                {/* Nome e Quantidade de Ambientes */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-fg">
                    {colecao.nome}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-fg-3">
                    {qtd} {qtd === 1 ? "AMBIENTE" : "AMBIENTES"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
