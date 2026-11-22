import test from "node:test";
import assert from "node:assert/strict";

import {
  ambientesProntos,
  filtrarMockPorCategoria,
  sons,
} from "../data/sons.js";

test("filtros da Home preservam Todos e mapeiam Ruído por alias exato", () => {
  assert.equal(filtrarMockPorCategoria(sons, "Todos").length, sons.length);
  assert.deepEqual(
    filtrarMockPorCategoria(sons, "Ruído").map((som) => som.id),
    ["branco", "marrom", "rosa"],
  );
  assert.deepEqual(filtrarMockPorCategoria(sons, "Teste"), []);
});

test("filtros de ambientes prontos usam a categoria selecionada sem aproximações", () => {
  assert.equal(filtrarMockPorCategoria(ambientesProntos, "Todos").length, ambientesProntos.length);
  assert.deepEqual(
    filtrarMockPorCategoria(ambientesProntos, "Foco").map((ambiente) => ambiente.id),
    ["biblioteca-silenciosa", "cafeteria"],
  );
  assert.deepEqual(filtrarMockPorCategoria(ambientesProntos, "A"), []);
});
