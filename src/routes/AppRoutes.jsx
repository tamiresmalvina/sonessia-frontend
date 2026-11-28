import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useSyncExternalStore } from "react";

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
import UserSenha from "../pages/user/UserSenha";
import UserPerfil from "../pages/user/UserPerfil";
import UserEmail from "../pages/user/UserEmail.jsx";
import UserExcluirConta from "../pages/user/UserExcluirConta.jsx";
import EmailAlterado from "../pages/EmailAlterado.jsx";
import ExclusaoContaConfirmada from "../pages/ExclusaoContaConfirmada.jsx";
import { assinarPrazoSaidaEmail, obterMarcadorPrazoSaidaEmail } from "../utils/emailAlteradoSuccess.js";
import { assinarEsperaLogoutExclusao, obterMarcadorEsperaLogoutExclusao } from "../utils/exclusaoContaSuccess.js";

function ProtegerEstadoSaida({ children }) {
  const location = useLocation();
  const marcadorSaida = useSyncExternalStore(assinarPrazoSaidaEmail, obterMarcadorPrazoSaidaEmail, () => "");
  const marcadorExclusao = useSyncExternalStore(assinarEsperaLogoutExclusao, obterMarcadorEsperaLogoutExclusao, () => "");
  if (marcadorExclusao && location.pathname !== "/exclusao-conta-confirmada") {
    return <Navigate to="/exclusao-conta-confirmada" replace />;
  }
  if (marcadorSaida && location.pathname !== "/email-alterado") {
    return <Navigate to="/email-alterado" replace state={location.state} />;
  }
  return children;
}

function EncaminharLoginAoExpirar() {
  const navigate = useNavigate();

  useEffect(() => {
    const aoExpirar = () => navigate("/login", { replace: true });
    window.addEventListener("sonessia:auth-expired", aoExpirar);
    return () => window.removeEventListener("sonessia:auth-expired", aoExpirar);
  }, [navigate]);

  return null;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <EncaminharLoginAoExpirar />
      <ProtegerEstadoSaida>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/player/:idAmbienteSonoro" element={<TelaPlayer />} />
          <Route path="/ambientes/:idAmbienteSonoro" element={<TelaPlayer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/email-alterado" element={<EmailAlterado />} />
          <Route path="/exclusao-conta-confirmada" element={<ExclusaoContaConfirmada />} />
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
              <Route path="perfil" element={<UserPerfil />} />
              <Route path="email" element={<UserEmail />} />
              <Route path="senha" element={<UserSenha />} />
              <Route path="excluir-conta" element={<UserExcluirConta />} />
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
      </ProtegerEstadoSaida>
    </BrowserRouter>
  );
}
