import test from "node:test";
import assert from "node:assert/strict";

import { criarFormularioEdicaoAudio } from "../utils/audio-form.js";

test("formulário de edição restaura o ícone recebido da API", () => {
  const formulario = criarFormularioEdicaoAudio({
    idAudio: "audio-1",
    titulo: "Chuva",
    tituloOriginal: "Rain",
    categoria: "Natureza",
    fonte: "Domínio público",
    licenca: "CC0",
    descricao: null,
    icone: "cloud-rain",
  });

  assert.equal(formulario.icone, "cloud-rain");
  assert.equal(formulario.titulo, "Chuva");
  assert.equal(formulario.arquivo, null);
});

test("formulário de edição mantém vazia a seleção quando o áudio não tem ícone", () => {
  const formulario = criarFormularioEdicaoAudio({
    titulo: "Som",
    tituloOriginal: "Sound",
    categoria: "Natureza",
    fonte: "Teste",
    licenca: "CC0",
    icone: null,
  });

  assert.equal(formulario.icone, "");
});
