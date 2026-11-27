import { useEffect } from "react";
import { X } from "lucide-react";

export default function ModalConfirmarExclusao({ item, tipo, descricao, onConfirmar, onCancelar, excluindo, erro }) {
  useEffect(() => {
    const tecla = (event) => { if (event.key === "Escape" && !excluindo) onCancelar(); };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [excluindo, onCancelar]);
  if (!item) return null;
  return <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#141216]/50 animate-fade-in"
    onClick={(event) => { if (!excluindo && event.target === event.currentTarget) onCancelar(); }} role="dialog" aria-modal="true" aria-labelledby="modal-excluir-titulo">
    <div className="relative w-full max-w-[440px] rounded-2xl border border-line-subtle bg-surface shadow-2xl overflow-hidden animate-scale-in">
      <div className="p-6 pb-5"><div className="flex items-center justify-between">
        <h2 id="modal-excluir-titulo" className="text-xl font-medium tracking-tight text-fg">Excluir {tipo}?</h2>
        <button type="button" onClick={onCancelar} disabled={excluindo} aria-label="Fechar" className="grid size-8 place-items-center rounded-lg text-icon-muted transition-colors hover:bg-surface-hover hover:text-fg outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"><X size={18} strokeWidth={1.8} /></button>
      </div><p className="mt-4 text-sm leading-relaxed text-fg-2">“{item.nome}” {descricao}</p>
      {erro && <p className="mt-3 text-xs text-danger">{erro}</p>}</div>
      <div className="border-t border-line-subtle" />
      <div className="flex items-center justify-end gap-3 px-6 py-4 bg-surface">
        <button type="button" onClick={onCancelar} disabled={excluindo} className="h-10 rounded-xl border border-line bg-surface px-5 text-sm font-medium text-fg transition-colors hover:bg-surface-hover outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50">Cancelar</button>
        <button type="button" onClick={onConfirmar} disabled={excluindo} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#a23838] px-5 text-sm font-medium text-white transition-colors hover:bg-[#8e2f2f] active:bg-[#7d2828] outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60">{excluindo ? "Excluindo…" : `Excluir ${tipo}`}</button>
      </div>
    </div>
  </div>;
}
