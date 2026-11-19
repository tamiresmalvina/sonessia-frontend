export default function ControleVolume({ nome, valor, cor, onAlterar }) {
  const ativo = valor > 0;

  return (
    <div className="mt-2 flex w-full max-w-[180px] items-center gap-3">
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={valor}
        aria-label={`Volume de ${nome}`}
        aria-valuetext={`${valor}%`}
        onChange={(evento) => onAlterar(Number(evento.target.value))}
        className="vol"
        data-active={ativo}
        style={{
          "--v": `${valor}%`,
          "--fill": `linear-gradient(90deg, var(--blue), ${cor})`,
        }}
      />

      <output
        className={`w-8 text-right font-mono text-[10.5px] tabular-nums ${
          ativo ? "text-fg" : "text-fg-disabled"
        }`}
      >
        {valor}%
      </output>
    </div>
  );
}
