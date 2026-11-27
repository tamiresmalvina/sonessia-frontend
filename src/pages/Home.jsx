import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Save, Trash2 } from "lucide-react";

import Header from "../components/Header";
import FiltroCategorias from "../components/FiltroCategorias";
import SomCard from "../components/SomCard";
import AmbienteCard from "../components/AmbienteCard";
import Player from "../components/player/Player";

import { ambienteService, audioService } from "../services/sons.service.js";
import { categoriasService } from "../services/categorias.service.js";
import { useReprodutor } from "../hooks/useReprodutor.js";
import {
  filtrarPorCategoria,
  obterCategoriasAtivas,
} from "../utils/catalogo.js";
import { obterCorCategoria } from "../utils/cor-categoria.js";

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const abaQuery = searchParams.get("aba");
  const pagina = abaQuery === "ambientes" ? "ambientes" : "sons";

  const [temaEscuro, setTemaEscuro] = useState(() => {
    return localStorage.getItem("sonessia-theme") === "dark";
  });
  const [filtroSons, setFiltroSons] = useState("Todos");
  const [filtroAmbientes, setFiltroAmbientes] = useState("Todos");
  const [audios, setAudios] = useState([]);
  const [ambientesPublicos, setAmbientesPublicos] = useState([]);
  const [categoriasAudio, setCategoriasAudio] = useState([]);
  const [categoriasAmbiente, setCategoriasAmbiente] = useState([]);
  const [carregandoAudios, setCarregandoAudios] = useState(true);
  const [carregandoAmbientes, setCarregandoAmbientes] = useState(false);
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);
  const [erroAudios, setErroAudios] = useState("");
  const [erroAmbientes, setErroAmbientes] = useState("");
  const [erroCategorias, setErroCategorias] = useState("");
  const [versaoAudios, setVersaoAudios] = useState(0);
  const [versaoAmbientes, setVersaoAmbientes] = useState(0);
  const [versaoCategorias, setVersaoCategorias] = useState(0);
  const reprodutor = useReprodutor();
  const { sincronizarAudios } = reprodutor;

  const tipoCategorias = pagina === "sons" ? "AUDIO" : "AMBIENTE";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", temaEscuro);
    localStorage.setItem("sonessia-theme", temaEscuro ? "dark" : "light");
  }, [temaEscuro]);

  useEffect(() => {
    let ativo = true;
    let requisicao = 0;

    async function carregarCategorias() {
      const requisicaoAtual = ++requisicao;
      setCarregandoCategorias(true);
      setErroCategorias("");

      try {
        const resposta = await categoriasService.listar(null, tipoCategorias);
        const nomes = obterCategoriasAtivas(resposta);
        if (!ativo || requisicaoAtual !== requisicao) return;

        if (tipoCategorias === "AUDIO") {
          setCategoriasAudio(nomes);
          setFiltroSons((atual) => (nomes.includes(atual) ? atual : "Todos"));
        } else {
          setCategoriasAmbiente(nomes);
          setFiltroAmbientes((atual) =>
            nomes.includes(atual) ? atual : "Todos",
          );
        }
      } catch (falha) {
        if (ativo && requisicaoAtual === requisicao) {
          setErroCategorias(
            falha.message || "Não foi possível carregar as categorias.",
          );
        }
      } finally {
        if (ativo && requisicaoAtual === requisicao) {
          setCarregandoCategorias(false);
        }
      }
    }

    function atualizarAoRetornar() {
      if (document.visibilityState === "visible") void carregarCategorias();
    }

    void carregarCategorias();
    window.addEventListener("focus", atualizarAoRetornar);
    return () => {
      ativo = false;
      window.removeEventListener("focus", atualizarAoRetornar);
    };
  }, [tipoCategorias, versaoCategorias]);

  useEffect(() => {
    let ativo = true;
    let requisicao = 0;

    async function carregarAudios() {
      const requisicaoAtual = ++requisicao;
      setCarregandoAudios(true);
      setErroAudios("");

      try {
        const resposta = await audioService.listarAudios();
        if (
          !Array.isArray(resposta?.audios) ||
          !resposta.audios.every(
            (audio) =>
              typeof audio?.idAudio === "string" &&
              typeof audio.titulo === "string" &&
              typeof audio.categoria === "string" &&
              typeof audio.arquivo === "string",
          )
        ) {
          throw new Error(
            "A resposta da API não contém uma lista válida de áudios.",
          );
        }
        if (!ativo || requisicaoAtual !== requisicao) return;

        sincronizarAudios(resposta.audios);
        setAudios(resposta.audios);
      } catch (falha) {
        if (ativo && requisicaoAtual === requisicao) {
          setAudios([]);
          sincronizarAudios([]);
          setErroAudios(
            falha.message || "Não foi possível carregar os áudios.",
          );
        }
      } finally {
        if (ativo && requisicaoAtual === requisicao) setCarregandoAudios(false);
      }
    }

    function atualizarAoRetornar() {
      if (document.visibilityState === "visible") void carregarAudios();
    }

    void carregarAudios();
    window.addEventListener("focus", atualizarAoRetornar);
    return () => {
      ativo = false;
      window.removeEventListener("focus", atualizarAoRetornar);
    };
  }, [sincronizarAudios, versaoAudios]);

  useEffect(() => {
    if (pagina !== "ambientes") return undefined;
    let ativo = true;
    let requisicao = 0;

    async function carregarAmbientes() {
      const requisicaoAtual = ++requisicao;
      setCarregandoAmbientes(true);
      setErroAmbientes("");

      try {
        const resposta = await ambienteService.listarAmbientesPublicos();
        if (
          !Array.isArray(resposta?.ambientes) ||
          !resposta.ambientes.every(
            (ambiente) =>
              typeof ambiente?.idAmbienteSonoro === "string" &&
              typeof ambiente.nome === "string" &&
              Array.isArray(ambiente.audios),
          )
        ) {
          throw new Error(
            "A resposta da API não contém uma lista válida de ambientes.",
          );
        }
        if (!ativo || requisicaoAtual !== requisicao) return;
        setAmbientesPublicos(resposta.ambientes);
      } catch (falha) {
        if (ativo && requisicaoAtual === requisicao) {
          setAmbientesPublicos([]);
          setErroAmbientes(
            falha.message || "Não foi possível carregar os ambientes.",
          );
        }
      } finally {
        if (ativo && requisicaoAtual === requisicao)
          setCarregandoAmbientes(false);
      }
    }

    function atualizarAoRetornar() {
      if (document.visibilityState === "visible") void carregarAmbientes();
    }

    void carregarAmbientes();
    window.addEventListener("focus", atualizarAoRetornar);
    return () => {
      ativo = false;
      window.removeEventListener("focus", atualizarAoRetornar);
    };
  }, [pagina, versaoAmbientes]);

  const audiosVisiveis = useMemo(
    () => filtrarPorCategoria(audios, filtroSons),
    [audios, filtroSons],
  );
  const ambientesVisiveis = useMemo(
    () => filtrarPorCategoria(ambientesPublicos, filtroAmbientes),
    [ambientesPublicos, filtroAmbientes],
  );
  const categoriasSonsVisiveis = useMemo(
    () => [...new Set(["Todos", ...categoriasAudio])],
    [categoriasAudio],
  );
  const categoriasAmbientesVisiveis = useMemo(
    () => [...new Set(["Todos", ...categoriasAmbiente])],
    [categoriasAmbiente],
  );

  function limparComposicao() {
    reprodutor.limparTudo();
  }

  function mudarPagina(novaPagina) {
    setSearchParams(novaPagina === "ambientes" ? { aba: "ambientes" } : {});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reproduzirAmbiente(ambiente) {
    if (ambiente?.idAmbienteSonoro) {
      navigate(`/player/${ambiente.idAmbienteSonoro}`);
    }
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
              Experimente os sons
            </h1>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-fg-2">
              Explore, combine e personalize sons à sua maneira. Crie sua conta
              para aproveitar a experiência completa do Sonessia.
            </p>
          </div>

          <FiltroCategorias
            categorias={categoriasSonsVisiveis}
            selecionada={filtroSons}
            onSelecionar={setFiltroSons}
            rotulo="Filtrar sons por categoria"
          />
          {carregandoCategorias && (
            <p className="mt-3 text-center text-xs text-fg-3" role="status">
              Carregando categorias...
            </p>
          )}
          {erroCategorias && (
            <div
              className="mt-3 flex flex-wrap items-center justify-center gap-2 text-center text-xs text-rose-700 dark:text-rose-300"
              role="alert"
            >
              <span>
                Não foi possível atualizar as categorias: {erroCategorias}
              </span>
              <button
                type="button"
                onClick={() => setVersaoCategorias((atual) => atual + 1)}
                className="font-semibold underline underline-offset-2"
              >
                Tentar novamente
              </button>
            </div>
          )}

          <Player
            tocando={reprodutor.tocando}
            volumeGeral={reprodutor.volumeGeral}
            sonsAtivos={reprodutor.sonsAtivos}
            erroReproducao={reprodutor.erroReproducao}
            onReproduzirPausar={reprodutor.reproduzirPausar}
            onVolumeGeral={reprodutor.definirVolumeGeral}
          />

          {carregandoAudios && (
            <p className="mt-10 text-center text-sm text-fg-2" role="status">
              Carregando áudios...
            </p>
          )}
          {erroAudios && (
            <div
              className="mt-10 flex flex-wrap items-center justify-center gap-2 text-center text-sm text-rose-700 dark:text-rose-300"
              role="alert"
            >
              <span>Não foi possível carregar os áudios: {erroAudios}</span>
              <button
                type="button"
                onClick={() => setVersaoAudios((atual) => atual + 1)}
                className="font-semibold underline underline-offset-2"
              >
                Tentar novamente
              </button>
            </div>
          )}
          {!carregandoAudios && !erroAudios && audiosVisiveis.length > 0 && (
            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 sm:gap-x-10 lg:grid-cols-4 lg:gap-x-16 lg:gap-y-14">
              {audiosVisiveis.map((audio) => (
                <SomCard
                  key={audio.idAudio}
                  audio={audio}
                  volume={reprodutor.volumes[audio.idAudio] ?? 0}
                  cor={obterCorCategoria(audio.categoria)}
                  onAlterarVolume={(valor) =>
                    reprodutor.definirVolume(audio.idAudio, valor)
                  }
                />
              ))}
            </ul>
          )}
          {!carregandoAudios && !erroAudios && audiosVisiveis.length === 0 && (
            <p className="mt-12 text-center text-sm text-fg-2">
              {audios.length === 0
                ? "Ainda não há áudios disponíveis."
                : "Nenhum áudio encontrado nesta categoria."}
            </p>
          )}

          <div className="mt-14 flex items-center justify-between gap-4 border-t border-line-subtle py-6">
            <button
              type="button"
              disabled={reprodutor.sonsAtivos === 0}
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
            categorias={categoriasAmbientesVisiveis}
            selecionada={filtroAmbientes}
            onSelecionar={setFiltroAmbientes}
            rotulo="Filtrar ambientes por categoria"
          />
          {carregandoCategorias && (
            <p className="mt-3 text-center text-xs text-fg-3" role="status">
              Carregando categorias...
            </p>
          )}
          {erroCategorias && (
            <div
              className="mt-3 flex flex-wrap items-center justify-center gap-2 text-center text-xs text-rose-700 dark:text-rose-300"
              role="alert"
            >
              <span>
                Não foi possível atualizar as categorias: {erroCategorias}
              </span>
              <button
                type="button"
                onClick={() => setVersaoCategorias((atual) => atual + 1)}
                className="font-semibold underline underline-offset-2"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {carregandoAmbientes && (
            <p className="mt-10 text-center text-sm text-fg-2" role="status">
              Carregando ambientes...
            </p>
          )}
          {erroAmbientes && (
            <div
              className="mt-10 flex flex-wrap items-center justify-center gap-2 text-center text-sm text-rose-700 dark:text-rose-300"
              role="alert"
            >
              <span>
                Não foi possível carregar os ambientes: {erroAmbientes}
              </span>
              <button
                type="button"
                onClick={() => setVersaoAmbientes((atual) => atual + 1)}
                className="font-semibold underline underline-offset-2"
              >
                Tentar novamente
              </button>
            </div>
          )}
          {!carregandoAmbientes && !erroAmbientes && (
            <>
              {ambientesVisiveis.length > 0 ? (
                <ul className="mt-14 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-14">
                  {ambientesVisiveis.map((ambiente) => (
                    <AmbienteCard
                      key={ambiente.idAmbienteSonoro}
                      ambiente={ambiente}
                      onReproduzir={reproduzirAmbiente}
                    />
                  ))}
                </ul>
              ) : (
                <p className="mt-12 text-center text-sm text-fg-2">
                  {ambientesPublicos.length === 0
                    ? "Ainda não há ambientes disponíveis."
                    : "Nenhum ambiente encontrado nesta categoria."}
                </p>
              )}
            </>
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
