import { useEffect, useState } from "react";
import { Timer as TimerIcon } from "lucide-react";

function formatarTempo(segundos) {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segundosRestantes = segundos % 60;

  if (horas > 0) {
    return `${horas}:${String(minutos).padStart(2, "0")}:${String(segundosRestantes).padStart(2, "0")}`;
  }

  return `${minutos}:${String(segundosRestantes).padStart(2, "0")}`;
}

export function statusLabel(session) {
  if (!session) return "";

  if (session.mode === "cycles") {
    return `CICLO ${session.cycle} · ${formatarTempo(session.remaining)}`;
  }

  return `ENCERRA EM ${formatarTempo(session.remaining)}`;
}

export function useSessionTimer(playing, onFinish) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!playing || !session) return;

    const intervalo = setInterval(() => {
      setSession((atual) => {
        if (!atual) return null;

        if (atual.remaining <= 1) {
          if (atual.mode === "cycles" && atual.cycle < atual.count) {
            return {
              ...atual,
              cycle: atual.cycle + 1,
              remaining: atual.phase === "play" ? atual.pause : atual.play,
              phase: atual.phase === "play" ? "pause" : "play",
            };
          }

          onFinish?.();
          return null;
        }

        return { ...atual, remaining: atual.remaining - 1 };
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [playing, session, onFinish]);

  function start(config) {
    setSession({
      ...config,
      phase: "play",
      cycle: 1,
      remaining: config.total ?? config.play,
    });
  }

  function cancel() {
    setSession(null);
  }

  return { session, start, cancel };
}

export function TimerControl({ timer }) {
  const [aberto, setAberto] = useState(false);
  const [modo, setModo] = useState("end");
  const [duracao, setDuracao] = useState(30);
  const [personalizado, setPersonalizado] = useState(false);
  const [horas, setHoras] = useState(1);
  const [minutos, setMinutos] = useState(0);
  const [pausa, setPausa] = useState(5);
  const [quantidade, setQuantidade] = useState(3);
  const [aviso, setAviso] = useState("bell");

  const ativo = Boolean(timer.session);

  function iniciar() {
    const config = {
      alert: aviso,
      mode: modo,
    };

    if (modo === "end") {
      config.total = personalizado ? horas * 3600 + minutos * 60 : duracao * 60;
    } else {
      config.play = duracao * 60;
      config.pause = pausa * 60;
      config.count = quantidade;
    }

    timer.start(config);
    setAberto(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        aria-label="Abrir temporizador"
        aria-expanded={aberto}
        className={`grid size-12 place-items-center rounded-xl transition-colors ${
          aberto || ativo
            ? "bg-accent-soft text-accent"
            : "text-fg-2 hover:bg-surface-hover"
        }`}
      >
        <TimerIcon size={19} strokeWidth={1.6} />
      </button>

      {aberto && (
        <>
          <button
            type="button"
            aria-label="Fechar temporizador"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setAberto(false)}
          />

          <div className="absolute left-1/2 top-[calc(100%+12px)] z-50 w-[min(356px,calc(100vw-32px))] -translate-x-1/2 rounded-xl border border-line bg-surface p-4 shadow-xl sm:w-[374px]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-medium text-fg">Temporizador</h3>

              {ativo && (
                <button
                  type="button"
                  onClick={() => timer.cancel()}
                  className="text-xs text-danger hover:underline"
                >
                  Cancelar
                </button>
              )}
            </div>

            {ativo ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-accent-soft p-4 text-center">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-3">
                    Tempo restante
                  </p>
                  <p className="mt-2 text-3xl font-light tabular-nums text-accent">
                    {formatarTempo(timer.session.remaining)}
                  </p>
                  <p className="mt-2 text-xs text-fg-2">
                    {statusLabel(timer.session)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    timer.cancel();
                    setAberto(false);
                  }}
                  className="w-full rounded-[10px] bg-accent py-3 text-sm font-semibold text-on-accent"
                >
                  Encerrar temporizador
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 rounded-xl bg-bg-2 p-1">
                  {[
                    ["none", "Sem temporizador"],
                    ["end", "Encerrar depois"],
                    ["cycles", "Ciclos"],
                  ].map(([valor, texto]) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setModo(valor)}
                      className={`rounded-lg px-1 py-2 text-xs transition-colors ${
                        modo === valor
                          ? "bg-accent text-on-accent shadow-sm"
                          : "text-fg-2 hover:text-fg"
                      }`}
                    >
                      {texto}
                    </button>
                  ))}
                </div>

                {modo !== "none" && (
                  <>
                    <p className="mb-2 mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-3">
                      {modo === "end"
                        ? "Encerrar depois de"
                        : "Duração de cada ciclo"}
                    </p>

                    <div className="grid grid-cols-4 gap-1.5">
                      {[15, 30, 45, 60, 120, 240].map((valor) => (
                        <button
                          key={valor}
                          type="button"
                          onClick={() => {
                            setDuracao(valor);
                            setPersonalizado(false);
                          }}
                          className={`rounded-lg border py-2 text-xs ${
                            duracao === valor && !personalizado
                              ? "border-accent-soft bg-accent-soft text-accent"
                              : "border-line-subtle text-fg-2 hover:bg-surface-hover"
                          }`}
                        >
                          {valor >= 60 ? `${valor / 60} h` : `${valor} min`}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setPersonalizado(true)}
                        className={`col-span-2 rounded-lg border py-2 text-xs ${
                          personalizado
                            ? "border-accent-soft bg-accent-soft text-accent"
                            : "border-line-subtle text-fg-2 hover:bg-surface-hover"
                        }`}
                      >
                        Personalizado
                      </button>
                    </div>

                    {personalizado && (
                      <div className="mt-3 flex items-center gap-3">
                        <label className="flex-1 text-xs text-fg-2">
                          Horas
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={horas}
                            onChange={(e) => setHoras(Number(e.target.value))}
                            className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-fg"
                          />
                        </label>
                        <label className="flex-1 text-xs text-fg-2">
                          Minutos
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={minutos}
                            onChange={(e) => setMinutos(Number(e.target.value))}
                            className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-fg"
                          />
                        </label>
                      </div>
                    )}

                    {modo === "cycles" && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <label className="text-xs text-fg-2">
                          Pausa (min)
                          <input
                            type="number"
                            min="1"
                            value={pausa}
                            onChange={(e) => setPausa(Number(e.target.value))}
                            className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-fg"
                          />
                        </label>
                        <label className="text-xs text-fg-2">
                          Quantidade de ciclos
                          <input
                            type="number"
                            min="1"
                            value={quantidade}
                            onChange={(e) =>
                              setQuantidade(Number(e.target.value))
                            }
                            className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-fg"
                          />
                        </label>
                      </div>
                    )}
                  </>
                )}

                <p className="mb-2 mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-3">
                  Avisos
                </p>

                <div className="grid grid-cols-3 rounded-xl bg-bg-2 p-1">
                  {[
                    ["none", "Nenhum"],
                    ["bell", "Sino suave"],
                    ["voice", "Voz"],
                  ].map(([valor, texto]) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setAviso(valor)}
                      className={`rounded-lg py-2 text-xs ${
                        aviso === valor
                          ? "bg-accent text-on-accent shadow-sm"
                          : "text-fg-2 hover:text-fg"
                      }`}
                    >
                      {texto}
                    </button>
                  ))}
                </div>

                <p className="mt-2 text-xs text-fg-3">
                  {aviso === "none"
                    ? "Nenhum aviso será emitido."
                    : "O aviso será visual nesta versão, sem áudio."}
                </p>

                <button
                  type="button"
                  disabled={
                    modo === "none" ||
                    (personalizado && horas === 0 && minutos === 0)
                  }
                  onClick={iniciar}
                  className="mt-5 w-full rounded-[10px] bg-accent py-3 text-sm font-semibold text-on-accent lift transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Iniciar temporizador
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
