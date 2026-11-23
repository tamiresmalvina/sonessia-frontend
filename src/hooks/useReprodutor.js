import { useEffect, useState, useSyncExternalStore } from "react";
import { criarControladorReproducaoAudio } from "../services/reprodutor-audio.js";

export function useReprodutor() {
  const [controlador] = useState(criarControladorReproducaoAudio);
  const estado = useSyncExternalStore(
    controlador.subscribe,
    controlador.getSnapshot,
    controlador.getSnapshot,
  );

  useEffect(() => () => controlador.destruir(), [controlador]);

  return {
    ...estado,
    inicializarAudio: controlador.inicializarAudio,
    sincronizarAudios: controlador.sincronizarAudios,
    reproduzirPausar: controlador.reproduzirPausar,
    reproduzirComposicao: controlador.reproduzirComposicao,
    definirVolume: controlador.definirVolume,
    definirVolumeGeral: controlador.definirVolumeGeral,
    limparTudo: controlador.limparTudo,
  };
}
