import test from "node:test";
import assert from "node:assert/strict";

import { lerComandoHomeAmbientes } from "../utils/comando-home-ambientes.js";

test("consome uma única vez o filtro da plataforma e preserva estado de navegação não relacionado", () => {
  const estado = { filtroInicial: "plataforma", origem: "atalho-home" };
  const comando = lerComandoHomeAmbientes(estado);
  const comandoDepoisDaLimpeza = lerComandoHomeAmbientes(comando.estadoRestante);

  assert.equal(comando.filtroInicial, "plataforma");
  assert.equal(comando.abrirModalNovo, false);
  assert.deepEqual(comando.estadoRestante, { origem: "atalho-home" });
  assert.equal(comando.consumir, true);
  assert.equal(comandoDepoisDaLimpeza.consumir, false);
});

test("consome uma única vez a ação de criar e remove somente o comando temporário", () => {
  const comando = lerComandoHomeAmbientes({ acaoHome: "criar", retorno: "home" });
  const comandoDepoisDaLimpeza = lerComandoHomeAmbientes(comando.estadoRestante);

  assert.equal(comando.abrirModalNovo, true);
  assert.equal(comando.filtroInicial, null);
  assert.deepEqual(comando.estadoRestante, { retorno: "home" });
  assert.equal(comandoDepoisDaLimpeza.abrirModalNovo, false);
});

test("não consome nem altera estados de navegação sem comando reconhecido", () => {
  const estado = { acaoHome: "desconhecida", outra: true };
  const comando = lerComandoHomeAmbientes(estado);

  assert.equal(comando.consumir, false);
  assert.equal(comando.estadoRestante, estado);
});
