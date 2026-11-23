import { AudioLines, Play } from "lucide-react";

export default function AmbienteCard({ ambiente, onReproduzir }) {
  const audios = Array.isArray(ambiente.audios) ? ambiente.audios : [];
  const titulosAudios = audios
    .map((audio) => audio.titulo)
    .filter((titulo) => typeof titulo === "string" && titulo.length > 0);

  return (
    <li className="group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line-subtle bg-bg-2">
        {ambiente.imagem ? (
          <img
            src={ambiente.imagem}
            alt={ambiente.descricao || `Imagem de ${ambiente.nome}`}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid size-full place-items-center text-icon-muted">
            <AudioLines size={42} strokeWidth={1.2} aria-hidden="true" />
          </div>
        )}

        <button
          type="button"
          disabled={audios.length === 0}
          onClick={() => onReproduzir(ambiente)}
          aria-label={`Reproduzir ambiente ${ambiente.nome}`}
          title={audios.length === 0 ? "Este ambiente não possui áudios" : undefined}
          className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-[#F4F1FA] text-accent lift disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play
            size={15}
            fill="currentColor"
            strokeWidth={0}
            className="translate-x-px"
            aria-hidden="true"
          />
        </button>
      </div>

      <h2 className="mt-4 text-[15px] font-medium tracking-[-0.01em] text-fg">
        {ambiente.nome}
      </h2>

      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
        {ambiente.categoria || ambiente.finalidade}
      </p>

      <p className="mt-2 text-[13px] text-fg-3">
        {ambiente.descricao ||
          (titulosAudios.length > 0
            ? titulosAudios.join(" · ")
            : "Nenhum áudio associado")}
      </p>
    </li>
  );
}
