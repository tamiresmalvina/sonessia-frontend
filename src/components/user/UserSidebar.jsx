import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  SlidersHorizontal,
  Folder,
  User,
  Mail,
  Key,
  Trash2,
  LogOut,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/useAuth.js";

/**
 * Ícone vetorial oficial das 5 barras sonoras do Sonessia com degradê característico.
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
        <linearGradient id="user-logo-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9B51B6" />
          <stop offset="50%" stopColor="#7656A8" />
          <stop offset="100%" stopColor="#5E67CE" />
        </linearGradient>
      </defs>
      <rect
        x="5.5"
        y="14.5"
        width="4"
        height="11"
        rx="2"
        fill="url(#user-logo-grad)"
      />
      <rect
        x="12.5"
        y="9.5"
        width="4"
        height="21"
        rx="2"
        fill="url(#user-logo-grad)"
      />
      <rect
        x="19.5"
        y="6"
        width="4"
        height="28"
        rx="2"
        fill="url(#user-logo-grad)"
      />
      <rect
        x="26.5"
        y="11.5"
        width="4"
        height="17"
        rx="2"
        fill="url(#user-logo-grad)"
      />
      <rect
        x="33.5"
        y="16"
        width="4"
        height="8"
        rx="2"
        fill="url(#user-logo-grad)"
      />
    </svg>
  );
}

/**
 * Grupos de navegação da Sidebar do usuário comum.
 * As rotas que ainda serão desenvolvidas nas próximas etapas são mantidas visíveis
 * e identificadas de forma limpa, sem criar rotas fictícias.
 */
const GRUPO_EXPLORAR = [
  {
    nome: "Início",
    rota: "/comum",
    icone: Home,
    ativo: true,
  },
  {
    nome: "Ambientes",
    rota: "/comum/ambientes",
    icone: SlidersHorizontal,
    ativo: true,
  },
  {
    nome: "Coleções",
    rota: "/comum/colecoes",
    icone: Folder,
    ativo: true,
  },
];

const GRUPO_PERFIL = [
  {
    nome: "Perfil",
    rota: "#perfil",
    icone: User,
    ativo: false,
    emBreve: true,
  },
  {
    nome: "E-mail",
    rota: "#email",
    icone: Mail,
    ativo: false,
    emBreve: true,
  },
  {
    nome: "Senha",
    rota: "/comum/senha",
    icone: Key,
    ativo: true,
  },
  {
    nome: "Excluir conta",
    rota: "#excluir-conta",
    icone: Trash2,
    ativo: false,
    emBreve: true,
  },
];

/**
 * Sidebar fixa / responsiva da área do usuário comum Sonessia.
 *
 * @param {{ menuAberto: boolean, onFecharMenu: () => void }} props
 */
