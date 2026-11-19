import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Cadastro from "../pages/auth/Cadastro";
import ConfirmarEmail from "../pages/auth/ConfirmarEmail";
import RecuperarSenha from "../pages/auth/RecuperarSenha";
import RedefinirSenha from "../pages/auth/RedefinirSenha";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/confirmar-email" element={<ConfirmarEmail />} />

        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      </Routes>
    </BrowserRouter>
  );
}
