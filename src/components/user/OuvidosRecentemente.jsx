import { useNavigate } from "react-router-dom";
import { Play, Pause, AudioLines, Compass, MoreHorizontal } from "lucide-react";
import { usePlayer } from "../../contexts/usePlayer.js";

/**
 * Seção de ambientes ouvidos recentemente pelo usuário.
 * Apresenta cards em grade de 2 colunas com suporte a reprodução imediata.
 *
 * @param {{ ambientes: Array }} props
 */
export default function OuvidosRecentemente({ ambientes = [] }) {
  const navigate = useNavigate();
  const { tocarAmbiente, ambienteAtual, tocando, reproduzirPausar } = usePlayer();

  function handlePlay(ambiente) {
    if (ambienteAtual?.idAmbienteSonoro === ambiente.idAmbienteSonoro) {
      void reproduzirPausar();
    } else {
      void tocarAmbiente(ambiente);
    }
  }

  return (
    <section aria-labelledby="titulo-ouvidos-recentemente" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="titulo-ouvidos-recentemente" className="text-base sm:text-lg font-semibold tracking-tight text-fg">
          Ouvidos recentemente
        </h2>

        <button
          type="button"
          onClick={() => navigate("/comum/ambientes")}
          className="text-xs font-medium text-fg-3 transition-colors hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus rounded"
        >
          Ambientes &rarr;
        </button>
      </div>

      {ambientes.length === 0 ? (
        <div className="rounded-2xl border border-line-subtle bg-surface p-6 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-accent-soft text-accent">
            <Compass size={22} />
          </div>
          <h3 className="mt-3 text-sm font-medium text-fg">
            Nenhum ambiente reproduzido recentemente
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-fg-3 max-w-sm mx-auto">
            Os ambientes sonoros que você ouvir ficarão organizados aqui para acesso rápido.
          </p>
          <button
            type="button"
            onClick={() => navigate("/?aba=ambientes")}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
          >
            Conhecer ambientes da plataforma &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ambientes.map((ambiente) => {
            const audios = Array.isArray(ambiente.audios) ? ambiente.audios : [];
            const nomesSons = audios
              .map((item) => item.titulo || item.audio?.titulo)
              .filter(Boolean)
              .join(" · ");

            const ehPlataforma =
              ambiente.origem === "PRE_CONFIGURADO" ||
              ambiente.origem === "PLATAFORMA" ||
              ambiente.publicado;

            return (
              <div
                key={ambiente.idAmbienteSonoro}
                className="group relative flex flex-col rounded-2xl border border-line-subtle bg-surface transition-all duration-200 hover:border-line hover:shadow-sm"
              >
                {/* Imagem do Card com Badge e Play Button */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-2xl bg-bg-2">
                  {ambiente.imagem ? (
                    <img
                      src={ambiente.imagem}
                      alt={ambiente.nome}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-icon-muted">
                      <AudioLines size={32} strokeWidth={1.3} aria-hidden="true" />
                    </div>
                  )}

                  {/* Badge Plataforma */}
                  {ehPlataforma && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 dark:bg-black/80 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-ink font-semibold backdrop-blur-xs">
                      Plataforma
                    </span>
                  )}

                  {/* Menu de Opções Discreto */}
                  <div className="absolute right-3 top-3">
                    <button
                      type="button"
                      aria-label="Opções do ambiente"
                      title="Opções"
                      className="grid size-7 place-items-center rounded-full bg-black/40 text-white backdrop-blur-xs transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>

                  {/* Botão de Reprodução Rápida */}
                  <button
                    type="button"
                    onClick={() => handlePlay(ambiente)}
                    aria-label={
                      ambienteAtual?.idAmbienteSonoro === ambiente.idAmbienteSonoro && tocando
                        ? `Pausar ${ambiente.nome}`
                        : `Reproduzir ${ambiente.nome}`
                    }
                    className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-white text-ink shadow-md transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {ambienteAtual?.idAmbienteSonoro === ambiente.idAmbienteSonoro && tocando ? (
                      <Pause size={16} fill="currentColor" strokeWidth={0} className="text-[#181625]" />
                    ) : (
                      <Play size={16} fill="currentColor" strokeWidth={0} className="translate-x-0.5 text-[#181625]" />
                    )}
                  </button>
                </div>

                {/* Conteúdo Textual do Card */}
                <div className="p-4">
                  <h3
                    onClick={() => navigate(`/player/${ambiente.idAmbienteSonoro}`)}
                    className="cursor-pointer truncate text-sm font-semibold tracking-tight text-fg hover:text-accent transition-colors"
                  >
                    {ambiente.nome}
                  </h3>

                  {(ambiente.descricao || ambiente.categoria) && (
                    <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wider text-accent">
                      {ambiente.categoria || ambiente.descricao}
                    </p>
                  )}

                  <p className="mt-1 truncate text-xs text-fg-3">
                    {nomesSons || "Sem sons especificados"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
