import test from "node:test";
import assert from "node:assert/strict";

import {
  filtrarPorCategoria,
  obterCategoriasAtivas,
} from "../utils/catalogo.js";
import {
  ambienteDuplicado,
  composicoesIguais,
} from "../utils/ambiente-duplicado.js";

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

test("composições iguais ignoram a ordem dos áudios", () => {
  assert.equal(
    composicoesIguais(
      [
        { idAudio: "audio-1", volume: 50 },
        { idAudio: "audio-2", volume: 80 },
      ],
      [
        { idAudio: "audio-2", volume: 80 },
        { idAudio: "audio-1", volume: 50 },
      ],
    ),
    true,
  );
});

test("composições com volume ou quantidade diferente não são iguais", () => {
  assert.equal(
    composicoesIguais(
      [{ idAudio: "audio-1", volume: 50 }],
      [{ idAudio: "audio-1", volume: 51 }],
    ),
    false,
  );
  assert.equal(
    composicoesIguais(
      [{ idAudio: "audio-1", volume: 50 }],
      [
        { idAudio: "audio-1", volume: 50 },
        { idAudio: "audio-2", volume: 40 },
      ],
    ),
    false,
  );
});

test("duplicidade exige nome igual e composição igual, ignorando o próprio ambiente", () => {
  const ambientes = [
    {
      idAmbienteSonoro: "ambiente-1",
      nome: "Foco",
      audios: [
        { idAudio: "audio-1", volume: 50 },
        { idAudio: "audio-2", volume: 80 },
      ],
    },
  ];

  assert.equal(
    ambienteDuplicado(
      {
        nome: "Foco",
        audios: [
          { idAudio: "audio-2", volume: 80 },
          { idAudio: "audio-1", volume: 50 },
        ],
      },
      ambientes,
      "ambiente-1",
    ),
    false,
  );
  assert.equal(
    ambienteDuplicado(
      { nome: "Foco", audios: [{ idAudio: "audio-1", volume: 50 }] },
      ambientes,
      "ambiente-1",
    ),
    false,
  );
  assert.equal(
    ambienteDuplicado(
      {
        nome: "Foco",
        audios: [
          { idAudio: "audio-1", volume: 50 },
          { idAudio: "audio-2", volume: 80 },
        ],
      },
      ambientes,
      null,
    ),
    true,
  );
});
