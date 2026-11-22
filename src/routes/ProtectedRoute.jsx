import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/useAuth.js";

/**
 * Componente de proteção de rotas com base na autenticação e controle de acesso baseado em papéis (RBAC).
 *
 * @param {{ perfilExigido?: 'ADMIN' | 'COMUM', children?: React.ReactNode }} props
 */
export default function ProtectedRoute({ perfilExigido = "ADMIN", children }) {
  const { usuario, estaAutenticado, carregando } = useAuth();

  // Enquanto a sessão está sendo restaurada ou validada no backend, exibe tela de carregamento suave
  if (carregando) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-bg text-fg">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-line-subtle border-t-accent" />
            <div className="absolute h-2 w-2 rounded-full bg-accent" />
          </div>
          <p className="text-xs font-medium tracking-wide text-fg-3 uppercase">
            Verificando permissões...
          </p>
        </div>
      </div>
    );
  }

  // Usuário não autenticado -> redireciona para o login
  if (!estaAutenticado || !usuario) {
    return <Navigate to="/login" replace />;
  }

  // Verificação de perfil exigido
  if (perfilExigido && usuario.perfil !== perfilExigido) {
    if (usuario.perfil === "ADMIN") {
      return <Navigate to="/admin" replace />;
    }
    if (usuario.perfil === "COMUM") {
      return <Navigate to="/comum" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}
