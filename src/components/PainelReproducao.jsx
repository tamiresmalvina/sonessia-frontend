/**
 * Painel compacto de reprodução sonora.
 * Exibe: temporizador | play/pause (gradiente) | volume geral
 *
 * @param {{
 *   tocando: boolean,
 *   sonsAtivos: number,
 *   volumeGeral: number,
 *   onReproduirPausar: () => void,
 *   onVolumeGeral: (v: number) => void,
 *   onTemporizador?: () => void,
 * }} props
 */
export function PainelReproducao({ tocando, sonsAtivos, volumeGeral, onReproduirPausar, onVolumeGeral, onTemporizador }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Container principal do player */}
      <div
        className="inline-flex items-center gap-5 px-6 py-3 rounded-2xl border"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border-subtle)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        {/* Botão temporizador */}
        <button
          type="button"
          onClick={onTemporizador}
          aria-label="Configurar temporizador"
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
          style={{ color: 'var(--color-icon-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; e.currentTarget.style.color = 'var(--color-icon-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-icon-secondary)'; }}
        >
          {/* Ícone de relógio/temporizador */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2.5 2.5" />
            <path d="M5 3l1.5 1.5" />
            <path d="M19 3l-1.5 1.5" />
            <path d="M9 1h6" />
          </svg>
        </button>

        {/* Botão play/pause central com gradiente accent */}
        <button
          type="button"
          onClick={onReproduirPausar}
          aria-label={tocando ? 'Pausar reprodução' : 'Iniciar reprodução'}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 shadow-md"
          style={{
            background: tocando
              ? 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)'
              : 'linear-gradient(135deg, var(--color-accent) 0%, #9B6BA6 100%)',
            color: 'var(--color-on-accent)',
            boxShadow: '0 2px 10px color-mix(in srgb, var(--color-accent) 40%, transparent)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.07)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {tocando ? (
            /* Ícone pausa */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            /* Ícone play */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Controle de volume geral */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={volumeGeral === 0 ? 'Som ativado (clique para mutar)' : 'Mutar som'}
            onClick={() => onVolumeGeral(volumeGeral === 0 ? 70 : 0)}
            className="flex items-center justify-center transition-colors"
            style={{ color: 'var(--color-icon-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-icon-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-icon-secondary)'; }}
          >
            {volumeGeral === 0 ? (
              /* Ícone mudo */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : volumeGeral < 50 ? (
              /* Volume baixo */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              /* Volume alto */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
          <div className="flex flex-col items-center gap-0.5">
            <input
              type="range"
              min={0}
              max={100}
              value={volumeGeral}
              onChange={(e) => onVolumeGeral(Number(e.target.value))}
              aria-label="Volume geral"
              className="slider-sonessia w-16"
            />
          </div>
        </div>
      </div>

      {/* Status de reprodução */}
      <p
        className="text-xs font-medium tracking-widest uppercase"
        style={{ color: 'var(--color-text-tertiary)', letterSpacing: '0.12em' }}
      >
        {tocando ? 'Reproduzindo' : 'Pausado'}
        {' · '}
        {sonsAtivos} {sonsAtivos === 1 ? 'som ativo' : 'sons ativos'}
      </p>
    </div>
  );
}
