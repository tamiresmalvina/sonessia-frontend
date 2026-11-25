import { Link } from "react-router-dom";
import { GripVertical, Play, Trash2 } from "lucide-react";

/**
 * Item de ambiente dentro de uma coleção.
 */
export default function ColecaoAmbienteItem({
  ambiente,
  posicao,
  totalAmbientes,
  onReordenar,
  onRemover,
  onReproduzir,
}) {
  function lidarComTeclado(evento) {
    if (evento.key === "ArrowUp") {
      evento.preventDefault();
      onReordenar(-1);
    }

    if (evento.key === "ArrowDown") {
      evento.preventDefault();
      onReordenar(1);
    }
  }

  return (
    <li className="relative flex items-center gap-3 bg-bg py-3 sm:gap-4">
      {/* Alça de ordenação */}
      <button
        type="button"
        aria-label={`Reordenar ${ambiente.nome}. Posição ${posicao} de ${totalAmbientes}. Use as setas para cima e para baixo.`}
        title="Use as setas do teclado para reordenar"
        onKeyDown={lidarComTeclado}
        className="grid size-10 shrink-0 place-items-center rounded-md text-icon-muted transition-colors hover:bg-surface-hover hover:text-icon focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <GripVertical size={18} strokeWidth={1.6} />
      </button>

      {/* Número da posição */}
      <span
        aria-hidden="true"
        className="w-5 shrink-0 text-center font-mono text-[11px] tabular-nums text-fg-3"
      >
        {posicao}
      </span>

      {/* Imagem */}
      <span
        aria-hidden="true"
        className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-line-subtle bg-bg-2"
      >
        {ambiente.imagem && (
          <img
            src={ambiente.imagem}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        )}
      </span>

      {/* Informações */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">
          <Link
            to={`/ambientes/${ambiente.id}`}
            className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            {ambiente.nome}
          </Link>
        </p>

        <p className="mt-1 truncate text-[13px] text-fg-3">{ambiente.sons}</p>
      </div>

      {/* Reproduzir ambiente */}
      <button
        type="button"
        onClick={onReproduzir}
        aria-label={`Reproduzir ${ambiente.nome}`}
        title={`Reproduzir ${ambiente.nome}`}
        className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-accent transition-colors hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <Play size={15} fill="currentColor" strokeWidth={0} />
      </button>

      {/* Remover da coleção */}
      <button
        type="button"
        onClick={onRemover}
        aria-label={`Remover ${ambiente.nome} da coleção`}
        title="Remover da coleção"
        className="grid size-10 shrink-0 place-items-center rounded-full text-icon-2 transition-colors hover:bg-surface-hover hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <Trash2 size={17} strokeWidth={1.6} />
      </button>
    </li>
  );
}
