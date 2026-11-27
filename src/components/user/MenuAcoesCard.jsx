import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, MoreHorizontal, Pencil, Trash2, Unlink } from "lucide-react";

/** Menu de ações dos cards de ambientes e coleções. */
export default function MenuAcoesCard({
  nome, tipo, onEditar, onExcluir, compacto = false,
  onMoverParaCima, onMoverParaBaixo, onRemoverDaColecao,
  desabilitarMoverParaCima = false, desabilitarMoverParaBaixo = false,
}) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;
    const cliqueFora = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setAberto(false);
    };
    const tecla = (event) => {
      if (event.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", cliqueFora);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", cliqueFora);
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  return (
    <div className={compacto ? "relative z-20" : "absolute right-2 top-2 z-20"} ref={ref}>
      <button type="button" onClick={(event) => { event.stopPropagation(); setAberto((valor) => !valor); }}
        aria-label={`Mais ações para ${nome}`} title={`Mais ações para ${nome}`} aria-expanded={aberto}
        className={compacto
          ? "user-icon-button"
          : "grid size-10 shrink-0 place-items-center rounded-full bg-black/35 text-white transition-colors duration-200 hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg"}>
        <MoreHorizontal size={18} strokeWidth={1.6} aria-hidden="true" />
      </button>
      {aberto && <div role="menu" onClick={(event) => event.stopPropagation()} className="absolute top-11 right-0 z-40 min-w-[220px] rounded-2xl border border-line bg-surface p-1.5 shadow-lg">
        {onMoverParaCima && <button type="button" role="menuitem" disabled={desabilitarMoverParaCima} onClick={() => { setAberto(false); onMoverParaCima(); }}
          className="group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-normal text-fg transition-colors duration-150 hover:bg-[#F4F1FA] focus-visible:bg-[#F4F1FA] disabled:cursor-default disabled:text-fg-3 disabled:opacity-60 dark:hover:bg-surface-hover outline-none">
          <ArrowUp size={16} strokeWidth={1.6} className="shrink-0 text-fg-2 group-disabled:text-fg-3" /><span>Mover para cima</span>
        </button>}
        {onMoverParaBaixo && <button type="button" role="menuitem" disabled={desabilitarMoverParaBaixo} onClick={() => { setAberto(false); onMoverParaBaixo(); }}
          className="group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-normal text-fg transition-colors duration-150 hover:bg-[#F4F1FA] focus-visible:bg-[#F4F1FA] disabled:cursor-default disabled:text-fg-3 disabled:opacity-60 dark:hover:bg-surface-hover outline-none">
          <ArrowDown size={16} strokeWidth={1.6} className="shrink-0 text-fg-2 group-disabled:text-fg-3" /><span>Mover para baixo</span>
        </button>}
        {onRemoverDaColecao && <button type="button" role="menuitem" onClick={() => { setAberto(false); onRemoverDaColecao(); }}
          className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-normal text-[#a23838] transition-colors duration-150 hover:bg-[#fcf3f3] focus-visible:bg-[#fcf3f3] dark:text-[#f87171] dark:hover:bg-[#331c1e] outline-none">
          <Unlink size={16} strokeWidth={1.6} className="shrink-0" /><span>Remover da coleção</span>
        </button>}
        {onEditar && <button type="button" role="menuitem" onClick={() => { setAberto(false); onEditar(); }}
          className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-normal text-fg transition-colors duration-150 hover:bg-[#F4F1FA] focus-visible:bg-[#F4F1FA] dark:hover:bg-surface-hover outline-none">
          <Pencil size={16} strokeWidth={1.6} className="text-fg-2 shrink-0" /><span>Editar {tipo}</span>
        </button>}
        {onExcluir && <button type="button" role="menuitem" onClick={() => { setAberto(false); onExcluir(); }}
          className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-normal text-[#a23838] dark:text-[#f87171] transition-colors duration-150 hover:bg-[#fcf3f3] focus-visible:bg-[#fcf3f3] dark:hover:bg-[#331c1e] outline-none">
          <Trash2 size={16} strokeWidth={1.6} className="shrink-0 text-[#a23838] dark:text-[#f87171]" /><span>Excluir...</span>
        </button>}
      </div>}
    </div>
  );
}
