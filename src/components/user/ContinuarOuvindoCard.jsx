import { useNavigate } from "react-router-dom";
import { Play, Pause, AudioLines, Compass } from "lucide-react";
import { usePlayer } from "../../contexts/usePlayer.js";

/**
 * Card horizontal em destaque "Continuar de onde parou".
 * Apresenta o ambiente sonoro em andamento ou um estado vazio discreto quando não houver histórico.
 *
 * @param {{ ambiente?: object | null }} props
 */
export default function ContinuarOuvindoCard({ ambiente }) {
  const navigate = useNavigate();
  const { tocarAmbiente, ambienteAtual, tocando, reproduzirPausar } = usePlayer();

  if (!ambiente) {
    return (
      <section
        aria-label="Continuar de onde parou"
        className="rounded-3xl border border-line-subtle bg-surface p-6 sm:p-8 transition-colors"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              Continuar de onde parou
            </span>
            <h2 className="text-xl sm:text-2xl font-light tracking-tight text-fg">
              Nenhum ambiente reproduzido recentemente
            </h2>
            <p className="text-sm leading-relaxed text-fg-3">
              Assim que você começar a ouvir um ambiente sonoro, ele aparecerá aqui para você
              retomar a reprodução com um clique.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/?aba=ambientes")}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-soft px-4 py-2.5 text-xs font-semibold text-accent transition-colors hover:bg-surface-hover hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus shrink-0"
          >
            <Compass size={15} />
            <span>Explorar ambientes prontos</span>
          </button>
        </div>
      </section>
    );
  }

  const audios = Array.isArray(ambiente.audios) ? ambiente.audios : [];
  const nomesSons = audios
    .map((item) => item.titulo || item.audio?.titulo)
    .filter(Boolean)
    .join(" · ");

  const estaTocando = ambienteAtual?.idAmbienteSonoro === ambiente.idAmbienteSonoro && tocando;

  function handlePlay() {
    if (ambienteAtual?.idAmbienteSonoro === ambiente.idAmbienteSonoro) {
      void reproduzirPausar();
    } else {
      void tocarAmbiente(ambiente);
    }
  }

  return (
    <section
      aria-label="Continuar de onde parou"
      className="overflow-hidden rounded-3xl border border-line-subtle bg-surface transition-colors"
    >
      <div className="flex flex-col md:flex-row">
        {/* Imagem de Capa do Ambiente */}
        <div className="relative h-56 md:h-auto md:w-[42%] lg:w-[45%] shrink-0 overflow-hidden bg-bg-2">
          {ambiente.imagem ? (
            <img
              src={ambiente.imagem}
              alt={ambiente.nome}
              className="size-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="grid size-full place-items-center text-icon-muted">
              <AudioLines size={44} strokeWidth={1.3} aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Informações e Ações do Ambiente */}
        <div className="flex flex-1 flex-col justify-center p-6 sm:p-8 lg:p-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Continuar de onde parou
          </p>

          <h2 className="mt-2 text-2xl font-normal tracking-[-0.02em] text-fg sm:text-3xl lg:text-4xl">
            {ambiente.nome}
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-fg-3 line-clamp-1">
            {nomesSons || ambiente.categoria || ambiente.finalidade || "Composição personalizada"}
          </p>

          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={handlePlay}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-all duration-200 hover:bg-accent-hover hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              {estaTocando ? (
                <Pause size={15} fill="currentColor" strokeWidth={0} />
              ) : (
                <Play size={15} fill="currentColor" strokeWidth={0} />
              )}
              <span>{estaTocando ? "Pausar" : "Reproduzir"}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/player/${ambiente.idAmbienteSonoro}`)}
              className="text-xs sm:text-sm font-medium text-fg-2 transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus rounded-md px-1 py-1"
            >
              Ver ambiente
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
