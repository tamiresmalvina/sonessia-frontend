import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth.js';

/**
 * Componente para proteção de rotas privadas e validação de perfil (RBAC).
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {'ADMIN' | 'COMUM'} [props.perfilPermitido] - Perfil exigido para acesso.
 */
export function RotaProtegida({ children, perfilPermitido }) {
  const { usuario, estaAutenticado, carregando } = useAuth();

  if (carregando) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Carregando...</p>
      </main>
    );
  }

  // 1. Usuários não autenticados são redirecionados para a tela de login
  if (!estaAutenticado || !usuario) {
    return <Navigate to="/login" replace />;
  }

  // 2. Validação estrita do perfil exigido
  if (perfilPermitido && usuario.perfil !== perfilPermitido) {
    // Redireciona para a área correspondente ao perfil do usuário
    if (usuario.perfil === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    if (usuario.perfil === 'COMUM') {
      return <Navigate to="/comum" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}
