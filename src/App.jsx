import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { useAuth } from './contexts/useAuth.js';
import { RotaProtegida } from './components/RotaProtegida.jsx';
import { Login } from './pages/Login.jsx';
import { RecuperarSenha } from './pages/RecuperarSenha.jsx';
import { RedefinirSenha } from './pages/RedefinirSenha.jsx';
import { AreaAdmin } from './pages/AreaAdmin.jsx';
import { AreaComum } from './pages/AreaComum.jsx';

function RedirecionamentoInicial() {
  const { usuario, estaAutenticado, carregando } = useAuth();

  if (carregando) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Carregando...</p>
      </main>
    );
  }

  if (!estaAutenticado || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.perfil === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (usuario.perfil === 'COMUM') {
    return <Navigate to="/comum" replace />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RedirecionamentoInicial />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-senha" element={<RecuperarSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route
            path="/admin"
            element={
              <RotaProtegida perfilPermitido="ADMIN">
                <AreaAdmin />
              </RotaProtegida>
            }
          />
          <Route
            path="/comum"
            element={
              <RotaProtegida perfilPermitido="COMUM">
                <AreaComum />
              </RotaProtegida>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
