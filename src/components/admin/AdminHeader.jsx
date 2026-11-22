import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, Sun, Moon, ExternalLink } from "lucide-react";

/**
 * Cabeçalho superior do painel administrativo.
 *
 * @param {{ titulo?: string, onAbrirMenu: () => void }} props
 */
export default function AdminHeader({ titulo = "Visão geral", onAbrirMenu }) {
  const [temaEscuro, setTemaEscuro] = useState(() => {
    return (
      localStorage.getItem("sonessia-theme") === "dark" ||
      document.documentElement.classList.contains("dark")
    );
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", temaEscuro);
    localStorage.setItem("sonessia-theme", temaEscuro ? "dark" : "light");
  }, [temaEscuro]);

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-line-subtle bg-surface px-4 sm:px-8">
      {/* Lado esquerdo: Botão mobile + Título e Contexto */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onAbrirMenu}
          aria-label="Abrir menu de navegação lateral"
          className="rounded-lg p-2 text-icon-2 transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-fg-3">
            <span>Administração</span>
            <span>/</span>
            <span className="text-fg-2">{titulo}</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-fg sm:text-xl">
            {titulo}
          </h1>
        </div>
      </div>

      {/* Lado direito: Ações (Ver site, Tema) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Link para visualização da plataforma pública */}
        <Link
          to="/"
          title="Abrir plataforma pública Sonessia"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-line-subtle bg-bg px-3 py-1.5 text-xs font-medium text-fg-2 transition-colors hover:border-line hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <span>Ver plataforma</span>
          <ExternalLink size={13} className="text-icon-muted" />
        </Link>

        {/* Alternador de tema Claro / Escuro */}
        <button
          type="button"
          onClick={() => setTemaEscuro((v) => !v)}
          aria-label={temaEscuro ? "Ativar modo claro" : "Ativar modo escuro"}
          aria-pressed={temaEscuro}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line-subtle bg-bg text-icon-2 transition-colors hover:border-line hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {temaEscuro ? (
            <Sun size={17} strokeWidth={1.8} />
          ) : (
            <Moon size={17} strokeWidth={1.8} />
          )}
        </button>
      </div>
    </header>
  );
}
