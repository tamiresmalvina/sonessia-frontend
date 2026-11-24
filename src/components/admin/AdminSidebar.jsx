import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Music,
  Sparkles,
  FolderTree,
  Settings,
  LogOut,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../contexts/useAuth.js";

/**
 * Ícone vetorial oficial das 5 barras sonoras do Sonessia.
 */
function LogoIcone() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="admin-logo-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9B51B6" />
          <stop offset="50%" stopColor="#7656A8" />
          <stop offset="100%" stopColor="#5E67CE" />
        </linearGradient>
      </defs>
      <rect x="5.5" y="14.5" width="4" height="11" rx="2" fill="url(#admin-logo-grad)" />
      <rect x="12.5" y="9.5" width="4" height="21" rx="2" fill="url(#admin-logo-grad)" />
      <rect x="19.5" y="6" width="4" height="28" rx="2" fill="url(#admin-logo-grad)" />
      <rect x="26.5" y="11.5" width="4" height="17" rx="2" fill="url(#admin-logo-grad)" />
      <rect x="33.5" y="16" width="4" height="8" rx="2" fill="url(#admin-logo-grad)" />
    </svg>
  );
}

const ITENS_MENU = [
  {
    nome: "Visão geral",
    rota: "/admin",
    icone: LayoutDashboard,
    disponivel: true,
  },
  {
    nome: "Áudios",
    rota: "/admin/audios",
    icone: Music,
    disponivel: true,
  },
  {
    nome: "Ambientes prontos",
    rota: "/admin/ambientes",
    icone: Sparkles,
    disponivel: true,
  },
  {
    nome: "Categorias",
    rota: "/admin/categorias",
    icone: FolderTree,
    disponivel: true,
  },
  {
    nome: "Configurações",
    rota: "/admin/configuracoes",
    icone: Settings,
    disponivel: true,
  },
];

/**
 * Menu lateral do painel administrativo do Sonessia.
 *
 * @param {{ menuAberto: boolean, onFecharMenu: () => void }} props
 */
export default function AdminSidebar({ menuAberto, onFecharMenu }) {
  const { usuario, logout } = useAuth();

  // Iniciais do nome do administrador para avatar
  const iniciais = (usuario?.nome || "Admin")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");

  return (
    <>
      {/* Overlay escuro em dispositivos móveis */}
      {menuAberto && (
        <div
          role="presentation"
          onClick={onFecharMenu}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line-subtle bg-surface transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          menuAberto ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menu administrativo"
      >
        {/* Topo do menu: Logo Sonessia + Badge Admin */}
        <div className="flex h-[72px] items-center justify-between border-b border-line-subtle px-6">
          <div className="flex items-center gap-3">
            <LogoIcone />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-bold tracking-tight text-fg">
                  Sonessia
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent dark:bg-accent-soft/80">
                  <ShieldCheck size={11} strokeWidth={2.5} />
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] font-medium text-fg-3">
                Painel Administrativo
              </p>
            </div>
          </div>

          {/* Botão fechar no mobile */}
          <button
            type="button"
            onClick={onFecharMenu}
            aria-label="Fechar menu lateral"
            className="rounded-lg p-1.5 text-icon-muted transition-colors hover:bg-surface-hover hover:text-fg lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegação central */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6" aria-label="Navegação administrativa">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-fg-3">
            Gerenciamento
          </div>

          {ITENS_MENU.map((item) => {
            const Icone = item.icone;

            if (item.disponivel) {
              return (
                <NavLink
                  key={item.rota}
                  to={item.rota}
                  end
                  onClick={onFecharMenu}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                      isActive
                        ? "bg-accent-soft text-accent font-semibold shadow-xs dark:bg-accent-soft/70"
                        : "text-fg-2 hover:bg-surface-hover hover:text-fg"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icone size={18} className="shrink-0 transition-transform group-hover:scale-105" />
                    <span>{item.nome}</span>
                  </div>
                </NavLink>
              );
            }

            // Itens ainda não implementados: visualmente identificados como "Em breve" e bloqueados
            return (
              <div
                key={item.rota}
                title="Funcionalidade em desenvolvimento — disponível em breve"
                aria-disabled="true"
                className="group flex cursor-not-allowed items-center justify-between rounded-xl px-3.5 py-2.5 text-sm text-fg-disabled transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <Icone size={18} className="shrink-0 opacity-60" />
                  <span>{item.nome}</span>
                </div>
                <span className="rounded-md border border-line-subtle bg-bg-2 px-1.5 py-0.5 text-[10px] font-medium tracking-tight text-fg-3">
                  Em breve
                </span>
              </div>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar: Perfil do Administrador e Botão de Logout */}
        <div className="border-t border-line-subtle p-4">
          <div className="flex items-center justify-between rounded-xl border border-line-subtle bg-bg px-3 py-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] text-xs font-bold text-white shadow-xs">
                {iniciais}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-fg">
                  {usuario?.nome || "Administrador"}
                </p>
                <p className="truncate text-[11px] text-fg-3">
                  {usuario?.email || "admin@sonessia.com"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sair da conta"
              aria-label="Sair da conta"
              className="ml-2 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-icon-muted transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
