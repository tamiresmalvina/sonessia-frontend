import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para gerenciar a reprodução de múltiplos áudios via Web Audio API.
 * Cada áudio é reproduzido em loop com volume individual controlável.
 */
export function useReprodutor() {
  const contextoRef = useRef(null);
  // idAudio -> { source, gain }
  const nosRef = useRef({});
  // idAudio -> url (para recriar source ao retomar)
  const urlsRef = useRef({});
  // idAudio -> AudioBuffer decodificado (cache)
  const buffersRef = useRef({});

  const [tocando, setTocando] = useState(false);
  // 0-100 por áudio
  const [volumes, setVolumes] = useState({});
  const [volumeGeral, setVolumeGeralState] = useState(70);
  const volumeGeralRef = useRef(70);
  const gainMasterRef = useRef(null);

  // Inicializa AudioContext na primeira interação
  function obterContexto() {
    if (!contextoRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      contextoRef.current = new AudioCtx();
      gainMasterRef.current = contextoRef.current.createGain();
      gainMasterRef.current.gain.value = volumeGeralRef.current / 100;
      gainMasterRef.current.connect(contextoRef.current.destination);
    }
    return contextoRef.current;
  }

  // Busca e decodifica um áudio (com cache)
  async function carregarBuffer(idAudio, url) {
    if (buffersRef.current[idAudio]) return buffersRef.current[idAudio];
    const ctx = obterContexto();
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Falha ao carregar áudio: HTTP ${resp.status}`);
    }
    const arrayBuffer = await resp.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    buffersRef.current[idAudio] = audioBuffer;
    return audioBuffer;
  }

  function pararSource(idAudio) {
    const no = nosRef.current[idAudio];
    if (no) {
      try { no.source.stop(); } catch { /* source já parada */ }
      try { no.source.disconnect(); } catch { /* nó já desconectado */ }
      try { no.gain.disconnect(); } catch { /* gain já desconectado */ }
      delete nosRef.current[idAudio];
    }
  }

  // Cria e conecta um BufferSource em loop para um áudio
  async function iniciarSource(idAudio, url) {
    try {
      const ctx = obterContexto();
      if (ctx.state === 'suspended') await ctx.resume();
      const buffer = await carregarBuffer(idAudio, url);
      pararSource(idAudio);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = ctx.createGain();
      const vol = volumes[idAudio] ?? 0;
      gain.gain.value = vol / 100;
      source.connect(gain);
      gain.connect(gainMasterRef.current || ctx.destination);
      source.start(0);
      nosRef.current[idAudio] = { source, gain };
    } catch {
      // Falha silenciosa para URLs indisponíveis ou offline
    }
  }

  // Registra um áudio e sua URL (não inicia reprodução ainda)
  const inicializarAudio = useCallback((idAudio, url) => {
    urlsRef.current[idAudio] = url;
    setVolumes((prev) => {
      if (idAudio in prev) return prev;
      return { ...prev, [idAudio]: 0 };
    });
  }, []);

  // Reproduzir / Pausar
  const reproduzirPausar = useCallback(async () => {
    const ctx = obterContexto();

    if (tocando) {
      await ctx.suspend();
      setTocando(false);
    } else {
      if (ctx.state === 'suspended') await ctx.resume();

      // Inicia sources para todos os sons com volume > 0 que ainda não estejam rodando
      const entradas = Object.entries(volumes);
      for (const [id, v] of entradas) {
        if (v > 0 && !nosRef.current[id] && urlsRef.current[id]) {
          await iniciarSource(id, urlsRef.current[id]);
        }
      }
      setTocando(true);
    }
  }, [tocando, volumes]); // eslint-disable-line react-hooks/exhaustive-deps

  // Definir volume individual
  const definirVolume = useCallback(async (idAudio, novoVolume) => {
    const url = urlsRef.current[idAudio];
    setVolumes((prev) => ({ ...prev, [idAudio]: novoVolume }));

    if (novoVolume > 0 && tocando && url) {
      if (!nosRef.current[idAudio]) {
        await iniciarSource(idAudio, url);
      } else {
        const no = nosRef.current[idAudio];
        no.gain.gain.setTargetAtTime(novoVolume / 100, obterContexto().currentTime, 0.1);
      }
    } else if (novoVolume === 0) {
      pararSource(idAudio);
    }
  }, [tocando]); // eslint-disable-line react-hooks/exhaustive-deps

  // Volume geral
  const definirVolumeGeral = useCallback((v) => {
    const clamped = Math.max(0, Math.min(100, v));
    volumeGeralRef.current = clamped;
    setVolumeGeralState(clamped);
    if (gainMasterRef.current && contextoRef.current) {
      gainMasterRef.current.gain.setTargetAtTime(
        clamped / 100,
        contextoRef.current.currentTime,
        0.05
      );
    }
  }, []);

  // Limpar tudo
  const limparTudo = useCallback(() => {
    Object.keys(nosRef.current).forEach(pararSource);
    setVolumes((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, 0])));
    setTocando(false);
    if (contextoRef.current?.state === 'running') {
      contextoRef.current.suspend();
    }
  }, []);

  const sonsAtivos = Object.values(volumes).filter((v) => v > 0).length;

  // Cleanup ao desmontar
  useEffect(() => {
    const nosAtual = nosRef.current;
    return () => {
      Object.keys(nosAtual).forEach((id) => {
        const no = nosAtual[id];
        if (no) {
          try { no.source.stop(); } catch { /* ignorar */ }
          try { no.source.disconnect(); } catch { /* ignorar */ }
          try { no.gain.disconnect(); } catch { /* ignorar */ }
        }
      });
      try { contextoRef.current?.close(); } catch { /* ignorar */ }
    };
  }, []);

  return {
    tocando,
    volumes,
    reproduzirPausar,
    definirVolume,
    limparTudo,
    sonsAtivos,
    volumeGeral,
    definirVolumeGeral,
    inicializarAudio,
  };
}
