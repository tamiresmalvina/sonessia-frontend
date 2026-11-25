import { useNavigate } from "react-router-dom";
import { Play, Pause, Maximize2, X, AudioLines } from "lucide-react";
import { usePlayer } from "../../contexts/usePlayer.js";

/**
 * Player compacto persistente para a área autenticada do usuário.
 * Reproduz fielmente as dimensões, layout e estilo do protótipo Figma Make.
 */
export default function PlayerCompacto() {
  const navigate = useNavigate();
  const {
    ambienteAtual,
    tocando,
    reproduzirPausar,
    encerrarReproducao,
  } = usePlayer();

  if (!ambienteAtual) return null;

  function abrirPlayerCompleto() {
    navigate(`/player/${ambienteAtual.idAmbienteSonoro}`);
  }

  return (
    <div className="fixed bottom-5 left-4 right-4 z-40 lg:left-[280px] pointer-events-none">
      <section
        aria-label="Reproduzindo agora"
        className="lift pointer-events-auto mx-auto flex max-w-[640px] items-center gap-3 rounded-xl border border-line bg-surface p-2 shadow-lg transition-all"
      >
        <button
          type="button"
          onClick={abrirPlayerCompleto}
          aria-label={`Abrir player: ${ambienteAtual.nome}`}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {ambienteAtual.imagem ? (
            <img
              alt=""
              className="size-12 shrink-0 rounded-lg object-cover"
              src={ambienteAtual.imagem}
            />
          ) : (
            <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-bg-2 text-icon-muted">
              <AudioLines size={22} strokeWidth={1.4} aria-hidden="true" />
            </div>
          )}

          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-fg">
              {ambienteAtual.nome}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] mt-1 flex items-center gap-2 truncate text-fg-3">
              <span
                className="eq flex h-3 items-end gap-[2px] text-accent"
                aria-hidden="true"
              >
                <span
                  className="h-full w-[2px] rounded-full bg-current"
                  style={{ animationPlayState: tocando ? "running" : "paused" }}
                />
                <span
                  className="h-full w-[2px] rounded-full bg-current"
                  style={{ animationPlayState: tocando ? "running" : "paused" }}
                />
                <span
                  className="h-full w-[2px] rounded-full bg-current"
                  style={{ animationPlayState: tocando ? "running" : "paused" }}
                />
              </span>
              {tocando ? "Tocando" : "Pausado"}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => void reproduzirPausar()}
          aria-label={tocando ? "Pausar" : "Reproduzir"}
          aria-pressed={tocando}
          className="play grid size-11 shrink-0 place-items-center rounded-full text-white transition-[filter] duration-150 hover:brightness-110 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {tocando ? (
            <Pause size={18} fill="currentColor" strokeWidth={0} />
          ) : (
            <Play size={18} fill="currentColor" strokeWidth={0} className="translate-x-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={abrirPlayerCompleto}
          aria-label="Abrir player"
          title="Abrir player"
          className="grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg text-icon-2 hover:bg-surface-hover hover:text-fg hidden sm:grid"
        >
          <Maximize2 size={16} />
        </button>

        <button
          type="button"
          onClick={encerrarReproducao}
          aria-label="Encerrar reprodução"
          title="Encerrar reprodução"
          className="grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg text-icon-2 hover:bg-surface-hover hover:text-fg"
        >
          <X size={18} />
        </button>
      </section>
    </div>
  );
}
