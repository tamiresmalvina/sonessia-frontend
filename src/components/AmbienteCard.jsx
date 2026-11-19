import { Play } from "lucide-react";

export default function AmbienteCard({ ambiente }) {
  return (
    <li className="group">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line-subtle bg-bg-2">
        <img
          src={ambiente.imagem}
          alt={ambiente.descricaoImagem}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        <button
          type="button"
          disabled
          aria-label={`Reprodução de ${ambiente.nome} disponível em breve`}
          title="Reprodução disponível em breve"
          className="absolute bottom-3 right-3 grid size-10 cursor-not-allowed place-items-center rounded-full bg-[#F4F1FA] text-accent opacity-70 lift"
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
        {ambiente.categoria}
      </p>

      <p className="mt-2 text-[13px] text-fg-3">{ambiente.sons.join(" · ")}</p>
    </li>
  );
}
