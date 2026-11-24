import { useEffect, useState } from "react";

export function formatarTempo(segundos) {
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
