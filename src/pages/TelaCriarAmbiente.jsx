import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth.js";
import { audioService, ambienteService } from "../services/sons.service.js";
import { categoriasService } from "../services/categorias.service.js";
import { CabecalhoPublico } from "../components/CabecalhoPublico.jsx";
import { PainelReproducao } from "../components/PainelReproducao.jsx";
import { ControleSom } from "../components/ControleSom.jsx";
import { useReprodutor } from "../hooks/useReprodutor.js";

// Mapeamento de categorias do backend para rótulos exibidos na UI
const CATEGORIAS = [
  { valor: "TODOS", rotulo: "Todos" },
  { valor: "NATUREZA", rotulo: "Natureza" },
  { valor: "INSTRUMENTAL", rotulo: "Instrumental" },
  { valor: "AMBIENTE", rotulo: "Ambiente" },
  { valor: "RUIDO", rotulo: "Ruídos" },
];

// Opções de temporizador em minutos
const OPCOES_TEMPORIZADOR = [15, 30, 45, 60];

/** Ícone de lixeira */
function IconeLixeira() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

/** Ícone de salvar */
function IconeSalvar() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

/** Ícone de interrogação para botão de ajuda */
function IconeAjuda() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/**
 * Modal para salvar ambiente sonoro.
 */
function ModalSalvarAmbiente({ onFechar, onSalvar, salvando, erro, categorias }) {
  const [nome, setNome] = useState("");
  const [idCategoria, setIdCategoria] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSalvar({ nome: nome.trim(), idCategoria });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-salvar-titulo"
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
        }}
      >
        <h2
          id="modal-salvar-titulo"
          className="text-base font-bold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Salvar ambiente sonoro
        </h2>

        {erro && (
          <div
            className="mb-4 rounded-lg p-3 text-sm"
            style={{
              backgroundColor: "#FEF2F2",
              color: "#B91C1C",
              border: "1px solid #FCA5A5",
            }}
            role="alert"
          >
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="nome-ambiente"
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              Nome do ambiente
            </label>
            <input
              id="nome-ambiente"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Foco para estudo"
              required
              maxLength={255}
              className="w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:outline-none"
              style={{
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text-primary)",
                borderColor: "var(--color-border)",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="categoria-ambiente"
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              Categoria
            </label>
            <select
              id="categoria-ambiente"
              value={idCategoria}
              onChange={(e) => setIdCategoria(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:outline-none"
              style={{
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text-primary)",
                borderColor: "var(--color-border)",
              }}
            >
              <option value="" disabled>Selecione uma categoria</option>
              {categorias.map((categoria) => (
                <option key={categoria.idCategoria} value={categoria.idCategoria}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onFechar}
              disabled={salvando}
              className="flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors cursor-pointer"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                color: "var(--color-text-secondary)",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando || !nome.trim()}
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "var(--color-on-accent)",
              }}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Modal de configuração do temporizador.
 */
function ModalTemporizador({
  onFechar,
  onDefinirTemporizador,
  temporizadorAtivo,
  onCancelarTemporizador,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-timer-titulo"
    >
      <div
        className="w-full max-w-xs rounded-2xl p-6 shadow-2xl text-center"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
        }}
      >
        <h2
          id="modal-timer-titulo"
          className="text-base font-bold mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Temporizador
        </h2>
        <p
          className="text-xs mb-5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Pausar a reprodução automaticamente após o tempo escolhido.
        </p>

        {temporizadorAtivo ? (
          <div className="mb-4">
            <p
              className="text-sm font-medium mb-3"
              style={{ color: "var(--color-accent)" }}
            >
              Temporizador ativo
            </p>
            <button
              type="button"
              onClick={() => {
                onCancelarTemporizador();
                onFechar();
              }}
              className="w-full py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-colors"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                color: "#DC2626",
              }}
            >
              Desativar temporizador
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {OPCOES_TEMPORIZADOR.map((minutos) => (
              <button
                key={minutos}
                type="button"
                onClick={() => {
                  onDefinirTemporizador(minutos);
                  onFechar();
                }}
                className="py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  color: "var(--color-text-primary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-surface-hover)";
                  e.currentTarget.style.color = "var(--color-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-bg-secondary)";
                  e.currentTarget.style.color = "var(--color-text-primary)";
                }}
              >
                {minutos} min
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onFechar}
          className="text-xs font-medium cursor-pointer"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

/**
 * Modal de ajuda e suporte.
 */
function ModalAjuda({ onFechar }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-ajuda-titulo"
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border-subtle)",
        }}
      >
        <h2
          id="modal-ajuda-titulo"
          className="text-base font-bold mb-3"
          style={{ color: "var(--color-text-primary)" }}
        >
          Ajuda Sonessia
        </h2>
        <div
          className="text-xs leading-relaxed space-y-2.5 mb-5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <p>
            O <strong>Sonessia</strong> permite criar ambientes sonoros
            acústicos personalizados para relaxamento, foco, estudo e sono.
          </p>
          <p>
            <strong>Como usar:</strong>
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              Navegue pelas categorias para encontrar os tipos de sons
              desejados.
            </li>
            <li>
              Ajuste o slider de cada som para definir seu volume individual.
            </li>
            <li>
              Use o botão Play/Pause central para iniciar ou pausar toda a
              composição.
            </li>
            <li>
              Use &quot;Salvar ambiente&quot; para registrar sua combinação
              favorita na sua conta.
            </li>
          </ul>
        </div>
        <button
          type="button"
          onClick={onFechar}
          className="w-full py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-colors"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "var(--color-on-accent)",
          }}
        >
          Entendi
        </button>
      </div>
    </div>
  );
}

