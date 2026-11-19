import { useState, useEffect, useCallback } from 'react';

const CHAVE_TEMA = 'sonessia_tema';

/**
 * Hook para gerenciar o tema (light/dark) da aplicação.
 * Persiste a preferência no localStorage e aplica a classe `.dark` no <html>.
 *
 * @returns {{ tema: 'light' | 'dark', alternarTema: () => void, definirTema: (t: 'light'|'dark') => void }}
 */
export function useTema() {
  const [tema, setTema] = useState(() => {
    try {
      const salvo = localStorage.getItem(CHAVE_TEMA);
      if (salvo === 'dark' || salvo === 'light') return salvo;
    } catch {
      // sem acesso ao localStorage
    }
    // Respeita a preferência do sistema operacional
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const html = document.documentElement;
    if (tema === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch {
      // falha silenciosa
    }
  }, [tema]);

  const alternarTema = useCallback(() => {
    setTema((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const definirTema = useCallback((t) => {
    if (t === 'light' || t === 'dark') setTema(t);
  }, []);

  return { tema, alternarTema, definirTema };
}
