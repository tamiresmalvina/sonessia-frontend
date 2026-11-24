import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  ChevronLeft,
  Pause,
  Play,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import Header from "../components/Header";
import { TimerControl } from "../components/timer/timer";
import { statusLabel, useSessionTimer } from "../components/timer/useSessionTimer.js";
import { ambienteService } from "../services/sons.service.js";
import { useReprodutor } from "../hooks/useReprodutor.js";

function Equalizador({ animando = true }) {
  return (
    <span className="eq flex h-3.5 items-end gap-[2.5px]" aria-hidden="true">
      <span style={{ animationPlayState: animando ? "running" : "paused" }} />
      <span style={{ animationPlayState: animando ? "running" : "paused" }} />
      <span style={{ animationPlayState: animando ? "running" : "paused" }} />
      <span style={{ animationPlayState: animando ? "running" : "paused" }} />
    </span>
  );
}

function OndasDecorativas() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 top-16 overflow-hidden select-none"
    >
      <svg
        className="absolute inset-x-0 bottom-0 h-[58%] w-full opacity-60 transition-opacity duration-500 md:h-[68%] dark:opacity-30"
        viewBox="0 0 1440 600"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 320C240 230 480 390 720 330C960 270 1200 180 1440 260V600H0V320Z"
          fill="url(#gradiente-ondas-1)"
        />
        <path
          d="M0 400C300 320 600 480 900 420C1140 372 1320 330 1440 360V600H0V400Z"
          fill="url(#gradiente-ondas-2)"
        />
        <defs>
          <linearGradient id="gradiente-ondas-1" x1="0" y1="0" x2="1440" y2="600" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7656A8" stopOpacity="0.14" />
            <stop offset="50%" stopColor="#6474C8" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#8A5FC7" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id="gradiente-ondas-2" x1="1440" y1="100" x2="0" y2="600" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6474C8" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#7656A8" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#C875A8" stopOpacity="0.10" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function ModalSonsUtilizados({ aberto, aoFechar, ambiente }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!aberto) return undefined;

    function aoPressionarTecla(evento) {
      if (evento.key === "Escape") aoFechar();
    }

    document.addEventListener("keydown", aoPressionarTecla);
    return () => document.removeEventListener("keydown", aoPressionarTecla);
  }, [aberto, aoFechar]);

  if (!aberto || !ambiente) return null;

  const audios = Array.isArray(ambiente.audios) ? ambiente.audios : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-sons"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={aoFechar}
        aria-hidden="true"
      />

      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-2xl transition-all"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line-subtle pb-4">
          <div>
            <h2 id="titulo-modal-sons" className="text-lg font-semibold tracking-[-0.01em] text-fg">
              Sons utilizados
            </h2>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
              {ambiente.nome} · {ambiente.categoria || ambiente.finalidade}
            </p>
          </div>

          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar modal"
            className="grid size-9 place-items-center rounded-lg text-fg-3 transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {audios.length === 0 ? (
            <p className="py-6 text-center text-sm text-fg-2">
              Nenhum som associado a este ambiente.
            </p>
          ) : (
            audios.map((item, index) => {
              const titulo = item.titulo || item.audio?.titulo || `Som ${index + 1}`;
              const categoria = item.categoria || item.audio?.categoria;
              const volume = typeof item.volume === "number" ? Math.max(0, Math.min(100, item.volume)) : 0;

              return (
                <div
                  key={item.idAudio || index}
                  className="rounded-xl border border-line-subtle bg-bg-2/60 p-3.5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-fg">
                        {titulo}
                      </p>
                      {categoria && (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                          {categoria}
                        </span>
                      )}
                    </div>

                    <span className="font-mono text-xs font-medium tabular-nums text-fg">
                      {volume}%
                    </span>
                  </div>

                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-track">
                    <div
                      className="h-full rounded-full bg-[image:linear-gradient(90deg,var(--accent),var(--indigo))] transition-all duration-300"
                      style={{ width: `${volume}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-line-subtle pt-4">
          <button
            type="button"
            onClick={aoFechar}
            className="rounded-xl border border-line bg-surface px-5 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TelaPlayer() {
  const { idAmbienteSonoro } = useParams();
  const navigate = useNavigate();

  const [temaEscuro, setTemaEscuro] = useState(() => {
    return localStorage.getItem("sonessia-theme") === "dark";
  });
  const [ambiente, setAmbiente] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [volumeAberto, setVolumeAberto] = useState(false);
  const [modalSonsAberto, setModalSonsAberto] = useState(false);
  const [tempoSegundos, setTempoSegundos] = useState(0);

  const volumeRef = useRef(null);
  const reprodutor = useReprodutor();
  const {
    tocando,
    volumeGeral,
    erroReproducao,
    reproduzirPausar,
    reproduzirComposicao,
    definirVolumeGeral,
    limparTudo,
  } = reprodutor;

  // Sincroniza tema
  useEffect(() => {
    document.documentElement.classList.toggle("dark", temaEscuro);
    localStorage.setItem("sonessia-theme", temaEscuro ? "dark" : "light");
  }, [temaEscuro]);

  // Carrega ambiente sonoro real da API por ID
  useEffect(() => {
    let ativo = true;

    async function carregarAmbiente() {
      if (!idAmbienteSonoro) {
        setErro("Identificador de ambiente sonoro não informado.");
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro("");

      try {
        const resposta = await ambienteService.obterAmbientePublico(idAmbienteSonoro);
        if (!resposta?.ambiente || typeof resposta.ambiente.idAmbienteSonoro !== "string") {
          throw new Error("Os dados do ambiente não puderam ser recuperados.");
        }
        if (!ativo) return;

        setAmbiente(resposta.ambiente);

        const audiosComposicao = Array.isArray(resposta.ambiente.audios)
          ? resposta.ambiente.audios
          : [];

        if (audiosComposicao.length > 0) {
          void reproduzirComposicao(audiosComposicao);
        }
      } catch (falha) {
        if (!ativo) return;
        setErro(
          falha?.mensagem ||
            falha?.message ||
            "Não foi possível carregar o ambiente sonoro selecionado.",
        );
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregarAmbiente();

    return () => {
      ativo = false;
      limparTudo();
    };
  }, [idAmbienteSonoro, reproduzirComposicao, limparTudo]);

  // Temporizador de sessão integrado
  const finalizarSessaoTimer = useCallback(() => {
    if (tocando) void reproduzirPausar();
  }, [reproduzirPausar, tocando]);
  const timer = useSessionTimer(tocando, finalizarSessaoTimer);

  // Contador de tempo decorrido efetivo
  useEffect(() => {
    if (!tocando) return undefined;

    const intervalo = setInterval(() => {
      setTempoSegundos((atual) => atual + 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [tocando]);

  // Fechamento de popup de volume
  useEffect(() => {
    function fecharAoClicarFora(evento) {
      if (volumeRef.current && !volumeRef.current.contains(evento.target)) {
        setVolumeAberto(false);
      }
    }

    function fecharComEscape(evento) {
      if (evento.key === "Escape") setVolumeAberto(false);
    }

    document.addEventListener("mousedown", fecharAoClicarFora);
    document.addEventListener("keydown", fecharComEscape);
    return () => {
      document.removeEventListener("mousedown", fecharAoClicarFora);
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, []);

  const audios = useMemo(
    () => (Array.isArray(ambiente?.audios) ? ambiente.audios : []),
    [ambiente],
  );

  const nomesSons = useMemo(() => {
    return audios
      .map((item) => item.titulo || item.audio?.titulo)
      .filter((nome) => typeof nome === "string" && nome.trim().length > 0)
      .join(" · ");
  }, [audios]);

  const tempoFormatado = useMemo(() => {
    if (tempoSegundos < 60) return `${tempoSegundos} S`;
    const min = Math.floor(tempoSegundos / 60);
    const sec = tempoSegundos % 60;
    return sec > 0 ? `${min} MIN ${sec} S` : `${min} MIN`;
  }, [tempoSegundos]);

  const somMutado = volumeGeral === 0;

  function navegarVolta() {
    navigate("/?aba=ambientes");
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-bg text-fg">
      <Header
        pagina="ambientes"
        onMudarPagina={(aba) => navigate(`/?aba=${aba}`)}
        temaEscuro={temaEscuro}
        onAlternarTema={() => setTemaEscuro((atual) => !atual)}
      />

      {/* Ondas decorativas fluidas de fundo */}
      <OndasDecorativas />

      <main
        id="conteudo-principal"
        className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 pb-28 pt-6 md:px-10 md:pb-24"
      >
        {/* Navegação de retorno */}
        <div>
          <button
            type="button"
            onClick={navegarVolta}
            className="group inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-[13px] font-normal text-fg-2 transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Ambientes prontos</span>
          </button>
        </div>

        {/* Estado: Carregamento */}
        {carregando && (
          <div className="my-auto flex flex-col items-center justify-center py-24 text-center">
            <div className="size-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="mt-4 text-sm text-fg-2" role="status">
              Carregando ambiente sonoro...
            </p>
          </div>
        )}

        {/* Estado: Erro / Ambiente Inexistente */}
        {!carregando && (erro || !ambiente) && (
          <div className="my-auto mx-auto max-w-md py-20 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-line-subtle bg-surface text-accent shadow-sm">
              <AudioLines size={30} />
            </div>
            <h1 className="mt-5 text-2xl font-light tracking-tight text-fg">
              Ambiente não encontrado
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-fg-2">
              {erro || "O ambiente sonoro solicitado não existe ou não está mais disponível publicamente."}
            </p>
            <button
              type="button"
              onClick={navegarVolta}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <ArrowLeft size={16} />
              Voltar para ambientes prontos
            </button>
          </div>
        )}

        {/* Conteúdo Principal do Player */}
        {!carregando && ambiente && (
          <div className="my-auto flex flex-col items-center justify-center py-10 md:py-16">
            {/* Status: Equalizador e Tempo Decorrido */}
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-3">
              <Equalizador animando={tocando} />
              <span>{tocando ? `Reproduzindo · ${tempoFormatado}` : `Pausado em ${tempoFormatado}`}</span>
            </div>

            {/* Título Principal */}
            <h1 className="mt-4 max-w-4xl text-center text-[40px] font-normal tracking-[-0.03em] text-fg sm:text-[54px] md:text-[68px] lg:text-[74px]">
              {ambiente.nome}
            </h1>

            {/* Categoria / Finalidade */}
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              {ambiente.categoria || ambiente.finalidade}
            </p>

            {/* Sons Utilizados no Ambiente */}
            <p className="mt-2 max-w-xl text-center text-[14px] text-fg-3">
              {nomesSons || "Sem sons associados"}
            </p>

            {/* Controles Centrais */}
            <div className="relative mt-10 flex items-center justify-center gap-5 sm:gap-6">
              {/* Botão de Temporizador */}
              <div className="relative">
                <TimerControl timer={timer} />
              </div>

              {/* Botão Principal Reproduzir / Pausar */}
              <button
                type="button"
                onClick={() => void reproduzirPausar()}
                disabled={audios.length === 0}
                aria-label={tocando ? "Pausar reprodução" : "Iniciar reprodução"}
                className="play grid size-[72px] shrink-0 place-items-center rounded-full text-white transition-all duration-200 hover:scale-[1.05] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {tocando ? (
                  <Pause size={26} fill="currentColor" strokeWidth={0} />
                ) : (
                  <Play
                    size={26}
                    fill="currentColor"
                    strokeWidth={0}
                    className="translate-x-0.5"
                  />
                )}
              </button>

              {/* Botão e Painel de Volume */}
              <div className="relative" ref={volumeRef}>
                <button
                  type="button"
                  onClick={() => setVolumeAberto((atual) => !atual)}
                  aria-label="Controle de volume geral"
                  aria-expanded={volumeAberto}
                  className={`grid size-12 place-items-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                    volumeAberto
                      ? "bg-accent text-on-accent"
                      : "bg-[#EFEAF9] text-accent hover:bg-[#E4DCF5] dark:bg-[#252447] dark:text-[#9A72D8] dark:hover:bg-[#302E5C]"
                  }`}
                >
                  {somMutado ? (
                    <VolumeX size={20} strokeWidth={1.8} />
                  ) : volumeGeral < 50 ? (
                    <Volume1 size={20} strokeWidth={1.8} />
                  ) : (
                    <Volume2 size={20} strokeWidth={1.8} />
                  )}
                </button>

                {/* Popover Flutuante de Volume Geral */}
                {volumeAberto && (
                  <div
                    role="region"
                    aria-label="Painel de volume geral"
                    className="absolute left-1/2 top-[calc(100%+14px)] z-50 w-[270px] -translate-x-1/2 rounded-2xl border border-line bg-surface p-4 shadow-xl sm:w-[280px]"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-3">
                        Volume geral
                      </span>
                      <span className="font-mono text-xs tabular-nums text-fg">
                        {volumeGeral}%
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => definirVolumeGeral(somMutado ? 100 : 0)}
                        aria-label={somMutado ? "Reativar áudio" : "Silenciar áudio"}
                        className="text-fg-2 transition-colors hover:text-fg"
                      >
                        {somMutado ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      </button>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volumeGeral}
                        onChange={(e) => definirVolumeGeral(Number(e.target.value))}
                        aria-label="Controle deslizante de volume geral"
                        className="vol"
                        style={{ "--v": `${volumeGeral}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Alerta de erro de reprodução de áudio, se houver */}
            {erroReproducao && (
              <p
                role="alert"
                className="mt-6 max-w-md rounded-lg border border-rose-200 bg-rose-50/80 px-4 py-2 text-center text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
              >
                {erroReproducao}
              </p>
            )}

            {/* Aviso de temporizador ativo */}
            {timer.session && (
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                {statusLabel(timer.session)}
              </p>
            )}
          </div>
        )}

        {/* Cartão Inferior Esquerdo */}
        {!carregando && ambiente && (
          <div className="mt-auto pt-6 sm:fixed sm:bottom-7 sm:left-8 md:bottom-9 md:left-10 sm:mt-0 sm:pt-0">
            <div className="flex w-full items-center gap-3.5 rounded-2xl border border-line-subtle bg-surface/95 p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm sm:w-[270px] md:w-[290px] dark:border-line dark:bg-surface/95 dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
              <div className="size-14 shrink-0 overflow-hidden rounded-xl border border-line-subtle bg-bg-2">
                {ambiente.imagem ? (
                  <img
                    src={ambiente.imagem}
                    alt={ambiente.nome}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-icon-muted">
                    <AudioLines size={24} strokeWidth={1.4} aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold tracking-[-0.01em] text-fg">
                  {ambiente.nome}
                </h2>
                <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                  {ambiente.categoria || ambiente.finalidade} · {audios.length} {audios.length === 1 ? "SOM" : "SONS"}
                </p>
                <button
                  type="button"
                  onClick={() => setModalSonsAberto(true)}
                  className="mt-1 inline-flex items-center gap-1 text-[12px] text-fg-3 transition-colors hover:text-fg hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-focus"
                >
                  <span>Ver sons</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Sons Utilizados */}
      <ModalSonsUtilizados
        aberto={modalSonsAberto}
        aoFechar={() => setModalSonsAberto(false)}
        ambiente={ambiente}
      />

      {/* Botão de Ajuda */}
      <button
        type="button"
        disabled
        aria-label="Ajuda — disponível em breve"
        title="Ajuda disponível em breve"
        className="lift fixed bottom-5 right-5 z-20 grid size-11 cursor-not-allowed place-items-center rounded-full border border-line-subtle bg-surface font-mono text-[14px] text-fg-2 opacity-70"
      >
        ?
      </button>
    </div>
  );
}
