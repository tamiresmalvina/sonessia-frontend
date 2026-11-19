export default function FiltroCategorias({
  categorias,
  selecionada,
  onSelecionar,
  rotulo,
}) {
  return (
    <div className="-mx-5 mt-10 flex overflow-x-auto px-5 pb-1 sm:justify-center">
      <div
        role="group"
        aria-label={rotulo}
        className="flex shrink-0 gap-0.5 rounded-[10px] border border-line-subtle bg-bg-2 p-1"
      >
        {categorias.map((categoria) => {
          const ativa = categoria === selecionada;

          return (
            <button
              key={categoria}
              type="button"
              aria-pressed={ativa}
              onClick={() => onSelecionar(categoria)}
              className={`h-9 shrink-0 rounded-[7px] px-4 text-[13px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
                ativa
                  ? "lift bg-accent font-medium text-on-accent hover:bg-accent-hover"
                  : "text-fg-2 hover:bg-surface-hover hover:text-fg"
              }`}
            >
              {categoria}
            </button>
          );
        })}
      </div>
    </div>
  );
}
