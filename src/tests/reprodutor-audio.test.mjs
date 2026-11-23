import test from "node:test";
import assert from "node:assert/strict";

import { criarControladorReproducaoAudio } from "../services/reprodutor-audio.js";

function criarAudioFalso(url) {
  return {
    url,
    loop: false,
    preload: "",
    volume: 1,
    paused: true,
    readyState: 1,
    currentTime: 14,
    chamadasPlay: 0,
    chamadasPause: 0,
    erroPlay: false,
    ouvintes: new Map(),
    async play() {
      this.chamadasPlay += 1;
      if (this.erroPlay) throw new Error("Falha de reprodução");
      this.paused = false;
    },
    pause() {
      this.chamadasPause += 1;
      this.paused = true;
    },
    addEventListener(tipo, callback) {
      this.ouvintes.set(tipo, callback);
    },
    removeEventListener(tipo) {
      this.ouvintes.delete(tipo);
    },
    removeAttribute() {},
    load() {},
  };
}

function criarTesteReprodutor() {
  const elementos = new Map();
  const reprodutor = criarControladorReproducaoAudio((url) => {
    const audio = criarAudioFalso(url);
    elementos.set(url, audio);
    return audio;
  });
  return { elementos, reprodutor };
}

test("reproduz a URL recebida pela API e aplica o volume do áudio e o volume geral", async () => {
  const { elementos, reprodutor } = criarTesteReprodutor();
  const url = "https://res.cloudinary.com/sonessia/audio/upload/chuva.mp3";
  reprodutor.sincronizarAudios([{ idAudio: "chuva", arquivo: url }]);
  await reprodutor.definirVolume("chuva", 40);

  assert.equal(await reprodutor.reproduzirPausar(), true);
  assert.equal(elementos.get(url).url, url);
  assert.equal(elementos.get(url).loop, true);
  assert.ok(Math.abs(elementos.get(url).volume - 0.4) < 0.00001);
  assert.equal(elementos.get(url).chamadasPlay, 1);
});

test("reproduz vários arquivos reais simultaneamente", async () => {
  const { elementos, reprodutor } = criarTesteReprodutor();
  const urlChuva = "https://cdn.example.test/chuva.mp3";
  const urlVento = "https://cdn.example.test/vento.mp3";
  reprodutor.sincronizarAudios([
    { idAudio: "chuva", arquivo: urlChuva },
    { idAudio: "vento", arquivo: urlVento },
  ]);
  await reprodutor.definirVolume("chuva", 35);
  await reprodutor.definirVolume("vento", 60);

  assert.equal(await reprodutor.reproduzirPausar(), true);
  assert.equal(elementos.get(urlChuva).paused, false);
  assert.equal(elementos.get(urlVento).paused, false);
  assert.equal(reprodutor.getSnapshot().sonsAtivos, 2);
});

test("pausa e retoma os mesmos elementos sem substituir a fonte", async () => {
  const { elementos, reprodutor } = criarTesteReprodutor();
  const url = "https://cdn.example.test/audio.mp3";
  reprodutor.sincronizarAudios([{ idAudio: "audio-1", arquivo: url }]);
  await reprodutor.definirVolume("audio-1", 50);

  await reprodutor.reproduzirPausar();
  await reprodutor.reproduzirPausar();
  assert.equal(reprodutor.getSnapshot().tocando, false);
  await reprodutor.reproduzirPausar();

  assert.equal(elementos.get(url).chamadasPlay, 2);
  assert.equal(elementos.get(url).chamadasPause, 1);
  assert.equal(reprodutor.getSnapshot().tocando, true);
});

test("troca para os áudios reais associados ao ambiente e atualiza os volumes", async () => {
  const { elementos, reprodutor } = criarTesteReprodutor();
  const urlChuva = "https://cdn.example.test/chuva.mp3";
  const urlVento = "https://cdn.example.test/vento.mp3";
  reprodutor.sincronizarAudios([
    { idAudio: "chuva", arquivo: urlChuva },
    { idAudio: "vento", arquivo: urlVento },
  ]);
  await reprodutor.definirVolume("chuva", 40);
  await reprodutor.reproduzirPausar();
  const chuva = elementos.get(urlChuva);

  await reprodutor.reproduzirComposicao([
    { idAudio: "vento", arquivo: urlVento, volume: 65 },
  ]);

  assert.equal(chuva.paused, true);
  assert.equal(chuva.currentTime, 0);
  assert.equal(elementos.get(urlVento).chamadasPlay, 1);
  assert.deepEqual(reprodutor.getSnapshot().volumes, { chuva: 0, vento: 65 });
});

test("apresenta erro quando o navegador não consegue reproduzir o arquivo", async () => {
  const { elementos, reprodutor } = criarTesteReprodutor();
  const url = "https://cdn.example.test/invalido.mp3";
  reprodutor.sincronizarAudios([{ idAudio: "audio-invalido", arquivo: url }]);
  elementos.get(url).erroPlay = true;
  await reprodutor.definirVolume("audio-invalido", 80);

  assert.equal(await reprodutor.reproduzirPausar(), false);
  assert.equal(reprodutor.getSnapshot().tocando, false);
  assert.match(reprodutor.getSnapshot().erroReproducao, /audio-invalido/);
});