/**
 * Tela inicial pública do Sonessia — Criar ambiente sonoro.
 *
 * @param {{ tema: 'light'|'dark', alternarTema: () => void }} props
 */
export function TelaCriarAmbiente({ tema, alternarTema }) {
  const navigate = useNavigate();
  const { estaAutenticado, token } = useAuth();

  const [audios, setAudios] = useState([]);
  const [carregandoAudios, setCarregandoAudios] = useState(true);
  const [erroAudios, setErroAudios] = useState("");
  const [categoriasAmbiente, setCategoriasAmbiente] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("TODOS");
  const [secaoAtiva, setSecaoAtiva] = useState("criar");

  // Ambientes prontos
  const [ambientesProntos, setAmbientesProntos] = useState([]);
  const [carregandoProntos, setCarregandoProntos] = useState(false);

  // Modal salvar
  const [mostrarModalSalvar, setMostrarModalSalvar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  // Temporizador e Ajuda
  const [mostrarModalTimer, setMostrarModalTimer] = useState(false);
  const [mostrarModalAjuda, setMostrarModalAjuda] = useState(false);
  const [timerRestante, setTimerRestante] = useState(null); // em segundos

  const reprodutor = useReprodutor();
  const { inicializarAudio, reproduzirPausar } = reprodutor;

  useEffect(() => {
    let ativo = true;
    categoriasService.listar(token, "AMBIENTE").then((resposta) => {
      if (ativo) setCategoriasAmbiente((resposta?.categorias ?? []).filter((item) => item.tipo === "AMBIENTE" && item.ativa));
    }).catch(() => { if (ativo) setCategoriasAmbiente([]); });
    return () => { ativo = false; };
  }, [token]);

  // Carregar áudios da API
  useEffect(() => {
    let ativo = true;

    audioService
      .listarAudios()
      .then((dados) => {
        if (!ativo) return;
        const listaBruta = dados?.audios ?? [];
        // Normaliza campos caso o backend retorne idAudio / arquivo
        const listaNormalizada = listaBruta.map((a) => ({
          ...a,
          id: a.idAudio || a.id,
          idAudio: a.idAudio || a.id,
          arquivo: a.arquivo || a.urlArquivo,
          urlArquivo: a.arquivo || a.urlArquivo,
        }));
        setAudios(listaNormalizada);
        listaNormalizada.forEach((a) => {
          if (a.arquivo) {
            inicializarAudio(a.id, a.arquivo);
          }
        });
        setCarregandoAudios(false);
      })
      .catch(() => {
        if (!ativo) return;
        setErroAudios(
          "Não foi possível carregar os sons. Verifique sua conexão.",
        );
        setCarregandoAudios(false);
      });

    return () => {
      ativo = false;
    };
  }, [inicializarAudio]);

  // Carregar ambientes prontos ao trocar para a aba correspondente
  useEffect(() => {
    if (secaoAtiva === "prontos" && ambientesProntos.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCarregandoProntos(true);
      ambienteService
        .listarAmbientesPublicos()
        .then((dados) => {
          setAmbientesProntos(dados?.ambientes ?? []);
        })
        .catch(() => {
          setAmbientesProntos([]);
        })
        .finally(() => {
          setCarregandoProntos(false);
        });
    }
  }, [secaoAtiva, ambientesProntos.length]);

  // Gerenciamento do temporizador
  useEffect(() => {
    if (timerRestante === null || timerRestante <= 0) return;

    const intervalo = setInterval(() => {
      setTimerRestante((antigo) => {
        if (antigo === null || antigo <= 1) {
          clearInterval(intervalo);
          // Pausa a reprodução ao término do temporizador
          if (reprodutor.tocando) {
            reproduzirPausar();
          }
          return null;
        }
        return antigo - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [timerRestante, reprodutor.tocando, reproduzirPausar]);

  function definirTemporizador(minutos) {
    setTimerRestante(minutos * 60);
  }

  function cancelarTemporizador() {
    setTimerRestante(null);
  }

  // Filtrar por categoria
  const audiosFiltrados =
    categoriaAtiva === "TODOS"
      ? audios
      : audios.filter((a) => a.categoria === categoriaAtiva);

  // Limpar composição
  function handleLimpar() {
    reprodutor.limparTudo();
    setMensagemSucesso("");
  }

  // Salvar ambiente
  async function handleSalvar({ nome, idCategoria }) {
    if (!estaAutenticado) {
      navigate("/login");
      return;
    }

    const audiosAtivos = audios
      .filter((a) => (reprodutor.volumes[a.id] ?? 0) > 0)
      .map((a) => ({ idAudio: a.id, volume: reprodutor.volumes[a.id] }));

    if (audiosAtivos.length === 0) {
      setErroSalvar("Ajuste o volume de pelo menos um som antes de salvar.");
      return;
    }

    setSalvando(true);
    setErroSalvar("");

    try {
      await ambienteService.criarAmbiente(token, {
        nome,
        idCategoria,
        audios: audiosAtivos,
      });
      setMostrarModalSalvar(false);
      setMensagemSucesso("Ambiente salvo com sucesso!");
      setTimeout(() => setMensagemSucesso(""), 4000);
    } catch (err) {
      setErroSalvar(
        err.message || "Não foi possível salvar o ambiente. Tente novamente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  function abrirModalSalvar() {
    if (!estaAutenticado) {
      navigate("/login");
      return;
    }
    setErroSalvar("");
    setMostrarModalSalvar(true);
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <CabecalhoPublico
        tema={tema}
        alternarTema={alternarTema}
        secaoAtiva={secaoAtiva}
        aoMudarSecao={setSecaoAtiva}
      />

      {/* Conteúdo principal centralizado */}
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-20">
        {secaoAtiva === "prontos" ? (
          /* Seção: Ambientes Prontos */
          <div>
            <div className="text-center mb-10">
              <h1
                className="text-5xl sm:text-6xl font-light tracking-tight mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                Ambientes Prontos
              </h1>
              <p
                className="text-sm sm:text-base leading-relaxed mx-auto max-w-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Explore combinações sonoras pré-configuradas para diferentes
                categorias dinâmicas.
              </p>
            </div>

            {carregandoProntos ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <svg
                  className="animate-spin"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: "var(--color-icon-muted)" }}
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M22 12a10 10 0 0 0-10-10" />
                </svg>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Carregando ambientes...
                </span>
              </div>
            ) : ambientesProntos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Nenhum ambiente pronto disponível no momento.
                </p>
                <button
                  type="button"
                  onClick={() => setSecaoAtiva("criar")}
                  className="px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-on-accent)",
                  }}
                >
                  Criar seu próprio ambiente
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {ambientesProntos.map((amb) => (
                  <div
                    key={amb.idAmbienteSonoro || amb.id}
                    className="p-5 rounded-2xl border"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      borderColor: "var(--color-border-subtle)",
                    }}
                  >
                    <h3
                      className="font-semibold text-base mb-1"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {amb.nome}
                    </h3>
                    {amb.descricao && (
                      <p
                        className="text-xs mb-3 line-clamp-2"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {amb.descricao}
                      </p>
                    )}
                    <span
                      className="inline-block px-2.5 py-1 text-[11px] font-medium rounded-md"
                      style={{
                        backgroundColor: "var(--color-accent-soft)",
                        color: "var(--color-accent)",
                      }}
                    >
                      {amb.categoria}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Seção Principal: Criar Ambiente */
          <>
            {/* Título e descrição */}
            <div className="text-center mb-10">
              <h1
                className="text-6xl sm:text-7xl font-light tracking-tight mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                Sons
              </h1>
              <p
                className="text-sm sm:text-base leading-relaxed mx-auto max-w-xs sm:max-w-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Customize seu próprio ambiente sonoro com diferentes opções de
                sons.
              </p>
            </div>

            {/* Filtros de categoria */}
            <div className="flex justify-center mb-8">
              <div
                className="inline-flex items-center gap-1 p-1 rounded-xl"
                style={{ backgroundColor: "var(--color-bg-secondary)" }}
                role="group"
                aria-label="Filtrar sons por categoria"
              >
                {CATEGORIAS.map((cat) => {
                  const ativo = categoriaAtiva === cat.valor;
                  return (
                    <button
                      key={cat.valor}
                      type="button"
                      onClick={() => setCategoriaAtiva(cat.valor)}
                      aria-pressed={ativo}
                      className="px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer"
                      style={{
                        backgroundColor: ativo
                          ? "var(--color-accent)"
                          : "transparent",
                        color: ativo
                          ? "var(--color-on-accent)"
                          : "var(--color-text-secondary)",
                      }}
                      onMouseEnter={(e) => {
                        if (!ativo)
                          e.currentTarget.style.backgroundColor =
                            "var(--color-surface-hover)";
                      }}
                      onMouseLeave={(e) => {
                        if (!ativo)
                          e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {cat.rotulo}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Painel de reprodução */}
            <div className="flex justify-center mb-10">
              <PainelReproducao
                tocando={reprodutor.tocando}
                sonsAtivos={reprodutor.sonsAtivos}
                volumeGeral={reprodutor.volumeGeral}
                onReproduirPausar={reprodutor.reproduzirPausar}
                onVolumeGeral={reprodutor.definirVolumeGeral}
                onTemporizador={() => setMostrarModalTimer(true)}
              />
            </div>

            {/* Área dos sons */}
            {carregandoAudios ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <svg
                  className="animate-spin"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: "var(--color-icon-muted)" }}
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M22 12a10 10 0 0 0-10-10" />
                </svg>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Carregando sons...
                </span>
              </div>
            ) : erroAudios ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {erroAudios}
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="text-xs font-semibold mt-1 cursor-pointer"
                  style={{ color: "var(--color-accent)" }}
                >
                  Tentar novamente
                </button>
              </div>
            ) : audiosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{ color: "var(--color-icon-muted)" }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8" />
                </svg>
                <p
                  className="text-sm mt-2"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Nenhum som disponível nesta categoria.
                </p>
                {categoriaAtiva !== "TODOS" && (
                  <button
                    type="button"
                    onClick={() => setCategoriaAtiva("TODOS")}
                    className="text-xs font-semibold mt-1 cursor-pointer"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Ver todos os sons
                  </button>
                )}
              </div>
            ) : (
              /* Grid horizontal de controles */
              <div className="overflow-x-auto scrollbar-thin pb-2 -mx-4 px-4">
                <div
                  className="grid gap-8 justify-center"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(audiosFiltrados.length, 3)}, minmax(140px, 180px))`,
                    minWidth:
                      audiosFiltrados.length > 3
                        ? `${audiosFiltrados.length * 160}px`
                        : undefined,
                  }}
                >
                  {audiosFiltrados.map((audio) => (
                    <ControleSom
                      key={audio.id}
                      audio={audio}
                      volume={reprodutor.volumes[audio.id] ?? 0}
                      aoMudarVolume={reprodutor.definirVolume}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Linha divisória e ações */}
            {!carregandoAudios && !erroAudios && (
              <div
                className="mt-10 pt-5 border-t flex items-center justify-between"
                style={{ borderColor: "var(--color-border-subtle)" }}
              >
                {/* Limpar composição */}
                <button
                  type="button"
                  onClick={handleLimpar}
                  className="inline-flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
                  style={{ color: "var(--color-text-disabled)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--color-text-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--color-text-disabled)";
                  }}
                  aria-label="Limpar composição atual"
                >
                  <IconeLixeira />
                  Limpar composição
                </button>

                {/* Mensagem de sucesso */}
                {mensagemSucesso && (
                  <span
                    className="text-xs font-medium animate-pulse"
                    style={{ color: "var(--color-accent)" }}
                    role="status"
                    aria-live="polite"
                  >
                    {mensagemSucesso}
                  </span>
                )}

                {/* Salvar ambiente */}
                <button
                  type="button"
                  onClick={abrirModalSalvar}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-on-accent)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--color-accent-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--color-accent)";
                  }}
                  aria-label="Salvar ambiente sonoro atual"
                >
                  <IconeSalvar />
                  Salvar ambiente
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Botão flutuante de ajuda */}
      <button
        type="button"
        onClick={() => setMostrarModalAjuda(true)}
        aria-label="Ajuda e informações"
        className="fixed bottom-6 right-6 z-30 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer"
        style={{
          backgroundColor: "var(--color-surface)",
          color: "var(--color-icon-secondary)",
          border: "1px solid var(--color-border-subtle)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--color-surface-hover)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--color-surface)";
          e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
        }}
      >
        <IconeAjuda />
      </button>

      {/* Modal salvar ambiente */}
      {mostrarModalSalvar && (
        <ModalSalvarAmbiente
          onFechar={() => {
            setMostrarModalSalvar(false);
            setErroSalvar("");
          }}
          onSalvar={handleSalvar}
          salvando={salvando}
          erro={erroSalvar}
          categorias={categoriasAmbiente}
        />
      )}

      {/* Modal temporizador */}
      {mostrarModalTimer && (
        <ModalTemporizador
          onFechar={() => setMostrarModalTimer(false)}
          onDefinirTemporizador={definirTemporizador}
          temporizadorAtivo={timerRestante !== null}
          onCancelarTemporizador={cancelarTemporizador}
        />
      )}

      {/* Modal ajuda */}
      {mostrarModalAjuda && (
        <ModalAjuda onFechar={() => setMostrarModalAjuda(false)} />
      )}
    </div>
  );
}
