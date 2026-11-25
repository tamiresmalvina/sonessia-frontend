import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, Folder, Compass, ChevronRight } from "lucide-react";

/**
 * Seção de atalhos rápidos do dashboard do usuário comum.
 */
export default function AtalhosDashboard() {
  const navigate = useNavigate();

  const ATALHOS = [
    {
      id: "criar",
      titulo: "Criar ambiente",
      descricao: "Misture sons e ajuste cada volume",
      icone: SlidersHorizontal,
      acao: () => navigate("/?aba=sons"),
    },
    {
      id: "colecoes",
      titulo: "Organizar coleções",
      descricao: "Ordene seus ambientes em sequência",
      icone: Folder,
      acao: () => {
        // Notificação discreta ou ação futura
      },
      emBreve: true,
    },
    {
      id: "prontos",
      titulo: "Ambientes prontos",
      descricao: "Combinações da plataforma",
      icone: Compass,
      acao: () => navigate("/?aba=ambientes"),
    },
  ];

  return (
    <section aria-labelledby="titulo-atalhos" className="space-y-4">
      <h2 id="titulo-atalhos" className="text-base sm:text-lg font-semibold tracking-tight text-fg">
        Atalhos
      </h2>

      <div className="space-y-2">
        {ATALHOS.map((atalho) => {
          const Icone = atalho.icone;

          return (
            <button
              key={atalho.id}
              type="button"
              onClick={atalho.acao}
              title={atalho.emBreve ? "Funcionalidade prevista para a próxima etapa" : undefined}
              className={`group flex w-full items-center gap-3.5 rounded-2xl border border-line-subtle bg-surface p-3 text-left transition-all ${
                atalho.emBreve
                  ? "cursor-default opacity-85 hover:bg-surface"
                  : "hover:border-line hover:bg-surface-hover hover:shadow-xs"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus`}
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent transition-transform group-hover:scale-105">
                <Icone size={18} strokeWidth={1.8} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-fg">
                  {atalho.titulo}
                </p>
                <p className="truncate text-[11px] text-fg-3">
                  {atalho.descricao}
                </p>
              </div>

              <ChevronRight
                size={16}
                className="shrink-0 text-icon-muted transition-transform group-hover:translate-x-0.5"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
