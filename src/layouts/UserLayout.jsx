import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import UserSidebar from "../components/user/UserSidebar.jsx";
import PlayerCompacto from "../components/user/PlayerCompacto.jsx";
import { ToastProvider } from "../components/user/ui/UserFeedback.jsx";

/**
 * Layout compartilhado para todas as páginas da área autenticada do usuário comum.
 */
export default function UserLayout() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <ToastProvider>
    <div className="flex min-h-screen w-full bg-bg text-fg">
      {/* Sidebar fixa à esquerda */}
      <UserSidebar
        menuAberto={menuAberto}
        onFecharMenu={() => setMenuAberto(false)}
      />

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative">
        {/* Barra superior apenas em telas móveis para abrir o menu */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line-subtle bg-surface px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu de navegação lateral"
            className="rounded-lg p-2 text-icon-2 transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <Menu size={22} />
          </button>

          <span className="text-sm font-semibold text-fg">Sonessia</span>

          <div className="size-8" />
        </header>

        {/* Área de rolagem e renderização da rota interna */}
        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </main>

        {/* Player compacto flutuante na área autenticada */}
        <PlayerCompacto />
      </div>
    </div>
    </ToastProvider>
  );
}
