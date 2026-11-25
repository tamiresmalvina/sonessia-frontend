import { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from "react";
import { PlayerContext } from "./PlayerContextInstance.js";
import { criarControladorReproducaoAudio } from "../services/reprodutor-audio.js";
import { ambienteService } from "../services/sons.service.js";
import { useAuth } from "./useAuth.js";
import { useSessionTimer } from "../components/timer/useSessionTimer.js";

export function PlayerProvider({ children }) {
  const { token } = useAuth();
  const [controlador] = useState(criarControladorReproducaoAudio);

  const estado = useSyncExternalStore(
    controlador.subscribe,
    controlador.getSnapshot,
    controlador.getSnapshot,
  );

  const [ambienteAtual, setAmbienteAtual] = useState(null);
  const [tempoSegundos, setTempoSegundos] = useState(0);
  const [carregandoAmbiente, setCarregandoAmbiente] = useState(false);
  const [erroAmbiente, setErroAmbiente] = useState("");

  // Contador de tempo decorrido efetivo
  useEffect(() => {
    if (!estado.tocando) return undefined;
    const intervalo = setInterval(() => {
      setTempoSegundos((atual) => atual + 1);
    }, 1000);
    return () => clearInterval(intervalo);
  }, [estado.tocando]);

  // Temporizador de sessão integrado
  const finalizarTimer = useCallback(() => {
    if (estado.tocando) void controlador.reproduzirPausar();
  }, [controlador, estado.tocando]);

  const timer = useSessionTimer(estado.tocando, finalizarTimer);

  // Destruição segura ao desmontar a aplicação
  useEffect(() => () => controlador.destruir(), [controlador]);

  /**
   * Inicia a reprodução de um ambiente sonoro.
   * Aceita tanto um objeto de ambiente completo quanto um ID string.
   */
  const tocarAmbiente = useCallback(
    async (ambienteOuId) => {
      setErroAmbiente("");
      let amb = ambienteOuId;

      // Se já estiver tocando o mesmo ambiente por objeto
      if (
        amb &&
        typeof amb === "object" &&
        ambienteAtual?.idAmbienteSonoro === amb.idAmbienteSonoro
      ) {
        if (!estado.tocando) {
          void controlador.reproduzirPausar();
        }
        return amb;
      }

      // Se foi passado um ID ou um objeto sem os áudios associados
      if (typeof amb === "string" || !Array.isArray(amb?.audios) || amb.audios.length === 0) {
        const id = typeof amb === "string" ? amb : amb?.idAmbienteSonoro;
        if (!id) return null;

        if (ambienteAtual?.idAmbienteSonoro === id) {
          if (!estado.tocando) void controlador.reproduzirPausar();
          return ambienteAtual;
        }

        setCarregandoAmbiente(true);
        try {
          let resposta = null;
          if (token) {
            try {
              resposta = await ambienteService.obterAmbiente(token, id);
            } catch {
              // Não encontrado em ambientes personalizados, tenta na pública
            }
          }

          if (!resposta?.ambiente) {
            resposta = await ambienteService.obterAmbientePublico(id);
          }

          if (!resposta?.ambiente) {
            throw new Error("Ambiente sonoro não encontrado.");
          }

          amb = resposta.ambiente;
        } catch (erro) {
          const msg =
            erro?.mensagem ||
            erro?.message ||
            "Não foi possível carregar os dados do ambiente sonoro.";
          setErroAmbiente(msg);
          setCarregandoAmbiente(false);
          throw erro;
        } finally {
          setCarregandoAmbiente(false);
        }
      }

      setAmbienteAtual(amb);
      setTempoSegundos(0);
      timer.cancel();

      const audiosComposicao = Array.isArray(amb?.audios) ? amb.audios : [];
      if (audiosComposicao.length > 0) {
        await controlador.reproduzirComposicao(audiosComposicao);
      }

      return amb;
    },
    [ambienteAtual, estado.tocando, token, controlador, timer],
  );

  /**
   * Encerra completamente a reprodução atual e remove o player compacto.
   */
  const encerrarReproducao = useCallback(() => {
    controlador.limparTudo();
    setAmbienteAtual(null);
    setTempoSegundos(0);
    setErroAmbiente("");
    timer.cancel();
  }, [controlador, timer]);

  const value = useMemo(
    () => ({
      ambienteAtual,
      setAmbienteAtual,
      carregandoAmbiente,
      erroAmbiente,
      tempoSegundos,
      setTempoSegundos,
      timer,
      tocando: estado.tocando,
      volumeGeral: estado.volumeGeral,
      volumes: estado.volumes,
      erroReproducao: estado.erroReproducao,
      sonsAtivos: estado.sonsAtivos,
      tocarAmbiente,
      reproduzirPausar: controlador.reproduzirPausar,
      definirVolume: controlador.definirVolume,
      definirVolumeGeral: controlador.definirVolumeGeral,
      encerrarReproducao,
      limparTudo: controlador.limparTudo,
      controlador,
    }),
    [
      ambienteAtual,
      carregandoAmbiente,
      erroAmbiente,
      tempoSegundos,
      timer,
      estado,
      tocarAmbiente,
      controlador,
      encerrarReproducao,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}
