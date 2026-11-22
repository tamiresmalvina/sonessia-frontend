import test from "node:test";
import assert from "node:assert/strict";
import { AudioLines } from "lucide-react";
import {
  MAPA_ICONE_AUDIO,
  OPCOES_ICONE_AUDIO,
  obterComponenteIconeAudio,
} from "../data/icones-audio.js";

const IDS_SOLICITADOS = [
  "audio-waveform",
  "disc-3",
  "disc-album",
  "piano",
  "keyboard-music",
  "drum",
  "guitar",
  "guitar-electric",
  "turntable",
  "cassette-tape",
  "boom-box",
  "coffee",
  "tv",
];

const IDS_EXISTENTES = [
  "cloud-rain",
  "cloud-drizzle",
  "cloud-fog",
  "wind",
  "waves",
  "flame",
  "music",
  "leaf",
  "bird",
  "cloud",
  "cloud-sun",
  "cloud-moon",
  "droplets",
  "tree-pine",
  "sun",
  "moon",
  "sparkles",
  "snowflake",
  "zap",
  "radio",
  "audio-lines",
];

test("cada identificador solicitado mapeia para um componente Lucide e permanece na galeria", () => {
  for (const id of [...IDS_SOLICITADOS, ...IDS_EXISTENTES]) {
    const opcao = OPCOES_ICONE_AUDIO.find((item) => item.id === id);
    assert.ok(opcao, `A galeria deve conter ${id}`);
    assert.ok(
      opcao.Componente && ["function", "object"].includes(typeof opcao.Componente),
      `${id} deve mapear para um componente`,
    );
    assert.equal(MAPA_ICONE_AUDIO[id], opcao.Componente);
    assert.equal(obterComponenteIconeAudio(id), opcao.Componente);
  }
});

test("identificadores nulos ou desconhecidos usam AudioLines como fallback", () => {
  assert.equal(obterComponenteIconeAudio(null), AudioLines);
  assert.equal(obterComponenteIconeAudio(undefined), AudioLines);
  assert.equal(obterComponenteIconeAudio("icone-inexistente"), AudioLines);
  assert.equal(obterComponenteIconeAudio("toString"), AudioLines);
});
