import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import TelaPlayer from "../pages/TelaPlayer";
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

// Infraestrutura e Layout da Área do Usuário Comum
import UserLayout from "../layouts/UserLayout";
import UserHome from "../pages/user/UserHome";
import UserAmbientes from "../pages/user/UserAmbientes";
import UserColecoes from "../pages/user/UserColecoes";
import UserColecaoDetalhes from "../pages/user/UserColecaoDetalhes";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/player/:idAmbienteSonoro" element={<TelaPlayer />} />
        <Route path="/ambientes/:idAmbienteSonoro" element={<TelaPlayer />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/confirmar-email" element={<ConfirmarEmail />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />

        {/* Rotas da Área do Usuário — Acesso exclusivo perfil COMUM */}
        <Route element={<ProtectedRoute perfilExigido="COMUM" />}>
          <Route path="/comum" element={<UserLayout />}>
            <Route index element={<UserHome />} />
            <Route path="ambientes" element={<UserAmbientes />} />
            <Route path="colecoes" element={<UserColecoes />} />
            <Route
              path="colecoes/:idColecao"
              element={<UserColecaoDetalhes />}
            />
          </Route>
          <Route path="/app" element={<Navigate to="/comum" replace />} />
          <Route path="/inicio" element={<Navigate to="/comum" replace />} />
        </Route>

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
