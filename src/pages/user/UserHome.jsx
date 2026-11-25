import {
  ArrowRight,
  Compass,
  Ellipsis,
  FolderOpen,
  Play,
  Plus,
  SlidersHorizontal,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "../../contexts/useAuth.js";
import homeMock from "../../mocks/home.mock.js";

/* =========================================================
   COMPONENTES AUXILIARES
   ========================================================= */

function SectionHeader({ title, action, to, id }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-line-subtle pb-3">
      <h2
        id={`${id}-heading`}
        className="text-lg font-medium tracking-[-0.02em]"
      >
        {title}
      </h2>

      {action && to ? (
        <Link
          to={to}
          className="
            inline-flex h-9 shrink-0 items-center gap-1.5
            rounded-sm text-[13px] font-medium text-accent
            hover:underline underline-offset-4
            outline-none focus-visible:ring-2
            focus-visible:ring-focus
          "
        >
          {action}
          <ArrowRight size={14} />
        </Link>
      ) : action ? (
        <span className="text-xs text-fg-3">{action}</span>
      ) : null}
    </div>
  );
}

/* =========================================================
   PLAY BUTTON
   ========================================================= */

function PlayButton({ label, className = "" }) {
  return (
    <button
      type="button"
      disabled
      aria-label={`Reproduzir ${label}`}
      title="Reprodução será integrada posteriormente"
      className={`
        grid size-11 place-items-center rounded-full
        bg-[#F4F1FA] text-accent
        transition-colors duration-200
        hover:bg-white
        disabled:cursor-default
        ${className}
      `}
    >
      <Play
        size={15}
        fill="currentColor"
        strokeWidth={0}
        className="translate-x-px"
      />
    </button>
  );
}

/* =========================================================
   RECENT ENVIRONMENT
   ========================================================= */

