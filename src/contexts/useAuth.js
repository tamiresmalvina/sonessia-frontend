import { useContext } from 'react';
import { AuthContext } from './AuthContextInstance.js';

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider.');
  }
  return contexto;
}
