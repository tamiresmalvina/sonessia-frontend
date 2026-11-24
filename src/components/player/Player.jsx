import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react";
import { TimerControl } from "../timer/timer";
import { statusLabel, useSessionTimer } from "../timer/useSessionTimer.js";

function Equalizador() {
  return (
    <span className="eq flex h-4 items-end gap-[3px]" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export default function Player({
  tocando,
  volumeGeral,
  sonsAtivos,
  erroReproducao,
  onReproduzirPausar,
  onVolumeGeral,
}) {
  const [volumeAberto, setVolumeAberto] = useState(false);
  const volumeRef = useRef(null);

  const finalizar = useCallback(() => {
    if (tocando) void onReproduzirPausar();
  }, [onReproduzirPausar, tocando]);
  const timer = useSessionTimer(tocando, finalizar);

  const somMutado = volumeGeral === 0;

  useEffect(() => {
    function fecharAoClicarFora(evento) {
      if (volumeRef.current && !volumeRef.current.contains(evento.target)) {
        setVolumeAberto(false);
      }
    }

    function fecharComEscape(evento) {
      if (evento.key === "Escape") {
        setVolumeAberto(false);
      }
    }

    document.addEventListener("mousedown", fecharAoClicarFora);
    document.addEventListener("keydown", fecharComEscape);

    return () => {
      document.removeEventListener("mousedown", fecharAoClicarFora);
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, []);

  if (sonsAtivos === 0) return null;

  return (
    <section
      aria-label="Player de ambiente sonoro"
      className="relative z-20 mx-auto mt-12 flex w-full flex-col items-center"
    >
      <div className="flex items-center gap-4 rounded-[21px] border border-line-subtle bg-surface px-4 py-2.5 shadow-[0_2px_8px_rgba(35,25,70,0.07)]">
        <TimerControl timer={timer} />

        <button
          type="button"
          onClick={() => void onReproduzirPausar()}
          aria-label={tocando ? "Pausar reprodução" : "Iniciar reprodução"}
          className="play grid size-[66px] shrink-0 place-items-center rounded-full text-white transition-transform hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
        >
          {tocando ? (
            <Pause size={23} fill="currentColor" strokeWidth={0} />
          ) : (
            <Play
              size={23}
              fill="currentColor"
              strokeWidth={0}
              className="translate-x-0.5"
            />
          )}
        </button>

        <div className="relative" ref={volumeRef}>
          <button
            type="button"
            onClick={() => setVolumeAberto((atual) => !atual)}
            aria-label="Controle de volume"
            aria-expanded={volumeAberto}
            className={`grid size-12 place-items-center rounded-xl transition-colors ${
              volumeAberto
                ? "bg-accent-soft text-accent"
                : "text-fg-2 hover:bg-surface-hover"
            }`}
          >
            {somMutado ? (
              <VolumeX size={19} strokeWidth={1.6} />
            ) : volumeGeral < 50 ? (
              <Volume1 size={19} strokeWidth={1.6} />
            ) : (
              <Volume2 size={19} strokeWidth={1.6} />
            )}
          </button>

          {volumeAberto && (
            <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[264px] rounded-xl border border-line bg-surface p-4 shadow-xl sm:right-[-90px] sm:w-[264px]">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-3">
                  Volume geral
                </span>

                <span className="font-mono text-xs tabular-nums text-fg">
                  {volumeGeral}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onVolumeGeral(somMutado ? 100 : 0)}
                  aria-label={somMutado ? "Ativar volume" : "Silenciar"}
                  className="text-fg-2"
                >
                  {somMutado ? <VolumeX size={17} /> : <Volume2 size={17} />}
                </button>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volumeGeral}
                  onChange={(evento) => onVolumeGeral(Number(evento.target.value))}
                  aria-label="Volume geral"
                  className="vol"
                  style={{ "--v": `${volumeGeral}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex min-h-5 items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-3">
        {tocando && <Equalizador />}

        <span>{tocando ? "Reproduzindo" : "Pausado"}</span>

        <span aria-hidden="true">·</span>

        <span>
          {sonsAtivos} {sonsAtivos === 1 ? "som" : "sons"}
        </span>
      </div>

      {erroReproducao && (
        <p className="mt-2 max-w-md text-center text-xs text-rose-700 dark:text-rose-300" role="alert">
          {erroReproducao}
        </p>
      )}

      {timer.session && (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
          {statusLabel(timer.session)}
        </p>
      )}
    </section>
  );
}