function RecentEnvironment({ environment }) {
  return (
    <li className="group relative">
      <div className="relative">
        {/* Imagem */}

        <div className="aspect-[4/3] overflow-hidden rounded-xl border border-line-subtle bg-bg-2">
          <img
            src={environment.image}
            alt=""
            loading="lazy"
            className="
              size-full object-cover
              transition-transform duration-500
              group-hover:scale-[1.02]
            "
          />
        </div>

        {/* Categoria */}

        {environment.category && (
          <span
            className="
              absolute left-3 top-3
              rounded-full bg-[#F4F1FA]/95
              px-2.5 py-1
              font-mono text-[10px] uppercase
              tracking-[0.18em] text-[#5a3f86]
            "
          >
            {environment.category}
          </span>
        )}

        {/* Mais ações */}

        <button
          type="button"
          disabled
          aria-label={`Mais ações para ${environment.title}`}
          title="Ações disponíveis posteriormente"
          className="
            absolute right-2 top-2 z-10
            grid size-10 place-items-center
            rounded-full bg-black/35 text-white
            transition-colors hover:bg-black/55
            disabled:cursor-default
          "
        >
          <Ellipsis size={18} strokeWidth={1.6} />
        </button>

        {/* Reprodução */}

        <PlayButton
          label={environment.title}
          className="absolute bottom-3 right-3 z-10"
        />
      </div>

      {/* Título */}

      <h3 className="mt-4 text-[15px] font-medium tracking-[-0.01em]">
        <Link
          to="/comum/ambientes"
          className="
            rounded-sm
            outline-none focus-visible:ring-2
            focus-visible:ring-focus
          "
        >
          {environment.title}
        </Link>
      </h3>

      {/* Descrição */}

      {environment.description && (
        <p className="mt-1.5 line-clamp-1 text-[13px] text-fg-2">
          {environment.description}
        </p>
      )}

      {/* Categoria textual */}

      {environment.category && (
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
          {environment.category}
        </p>
      )}

      {/* Sons */}

      <p className="mt-1.5 truncate text-[13px] text-fg-3">
        {environment.sounds.join(" · ")}
      </p>
    </li>
  );
}

/* =========================================================
   COLLECTION ITEM
   Coleções ainda não possuem página/rota funcional.
   ========================================================= */

function CollectionItem({ collection }) {
  return (
    <li>
      <div
        className="
          -mx-2 flex items-center gap-4
          rounded-lg px-2 py-3
          transition-colors duration-200
          hover:bg-surface-hover
        "
      >
        {/* Thumbnail */}

        <span
          aria-hidden="true"
          className="
            grid size-[52px] shrink-0
            place-items-center overflow-hidden
            rounded-xl border border-line-subtle
            bg-bg-2
          "
        >
          {collection.image ? (
            <img
              src={collection.image}
              alt=""
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <FolderOpen
              size={16}
              strokeWidth={1.3}
              className="text-icon-muted"
            />
          )}
        </span>

        {/* Informações */}

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-fg">
            {collection.name}
          </span>

          <span
            className="
              mt-1 block font-mono text-[10px]
              uppercase tracking-[0.18em] text-fg-3
            "
          >
            {collection.environmentCount}{" "}
            {collection.environmentCount === 1 ? "ambiente" : "ambientes"}
          </span>
        </span>
      </div>
    </li>
  );
}

/* =========================================================
   QUICK ACCESS ITEM
   ========================================================= */

function QuickAccessItem({
  icon: Icon,
  title,
  description,
  to,
  disabled = false,
}) {
  const content = (
    <>
      <span
        className="
          grid size-9 shrink-0 place-items-center
          rounded-lg bg-accent-soft text-accent
        "
      >
        <Icon size={17} strokeWidth={1.6} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-fg">{title}</span>

        <span className="block truncate text-[13px] text-fg-3">
          {description}
        </span>
      </span>

      <ArrowRight size={15} className="shrink-0 text-icon-muted" />
    </>
  );

  const className = `
    -mx-2 flex min-h-14 w-full items-center gap-3.5
    rounded-lg px-2 py-2.5 text-left
    transition-colors duration-200
    outline-none focus-visible:ring-2
    focus-visible:ring-focus
    ${disabled ? "cursor-default opacity-70" : "hover:bg-surface-hover"}
  `;

  if (disabled) {
    return (
      <li>
        <div className={className}>{content}</div>
      </li>
    );
  }

  return (
    <li>
      <Link to={to} className={className}>
        {content}
      </Link>
    </li>
  );
}

/* =========================================================
   USER HOME
   ========================================================= */

export default function UserHome() {
  const { usuario } = useAuth();

  const nome = usuario?.nome?.trim().split(/\s+/)[0] || "usuário";

  const { summary, continueListening, recentEnvironments, collections } =
    homeMock;

  return (
    <main
      id="conteudo"
      tabIndex="-1"
      className="
        mx-auto w-full max-w-[1120px]
        px-5 pt-8 outline-none
        md:px-10 md:pt-14
        pb-28 md:pb-20
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="min-w-0 max-w-xl">
          <p className="user-page-eyebrow">Minha área</p>

          <h1 className="user-page-title">Olá, {nome}</h1>

          <p className="user-page-description">
            {summary.environments} ambientes criados e {summary.collections}{" "}
            coleções guardadas na sua conta.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/comum/ambientes"
            className="
              user-button user-button-primary
              user-button-md inline-flex
            "
          >
            <Plus size={16} strokeWidth={1.8} />
            Novo ambiente
          </Link>
        </div>
      </header>

      {/* =====================================================
          CONTINUE LISTENING
      ===================================================== */}

      <section
        aria-labelledby="continuar"
        className="
          mt-12 grid overflow-hidden
          rounded-xl border border-line-subtle
          bg-surface
          md:grid-cols-[5fr_6fr]
        "
      >
        {/* Imagem */}

        <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[300px]">
          <img
            src={continueListening.image}
            alt="Plantas na janela durante a chuva"
            className="absolute inset-0 size-full object-cover"
          />
        </div>

        {/* Conteúdo */}

        <div className="flex flex-col justify-center p-6 md:p-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            Continuar de onde parou · {continueListening.lastPlayed}
          </p>

          <h2
            id="continuar"
            className="
              mt-3 text-[30px] font-light
              leading-tight tracking-[-0.04em]
              md:text-[36px]
            "
          >
            {continueListening.title}
          </h2>

          <p className="mt-3 text-sm text-fg-2">
            {continueListening.sounds.join(" · ")}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled
              className="
                user-button user-button-primary
                user-button-md
              "
              title="Player será integrado posteriormente"
            >
              <Play size={16} fill="currentColor" strokeWidth={0} />
              Reproduzir
            </button>

            <Link
              to="/comum/ambientes"
              className="
                inline-flex h-11 items-center
                rounded-[10px] px-4 text-sm
                font-medium text-fg-2
                transition-colors duration-200
                hover:bg-surface-hover hover:text-fg
                outline-none focus-visible:ring-2
                focus-visible:ring-focus
              "
            >
              Ver ambiente
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT COLUMNS
      ===================================================== */}

      <div
        className="
          mt-16 grid gap-16
          lg:grid-cols-[minmax(0,1fr)_300px]
          lg:gap-14
        "
      >
        {/* ===================================================
            LEFT COLUMN — RECENT ENVIRONMENTS
        =================================================== */}

        <section aria-labelledby="recentes-heading">
          <SectionHeader
            id="recentes"
            title="Ouvidos recentemente"
            action="Ambientes"
            to="/comum/ambientes"
          />

          <ul className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2">
            {recentEnvironments.map((environment) => (
              <RecentEnvironment
                key={environment.id}
                environment={environment}
              />
            ))}
          </ul>
        </section>

        {/* ===================================================
            RIGHT COLUMN
        =================================================== */}

        <div className="space-y-12">
          {/* COLLECTIONS */}

          <section aria-labelledby="colecoes-heading">
            <SectionHeader
              id="colecoes"
              title="Suas coleções"
              action="Em breve"
            />

            <ul className="divide-y divide-line-subtle">
              {collections.map((collection) => (
                <CollectionItem key={collection.id} collection={collection} />
              ))}
            </ul>
          </section>

          {/* QUICK ACCESS */}

          <section aria-labelledby="atalhos-heading">
            <SectionHeader id="atalhos" title="Atalhos" />

            <ul className="divide-y divide-line-subtle">
              <QuickAccessItem
                icon={SlidersHorizontal}
                title="Criar ambiente"
                description="Misture sons e ajuste cada volume"
                to="/comum/ambientes"
              />

              <QuickAccessItem
                icon={FolderOpen}
                title="Organizar coleções"
                description="Ordene seus ambientes em sequências"
                disabled
              />

              <QuickAccessItem
                icon={Compass}
                title="Ambientes prontos"
                description="Combinações da plataforma"
                to="/comum/ambientes"
              />
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
