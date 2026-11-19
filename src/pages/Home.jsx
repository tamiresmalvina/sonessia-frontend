import { useEffect, useMemo, useState } from "react";
import { Save, Trash2 } from "lucide-react";

import Header from "../components/Header";
import FiltroCategorias from "../components/FiltroCategorias";
import SomCard from "../components/SomCard";
import AmbienteCard from "../components/AmbienteCard";
import Player from "../components/player/Player";

import {
  sons,
  categorias,
  coresCategorias,
  volumesIniciais,
  ambientesProntos,
  categoriasAmbientes,
} from "../data/sons";

export default function Home() {
  const [temaEscuro, setTemaEscuro] = useState(() => {
    return localStorage.getItem("sonessia-theme") === "dark";
  });

  const [pagina, setPagina] = useState("sons");
  const [filtroSons, setFiltroSons] = useState("Todos");
  const [filtroAmbientes, setFiltroAmbientes] = useState("Todos");
  const [volumes, setVolumes] = useState(volumesIniciais);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", temaEscuro);
    localStorage.setItem("sonessia-theme", temaEscuro ? "dark" : "light");
  }, [temaEscuro]);

  const sonsVisiveis = useMemo(() => {
    if (filtroSons === "Todos") return sons;

    return sons.filter((som) => som.categoria === filtroSons);
  }, [filtroSons]);

  const ambientesVisiveis = useMemo(() => {
    if (filtroAmbientes === "Todos") return ambientesProntos;

    return ambientesProntos.filter(
      (ambiente) => ambiente.categoria === filtroAmbientes,
    );
  }, [filtroAmbientes]);

  const quantidadeSonsAtivos = useMemo(() => {
    return Object.values(volumes).filter((volume) => volume > 0).length;
  }, [volumes]);

  function alterarVolume(idSom, novoVolume) {
    setVolumes((estadoAnterior) => ({
      ...estadoAnterior,
      [idSom]: novoVolume,
    }));
  }

  function limparComposicao() {
    setVolumes(Object.fromEntries(sons.map((som) => [som.id, 0])));
  }

  function mudarPagina(novaPagina) {
    setPagina(novaPagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <Header
        pagina={pagina}
        onMudarPagina={mudarPagina}
        temaEscuro={temaEscuro}
        onAlternarTema={() => setTemaEscuro((atual) => !atual)}
      />

      {pagina === "sons" ? (
        <main
          id="conteudo-principal"
          className="mx-auto w-full max-w-[1120px] flex-1 px-5 pt-12 md:px-10 md:pt-16"
        >
          <div className="text-center">
            <h1 className="text-[52px] font-light leading-none tracking-[-0.05em] md:text-[72px]">
              Sons
            </h1>

            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-fg-2">
              Customize seu próprio ambiente sonoro com diferentes opções de
              sons.
            </p>
          </div>

          <FiltroCategorias
            categorias={categorias}
            selecionada={filtroSons}
            onSelecionar={setFiltroSons}
            rotulo="Filtrar sons por categoria"
          />

          <Player
            sonsAtivos={sons.filter((som) => (volumes[som.id] ?? 0) > 0)}
          />

          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 sm:gap-x-10 lg:grid-cols-4 lg:gap-x-16 lg:gap-y-14">
            {sonsVisiveis.map((som) => (
              <SomCard
                key={som.id}
                som={som}
                volume={volumes[som.id] ?? 0}
                cor={coresCategorias[som.categoria]}
                onAlterarVolume={(valor) => alterarVolume(som.id, valor)}
              />
            ))}
          </ul>

          <div className="mt-14 flex items-center justify-between gap-4 border-t border-line-subtle py-6">
            <button
              type="button"
              disabled={quantidadeSonsAtivos === 0}
              onClick={limparComposicao}
              className="flex min-h-11 items-center gap-2 rounded-md px-2 text-sm text-fg-2 transition-colors hover:bg-surface-hover hover:text-fg disabled:cursor-not-allowed disabled:text-fg-disabled disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <Trash2 size={15} strokeWidth={1.6} aria-hidden="true" />
              Limpar composição
            </button>

            <button
              type="button"
              disabled
              title="Salvar ambientes será implementado em uma próxima etapa"
              className="flex min-h-11 cursor-not-allowed items-center gap-2 rounded-[10px] bg-accent px-6 text-sm font-semibold text-on-accent opacity-60 lift"
            >
              <Save size={15} strokeWidth={1.8} aria-hidden="true" />
              Salvar ambiente
            </button>
          </div>
        </main>
      ) : (
        <main
          id="conteudo-principal"
          className="mx-auto w-full max-w-[1120px] flex-1 px-5 pb-24 pt-12 md:px-10 md:pt-16"
        >
          <div className="text-center">
            <h1 className="text-[52px] font-light leading-none tracking-[-0.05em] md:text-[72px]">
              Ambientes prontos
            </h1>

            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-fg-2">
              Combinações de sons criadas para diferentes momentos.
            </p>
          </div>

          <FiltroCategorias
            categorias={categoriasAmbientes}
            selecionada={filtroAmbientes}
            onSelecionar={setFiltroAmbientes}
            rotulo="Filtrar ambientes por finalidade"
          />

          <ul className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-14">
            {ambientesVisiveis.map((ambiente) => (
              <AmbienteCard key={ambiente.id} ambiente={ambiente} />
            ))}
          </ul>

          {ambientesVisiveis.length === 0 && (
            <p className="mt-12 text-center text-sm text-fg-2">
              Nenhum ambiente encontrado nesta categoria.
            </p>
          )}
        </main>
      )}

      <button
        type="button"
        disabled
        aria-label="Ajuda — disponível em breve"
        title="Ajuda disponível em breve"
        className="lift fixed bottom-5 right-5 grid size-11 cursor-not-allowed place-items-center rounded-full border border-line-subtle bg-surface font-mono text-[14px] text-fg-2 opacity-70"
      >
        ?
      </button>
    </div>
  );
}
