import { useAuth } from "../../contexts/useAuth.js";
import {
  BarChart3,
  Music,
  Sparkles,
  Users,
  Activity,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { usuario } = useAuth();
  const primeiroNome = usuario?.nome?.split(" ")?.[0] || "Administrador";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Banner de Boas-vindas */}
      <section
        aria-label="Boas-vindas"
        className="relative overflow-hidden rounded-2xl border border-line-subtle bg-surface p-6 sm:p-8"
      >
        {/* Glow decorativo sutil da marca */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-10 blur-3xl"
          style={{
            background: "radial-gradient(circle, #7656A8 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-line-subtle bg-bg px-3 py-1 text-xs font-medium text-accent">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            Área de Administração
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            Olá, {primeiroNome}. Bem-vindo ao painel Sonessia.
          </h2>

          <p className="mt-2 text-sm sm:text-base leading-relaxed text-fg-2">
            Esta é a área administrativa central do Sonessia. A partir daqui você terá o controle
            estratégico de catálogo de sons, ambientes acústicos, categorias sonoras e configurações gerais.
          </p>
        </div>
      </section>

      {/* Grade de Espaço Reservado para Indicadores Principais */}
      <section aria-label="Métricas e Indicadores">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-accent" />
            <h3 className="text-base font-semibold text-fg">
              Indicadores do Sistema
            </h3>
          </div>
          <span className="text-xs font-medium text-fg-3">
            Métricas em preparação
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card Reservado: Catálogo de Áudios */}
          <div className="flex flex-col justify-between rounded-xl border border-line-subtle bg-surface p-5 transition-shadow hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-fg-3">
                Catálogo de Áudios
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Music size={18} />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-8 w-24 rounded-md bg-line-subtle/50" />
              <p className="mt-2 text-xs text-fg-3">
                Espaço reservado para total de áudios cadastrados
              </p>
            </div>
          </div>

          {/* Card Reservado: Ambientes Prontos */}
          <div className="flex flex-col justify-between rounded-xl border border-line-subtle bg-surface p-5 transition-shadow hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-fg-3">
                Ambientes Prontos
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Sparkles size={18} />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-8 w-24 rounded-md bg-line-subtle/50" />
              <p className="mt-2 text-xs text-fg-3">
                Espaço reservado para composições em destaque
              </p>
            </div>
          </div>

          {/* Card Reservado: Usuários da Plataforma */}
          <div className="flex flex-col justify-between rounded-xl border border-line-subtle bg-surface p-5 transition-shadow hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-fg-3">
                Usuários
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-8 w-24 rounded-md bg-line-subtle/50" />
              <p className="mt-2 text-xs text-fg-3">
                Espaço reservado para base de usuários ativos
              </p>
            </div>
          </div>

          {/* Card Reservado: Atividade Sonora */}
          <div className="flex flex-col justify-between rounded-xl border border-line-subtle bg-surface p-5 transition-shadow hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-fg-3">
                Reproduções
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Activity size={18} />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-8 w-24 rounded-md bg-line-subtle/50" />
              <p className="mt-2 text-xs text-fg-3">
                Espaço reservado para sessões de escuta ativas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Gráficos e Atividades (Layout Estrutural) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gráfico Principal de Atividade Acústica */}
        <section
          aria-label="Atividade Acústica"
          className="flex flex-col justify-between rounded-2xl border border-line-subtle bg-surface p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between border-b border-line-subtle pb-4">
            <div>
              <h3 className="text-base font-semibold text-fg">
                Atividade Sonora e Engajamento
              </h3>
              <p className="text-xs text-fg-3">
                Acompanhamento temporal de criação e reprodução de ambientes
              </p>
            </div>
            <span className="rounded-md border border-line-subtle bg-bg px-2 py-1 text-xs font-medium text-fg-3">
              Últimos 30 dias
            </span>
          </div>

          {/* Área reservada para renderização do gráfico */}
          <div className="my-8 flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-line-strong/40 bg-bg/50 p-8 text-center">
            <BarChart3 size={36} className="text-icon-muted mb-3" />
            <p className="text-sm font-medium text-fg-2">
              Espaço reservado para visualização gráfica
            </p>
            <p className="mt-1 max-w-sm text-xs text-fg-3">
              Os gráficos interativos de fluxo de reproduções e novas composições serão conectados nesta área na próxima etapa.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-fg-3">
            <span>Métricas geradas em tempo real</span>
            <span>Sonessia Analytics Engine</span>
          </div>
        </section>

        {/* Painel Lateral: Atalhos e Módulos em Desenvolvimento */}
        <section
          aria-label="Módulos Administrativos"
          className="flex flex-col justify-between rounded-2xl border border-line-subtle bg-surface p-6"
        >
          <div>
            <div className="flex items-center justify-between border-b border-line-subtle pb-4">
              <h3 className="text-base font-semibold text-fg">
                Módulos de Gestão
              </h3>
              <Layers size={18} className="text-accent" />
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-line-subtle bg-bg p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-fg">Gerenciar Sons</span>
                  <span className="rounded bg-line-subtle px-1.5 py-0.5 text-[10px] font-medium text-fg-3">
                    Em breve
                  </span>
                </div>
                <p className="mt-1 text-xs text-fg-3">
                  Upload, categorização e controle de faixas de ruídos e instrumentos.
                </p>
              </div>

              <div className="rounded-xl border border-line-subtle bg-bg p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-fg">Curadoria de Ambientes</span>
                  <span className="rounded bg-line-subtle px-1.5 py-0.5 text-[10px] font-medium text-fg-3">
                    Em breve
                  </span>
                </div>
                <p className="mt-1 text-xs text-fg-3">
                  Montagem de composições pré-definidas para foco, sono e meditação.
                </p>
              </div>

              <div className="rounded-xl border border-line-subtle bg-bg p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-fg">Taxonomia e Tags</span>
                  <span className="rounded bg-line-subtle px-1.5 py-0.5 text-[10px] font-medium text-fg-3">
                    Em breve
                  </span>
                </div>
                <p className="mt-1 text-xs text-fg-3">
                  Organização de categorias sonoras por frequência e estilo.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-line-subtle pt-4">
            <Link
              to="/"
              className="flex items-center justify-between text-xs font-semibold text-accent transition-colors hover:text-accent-hover"
            >
              <span>Acessar plataforma pública</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