export default function UserSidebar({ menuAberto, onFecharMenu }) {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      navigate("/login", { replace: true });
    }
  }

  // Iniciais do nome do usuário para o avatar padrão
  const iniciais = (usuario?.nome || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");

  const ehRotaAtiva = (rota) => {
    if (rota === "/comum") {
      return (
        location.pathname === "/comum" ||
        location.pathname === "/comum/" ||
        location.pathname === "/inicio" ||
        location.pathname === "/app"
      );
    }
    return location.pathname === rota;
  };

  return (
    <>
      {/* Backdrop para dispositivos móveis */}
      {menuAberto && (
        <div
          role="presentation"
          onClick={onFecharMenu}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Barra lateral fixa */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-line-subtle bg-surface transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          menuAberto ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Topo: Logotipo Sonessia */}
        <div className="flex h-[72px] items-center justify-between border-b border-line-subtle px-6">
          <NavLink
            to="/comum"
            onClick={onFecharMenu}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <LogoIcone />
            <span className="text-[17px] font-bold tracking-tight text-fg">
              Sonessia
            </span>
          </NavLink>

          <button
            type="button"
            onClick={onFecharMenu}
            aria-label="Fechar menu lateral"
            className="rounded-lg p-1.5 text-icon-muted transition-colors hover:bg-surface-hover hover:text-fg lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navegação principal com grupos */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
          {/* Grupo: Explorar */}
          <div>
            <p className="px-3 text-[10px] font-mono uppercase tracking-[0.18em] text-fg-3">
              Explorar
            </p>
            <nav className="mt-2.5 space-y-1" aria-label="Navegação Explorar">
              {GRUPO_EXPLORAR.map((item) => {
                const Icone = item.icone;
                const ativa = ehRotaAtiva(item.rota);

                if (item.emBreve) {
                  return (
                    <div
                      key={item.nome}
                      title="Esta seção será implementada na próxima etapa"
                      className="group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-normal text-fg-3 transition-colors hover:bg-surface-hover hover:text-fg-2 cursor-default select-none"
                    >
                      <div className="flex items-center gap-3">
                        <Icone
                          size={18}
                          strokeWidth={1.75}
                          className="shrink-0 text-icon-muted"
                        />
                        <span>{item.nome}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.nome}
                    to={item.rota}
                    onClick={onFecharMenu}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      ativa
                        ? "bg-[#F4F1FA] text-[#7656A8] dark:bg-[#252447] dark:text-[#9A72D8]"
                        : "text-fg-2 hover:bg-surface-hover hover:text-fg"
                    }`}
                  >
                    <Icone
                      size={18}
                      strokeWidth={1.75}
                      className={`shrink-0 ${
                        ativa ? "text-accent" : "text-icon-muted"
                      }`}
                    />
                    <span>{item.nome}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Grupo: Perfil e configurações */}
          <div>
            <p className="px-3 text-[10px] font-mono uppercase tracking-[0.18em] text-fg-3">
              Perfil e configurações
            </p>
            <nav
              className="mt-2.5 space-y-1"
              aria-label="Navegação Perfil e configurações"
            >
              {GRUPO_PERFIL.map((item) => {
                const Icone = item.icone;

                if (item.nome === "Senha") {
                  const ativa = location.pathname === item.rota;
                  return (
                    <NavLink
                      key={item.nome}
                      to={item.rota}
                      onClick={onFecharMenu}
                      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                        ativa
                          ? "bg-[#F4F1FA] text-[#7656A8] dark:bg-[#252447] dark:text-[#9A72D8]"
                          : "text-fg-2 hover:bg-surface-hover hover:text-fg"
                      }`}
                    >
                      <Icone size={18} strokeWidth={1.75} className={`shrink-0 ${ativa ? "text-accent" : "text-icon-muted"}`} />
                      <span>{item.nome}</span>
                    </NavLink>
                  );
                }

                return (
                  <div
                    key={item.nome}
                    title="Esta seção será implementada na próxima etapa"
                    className="group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-normal text-fg-3 transition-colors hover:bg-surface-hover hover:text-fg-2 cursor-default select-none"
                  >
                    <div className="flex items-center gap-3">
                      <Icone
                        size={18}
                        strokeWidth={1.75}
                        className="shrink-0 text-icon-muted"
                      />
                      <span>{item.nome}</span>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Rodapé da Sidebar: Perfil, Tema e Logout */}
        <div className="border-t border-line-subtle p-4">
          {/* Informações do usuário logado */}
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-line-subtle bg-accent-soft grid place-items-center text-sm font-semibold text-accent">
              {usuario?.fotoPerfil ? (
                <img
                  src={usuario.fotoPerfil}
                  alt={usuario.nome}
                  className="size-full object-cover"
                />
              ) : (
                <span>{iniciais}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-fg">
                {usuario?.nome || "Usuário"}
              </p>
              <p className="truncate text-[11px] text-fg-3">
                {usuario?.email || ""}
              </p>
            </div>
          </div>

          {/* Ações: Tema e Sair */}
          <div className="mt-3 flex items-center justify-between border-t border-line-subtle/70 pt-3 px-1">
            <button
              type="button"
              onClick={() => setTemaEscuro((atual) => !atual)}
              aria-label={
                temaEscuro
                  ? "Alternar para tema claro"
                  : "Alternar para tema escuro"
              }
              title={temaEscuro ? "Tema claro" : "Tema escuro"}
              className="grid size-8 place-items-center rounded-lg text-icon-2 transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              {temaEscuro ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-fg-3 transition-colors hover:bg-surface-hover hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <LogOut size={15} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
