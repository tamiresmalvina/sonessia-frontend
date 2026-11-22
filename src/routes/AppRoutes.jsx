import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Cadastro from "../pages/auth/Cadastro";
import ConfirmarEmail from "../pages/auth/ConfirmarEmail";
import RecuperarSenha from "../pages/auth/RecuperarSenha";
import RedefinirSenha from "../pages/auth/RedefinirSenha";

// Infraestrutura e Layout Administrativo
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import Audios from "../pages/admin/Audios";
import Ambientes from "../pages/admin/Ambientes";
import Categorias from "../pages/admin/Categorias";
import Configuracoes from "../pages/admin/Configuracoes";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/confirmar-email" element={<ConfirmarEmail />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />

        {/* Rota para usuário com perfil comum */}
        <Route path="/comum" element={<Navigate to="/" replace />} />

        {/* Rotas Administrativas — Acesso exclusivo perfil ADMIN */}
        <Route element={<ProtectedRoute perfilExigido="ADMIN" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="audios" element={<Audios />} />
            <Route path="ambientes" element={<Ambientes />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
        </Route>

        {/* Rota padrão para rotas não mapeadas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
