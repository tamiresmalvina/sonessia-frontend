function limitarVolume(valor) {
  return Math.max(0, Math.min(100, Number(valor) || 0));
}

function criarElementoAudio(url) {
  return new Audio(url);
}

export function criarControladorReproducaoAudio(
  criarAudio = criarElementoAudio,
) {
  const elementos = new Map();
  const assinantes = new Set();
  let tocando = false;
  let volumes = {};
  let volumeGeral = 100;
  let erroReproducao = "";
  let operacao = 0;
  let snapshot = criarSnapshot();

  function criarSnapshot() {
    return {
      tocando,
      volumes: { ...volumes },
      volumeGeral,
      erroReproducao,
      sonsAtivos: Object.values(volumes).filter((volume) => volume > 0).length,
    };
  }

  function publicar() {
    snapshot = criarSnapshot();
    assinantes.forEach((assinante) => assinante());
  }

  function atualizarVolumeElemento(idAudio) {
    const registro = elementos.get(idAudio);
    if (!registro) return;
    registro.audio.volume =
      ((volumes[idAudio] || 0) / 100) * (volumeGeral / 100);
  }

  function pausarElemento(idAudio, reiniciar = false) {
    const registro = elementos.get(idAudio);
    if (!registro) return;
    if (!registro.audio.paused) registro.audio.pause();
    if (reiniciar && registro.audio.readyState > 0) {
      registro.audio.currentTime = 0;
    }
  }

  function removerElemento(idAudio) {
    const registro = elementos.get(idAudio);
    if (!registro) return;
    if (!registro.audio.paused) registro.audio.pause();
    registro.audio.removeEventListener?.("error", registro.aoErro);
    registro.audio.removeAttribute?.("src");
    registro.audio.load?.();
    elementos.delete(idAudio);
  }

  function informarFalha(idAudio) {
    erroReproducao =
      `Não foi possível carregar ou reproduzir o áudio "${idAudio}". ` +
      "Verifique o arquivo ou tente novamente.";
    publicar();
  }

  function inicializarAudio(idAudio, url) {
    if (typeof idAudio !== "string" || !idAudio.trim()) {
      throw new Error("O áudio recebido não possui um identificador válido.");
    }
    if (typeof url !== "string" || !url.trim()) {
      throw new Error(`O áudio "${idAudio}" não possui uma URL válida.`);
    }

    const existente = elementos.get(idAudio);
    if (existente?.url === url) return;

    const volumeAnterior = volumes[idAudio] || 0;
    if (existente) removerElemento(idAudio);

    const audio = criarAudio(url);
    audio.loop = true;
    audio.preload = "none";
    const registro = { url, audio, aoErro: null };
    registro.aoErro = () => {
      if (elementos.get(idAudio) === registro) informarFalha(idAudio);
    };
    audio.addEventListener?.("error", registro.aoErro);
    elementos.set(idAudio, registro);
    volumes = { ...volumes, [idAudio]: volumeAnterior };
    atualizarVolumeElemento(idAudio);
    publicar();

    if (tocando && volumeAnterior > 0) {
      void reproduzirElemento(idAudio, operacao);
    }
  }

  async function reproduzirElemento(idAudio, idOperacao) {
    const registro = elementos.get(idAudio);
    if (!registro) return false;
    try {
      await registro.audio.play();
      return true;
    } catch {
      if (idOperacao === operacao && elementos.get(idAudio) === registro) {
        informarFalha(idAudio);
      }
      return false;
    }
  }

  async function iniciarAtivos() {
    const ativos = Object.entries(volumes).filter(
      ([idAudio, volume]) => volume > 0 && elementos.has(idAudio),
    );
    if (ativos.length === 0) {
      tocando = false;
      publicar();
      return false;
    }

    const idOperacao = ++operacao;
    erroReproducao = "";
    tocando = true;
    publicar();

    const resultados = await Promise.all(
      ativos.map(([idAudio]) => reproduzirElemento(idAudio, idOperacao)),
    );
    if (idOperacao !== operacao) return false;

    if (!resultados.some(Boolean)) tocando = false;
    publicar();
    return resultados.some(Boolean);
  }

  async function reproduzirPausar() {
    if (tocando) {
      operacao += 1;
      tocando = false;
      elementos.forEach((registro, idAudio) => {
        if (volumes[idAudio] > 0) registro.audio.pause();
      });
      publicar();
      return false;
    }
    return iniciarAtivos();
  }

  async function definirVolume(idAudio, novoVolume) {
    if (!elementos.has(idAudio)) {
      informarFalha(idAudio);
      return false;
    }

    const volume = limitarVolume(novoVolume);
    volumes = { ...volumes, [idAudio]: volume };
    atualizarVolumeElemento(idAudio);
    erroReproducao = "";

    if (volume === 0) {
      pausarElemento(idAudio);
      if (!Object.values(volumes).some((item) => item > 0)) {
        operacao += 1;
        tocando = false;
        elementos.forEach((registro) => registro.audio.pause());
      }
      publicar();
      return true;
    }

    publicar();
    if (tocando) return reproduzirElemento(idAudio, operacao);
    return true;
  }

  function definirVolumeGeral(novoVolume) {
    volumeGeral = limitarVolume(novoVolume);
    elementos.forEach((_registro, idAudio) => atualizarVolumeElemento(idAudio));
    publicar();
  }

  function sincronizarAudios(audios) {
    if (!Array.isArray(audios)) {
      throw new Error("A API não retornou uma lista válida de áudios.");
    }

    const idsRecebidos = new Set();
    for (const audio of audios) {
      if (typeof audio?.idAudio !== "string" || typeof audio?.arquivo !== "string") {
        throw new Error("A API retornou um áudio sem idAudio ou arquivo válido.");
      }
      idsRecebidos.add(audio.idAudio);
      inicializarAudio(audio.idAudio, audio.arquivo);
    }

    for (const idAudio of elementos.keys()) {
      if (!idsRecebidos.has(idAudio)) {
        removerElemento(idAudio);
        const volumesRestantes = { ...volumes };
        delete volumesRestantes[idAudio];
        volumes = volumesRestantes;
      }
    }

    if (tocando && !Object.values(volumes).some((volume) => volume > 0)) {
      operacao += 1;
      tocando = false;
      elementos.forEach((_registro, idAudio) => pausarElemento(idAudio));
    }
    publicar();
  }

  async function reproduzirComposicao(itens) {
    if (!Array.isArray(itens)) {
      throw new Error("A composição do ambiente não contém uma lista de áudios.");
    }

    operacao += 1;
    tocando = false;
    elementos.forEach((_registro, idAudio) => pausarElemento(idAudio, true));

    const volumesComposicao = {};
    const falhas = [];
    for (const item of itens) {
      const idAudio = item?.idAudio;
      const url = item?.arquivo || item?.audio?.arquivo;
      if (typeof idAudio !== "string" || typeof url !== "string" || !url.trim()) {
        falhas.push("um áudio sem identificador ou arquivo válido");
        continue;
      }
      inicializarAudio(idAudio, url);
      volumesComposicao[idAudio] = limitarVolume(item.volume);
    }

    volumes = Object.fromEntries(
      [...elementos.keys()].map((idAudio) => [
        idAudio,
        volumesComposicao[idAudio] || 0,
      ]),
    );
    elementos.forEach((_registro, idAudio) => atualizarVolumeElemento(idAudio));
    erroReproducao = falhas.length
      ? `Não foi possível carregar ${falhas.join(", ")} nesta composição.`
      : "";
    publicar();

    if (Object.values(volumesComposicao).every((volume) => volume === 0)) {
      if (!erroReproducao) {
        erroReproducao = "Este ambiente não possui áudios com volume ativo.";
      }
      publicar();
      return false;
    }
    return iniciarAtivos();
  }

  function limparTudo() {
    operacao += 1;
    elementos.forEach((_registro, idAudio) => pausarElemento(idAudio, true));
    volumes = Object.fromEntries(
      [...elementos.keys()].map((idAudio) => [idAudio, 0]),
    );
    tocando = false;
    erroReproducao = "";
    publicar();
  }

  function destruir() {
    operacao += 1;
    for (const idAudio of elementos.keys()) removerElemento(idAudio);
    assinantes.clear();
  }

  return {
    subscribe(assinante) {
      assinantes.add(assinante);
      return () => assinantes.delete(assinante);
    },
    getSnapshot() {
      return snapshot;
    },
    inicializarAudio,
    sincronizarAudios,
    reproduzirPausar,
    reproduzirComposicao,
    definirVolume,
    definirVolumeGeral,
    limparTudo,
    destruir,
  };
}
