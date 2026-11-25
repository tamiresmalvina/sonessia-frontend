const FILTROS_INICIAIS_VALIDOS = new Set(["plataforma"]);

export function lerComandoHomeAmbientes(estado) {
  const filtroInicial = FILTROS_INICIAIS_VALIDOS.has(estado?.filtroInicial)
    ? estado.filtroInicial
    : null;
  const abrirModalNovo = estado?.acaoHome === "criar";
  const consumir = Boolean(filtroInicial || abrirModalNovo);

  if (!consumir) {
    return {
      filtroInicial: null,
      abrirModalNovo: false,
      estadoRestante: estado ?? null,
      consumir: false,
    };
  }

  const estadoRestante = { ...estado };
  delete estadoRestante.filtroInicial;
  delete estadoRestante.acaoHome;

  return {
    filtroInicial,
    abrirModalNovo,
    estadoRestante: Object.keys(estadoRestante).length > 0 ? estadoRestante : null,
    consumir: true,
  };
}
