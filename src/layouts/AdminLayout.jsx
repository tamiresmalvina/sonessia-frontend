import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import AdminHeader from "../components/admin/AdminHeader.jsx";

const TITULOS_ROTAS = {
  "/admin": "Visão geral",
  "/admin/audios": "Áudios",
  "/admin/ambientes": "Ambientes prontos",
  "/admin/categorias": "Categorias",
  "/admin/configuracoes": "Configurações",
};

/**
 * Layout mestre compartilhado para todas as páginas do painel administrativo.
 */
export default function AdminLayout() {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();

  const tituloAtual = TITULOS_ROTAS[location.pathname] || "Painel Administrativo";

  return (
    <div className="flex min-h-screen w-full bg-bg text-fg">
      {/* Menu lateral administrativo */}
      <AdminSidebar
        menuAberto={menuAberto}
        onFecharMenu={() => setMenuAberto(false)}
      />

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <AdminHeader
          titulo={tituloAtual}
          onAbrirMenu={() => setMenuAberto(true)}
        />

        {/* Área de visualização da seção ativa */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
