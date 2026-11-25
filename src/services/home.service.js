import { colecoesService } from "./colecoes.service.js";
import { historicoReproducaoService } from "./historico-reproducao.service.js";
import { ambienteService } from "./sons.service.js";

const consultasEmAndamento = new Map();

function resolverLista(resultado, campo) {
  if (resultado.status !== "fulfilled" || !Array.isArray(resultado.value?.[campo])) {
    return {
      dados: [],
      erro: resultado.status === "rejected"
        ? resultado.reason
        : new Error(`A API não retornou uma lista válida em "${campo}".`),
    };
  }

  return { dados: resultado.value[campo], erro: null };
}

/** Carrega os dados disponíveis da Home e compartilha consultas concorrentes por token. */
export function carregarDadosHome(tokenAcesso) {
  if (!tokenAcesso) {
    return Promise.resolve({
      recentes: { dados: [], erro: null },
      ambientes: { dados: [], erro: null },
      colecoes: { dados: [], erro: null },
    });
  }

  const consultaExistente = consultasEmAndamento.get(tokenAcesso);
  if (consultaExistente) return consultaExistente;

  const consulta = Promise.allSettled([
    historicoReproducaoService.listarRecentes(tokenAcesso),
    ambienteService.listarAmbientes(tokenAcesso),
    colecoesService.listarColecoes(tokenAcesso),
  ]).then(([recentes, ambientes, colecoes]) => ({
    recentes: resolverLista(recentes, "ambientes"),
    ambientes: resolverLista(ambientes, "ambientes"),
    colecoes: resolverLista(colecoes, "colecoes"),
  }));

  consultasEmAndamento.set(tokenAcesso, consulta);
  void consulta.then(
    () => {
      if (consultasEmAndamento.get(tokenAcesso) === consulta) {
        consultasEmAndamento.delete(tokenAcesso);
      }
    },
    () => {
      if (consultasEmAndamento.get(tokenAcesso) === consulta) {
        consultasEmAndamento.delete(tokenAcesso);
      }
    },
  );

  return consulta;
}
