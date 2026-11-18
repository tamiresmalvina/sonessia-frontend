import { useAuth } from '../contexts/useAuth.js';

export function AreaComum() {
  const { logout } = useAuth();

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Área Comum</h1>
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
