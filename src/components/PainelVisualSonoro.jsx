import { useState, useEffect } from 'react';

/**
 * Painel visual direito reservado para imagem de fundo e ambientação sonora da Sonessia.
 *
 * Configuração de imagem:
 * Para personalizar, basta adicionar o arquivo `login-background.jpg` em `public/images/login-background.jpg`.
 * Caso a imagem não exista, o painel exibe um gradiente sofisticado em tons de roxo
 * (#24113D / #6D28D9 / #3B1366) acompanhado de ondas sonoras vetoriais harmoniosas.
 */
export function PainelVisualSonoro({ className = '' }) {
  const [temImagemCustomizada, setTemImagemCustomizada] = useState(false);
  const caminhoImagem = '/images/login-background.jpg';

  useEffect(() => {
    // Testa se a imagem customizada foi colocada em public/images/login-background.jpg
    const img = new Image();
    img.src = caminhoImagem;
    img.onload = () => setTemImagemCustomizada(true);
    img.onerror = () => setTemImagemCustomizada(false);
  }, []);

  const estiloFundo = temImagemCustomizada
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(36, 17, 61, 0.35) 0%, rgba(36, 17, 61, 0.85) 100%), url('${caminhoImagem}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage: `linear-gradient(160deg, rgba(36, 17, 61, 0.85) 0%, rgba(27, 11, 46, 0.95) 100%), url('/images/sound-ambient.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#24113D',
      };

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden text-white transition-all duration-300 ${className}`}
      style={estiloFundo}
      role="complementary"
      aria-label="Painel de ambientação sonora Sonessia"
    >
      {/* Luz ambiente suave decorativa */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #6D28D9 0%, transparent 70%)' }}
      />

      {/* Topo do painel: Tag de tranquilidade sonora */}
      <div className="relative z-10 p-8 sm:p-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-900/40 px-4 py-1.5 text-xs font-medium tracking-wide text-purple-200 backdrop-blur-md">
          <span className="h-2 w-2 animate-pulse rounded-full bg-purple-400" />
          Frequências & Ambientes Sonoros
        </div>
      </div>

      {/* Centro / Base do painel: Frase de inspiração e barras sonoras */}
      <div className="relative z-10 p-8 sm:p-12 max-w-lg">
        {/* Equalizador animado suave */}
        <div className="mb-6 flex items-end gap-1.5 h-8 opacity-80" aria-hidden="true">
          <span className="w-1 bg-[#C4B5FD] rounded-full h-3 animate-pulse" />
          <span className="w-1 bg-[#C4B5FD] rounded-full h-6 animate-pulse" style={{ animationDelay: '0.15s' }} />
          <span className="w-1 bg-[#C4B5FD] rounded-full h-8 animate-pulse" style={{ animationDelay: '0.3s' }} />
          <span className="w-1 bg-[#C4B5FD] rounded-full h-5 animate-pulse" style={{ animationDelay: '0.45s' }} />
          <span className="w-1 bg-[#C4B5FD] rounded-full h-7 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="w-1 bg-[#C4B5FD] rounded-full h-4 animate-pulse" style={{ animationDelay: '0.35s' }} />
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3">
          Crie seu refúgio sonoro sob medida.
        </h2>

        <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed">
          Mergulhe em composições acústicas desenhadas para transformar seu foco, relaxamento e bem-estar diário.
        </p>

        {/* Rodapé discreto sobre a imagem */}
        <div className="mt-8 pt-6 border-t border-purple-500/20 flex items-center justify-between text-xs text-purple-300/70">
          <span>Experiência Sonora Imersiva</span>
          <span>Sonessia Plataforma</span>
        </div>
      </div>
    </div>
  );
}
