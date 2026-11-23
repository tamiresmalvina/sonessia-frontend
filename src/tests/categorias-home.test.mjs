import test from "node:test";
import assert from "node:assert/strict";

import {
  filtrarPorCategoria,
  obterCategoriasAtivas,
} from "../utils/catalogo.js";

const audiosDaApi = [
  { idAudio: "audio-1", titulo: "Chuva", categoria: "Natureza", arquivo: "url-1" },
  { idAudio: "audio-2", titulo: "Piano", categoria: "Instrumental", arquivo: "url-2" },
];

test("filtro Todos preserva todos os áudios recebidos pela API", () => {
  assert.deepEqual(filtrarPorCategoria(audiosDaApi, "Todos"), audiosDaApi);
});

test("filtros usam a categoria exata e aceitam novas categorias", () => {
  const comCategoriaNova = [
    ...audiosDaApi,
    { idAudio: "audio-3", titulo: "Mar", categoria: "Oceano", arquivo: "url-3" },
  ];

  assert.deepEqual(
    filtrarPorCategoria(comCategoriaNova, "Oceano").map((audio) => audio.idAudio),
    ["audio-3"],
  );
  assert.deepEqual(filtrarPorCategoria(comCategoriaNova, "Inexistente"), []);
});

test("categorias retornadas incluem somente as ativas e recém-criadas", () => {
  const resposta = {
    categorias: [
      { nome: "Natureza", ativa: true },
      { nome: "Instrumental", ativa: false },
      { nome: "Oceano", ativa: true },
    ],
  };

  assert.deepEqual(obterCategoriasAtivas(resposta), ["Natureza", "Oceano"]);
});
