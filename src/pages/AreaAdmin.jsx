import { useAuth } from '../contexts/useAuth.js';

export function AreaAdmin() {
  const { logout } = useAuth();

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Área Admin</h1>
      <button
        type="button"
        onClick={logout}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          cursor: 'pointer',
        }}
      >
        Sair
      </button>
    </main>
  );
}
