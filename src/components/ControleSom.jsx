import { useState } from 'react';

/** Ícone de equalizador de barras para representar o som */
function IconeEq({ ativo }) {
  return (
    <svg
      width="28"
      height="20"
      viewBox="0 0 28 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="1" y="8" width="3" height="12" rx="1.5"
        fill="currentColor"
        opacity={ativo ? '1' : '0.35'}
        style={ativo ? { animation: 'eq-pulse 1.4s ease-in-out 0s infinite' } : {}}
        className={ativo ? 'eq-bar' : ''}
      />
      <rect x="6" y="4" width="3" height="16" rx="1.5"
        fill="currentColor"
        opacity={ativo ? '1' : '0.45'}
        style={ativo ? { animation: 'eq-pulse 1.4s ease-in-out 0.2s infinite' } : {}}
        className={ativo ? 'eq-bar' : ''}
      />
      <rect x="11" y="1" width="3" height="19" rx="1.5"
        fill="currentColor"
        opacity={ativo ? '1' : '0.55'}
        style={ativo ? { animation: 'eq-pulse 1.4s ease-in-out 0.1s infinite' } : {}}
        className={ativo ? 'eq-bar' : ''}
      />
      <rect x="16" y="5" width="3" height="15" rx="1.5"
        fill="currentColor"
        opacity={ativo ? '1' : '0.4'}
        style={ativo ? { animation: 'eq-pulse 1.4s ease-in-out 0.3s infinite' } : {}}
        className={ativo ? 'eq-bar' : ''}
      />
      <rect x="21" y="9" width="3" height="11" rx="1.5"
        fill="currentColor"
        opacity={ativo ? '0.75' : '0.3'}
        style={ativo ? { animation: 'eq-pulse 1.4s ease-in-out 0.15s infinite' } : {}}
        className={ativo ? 'eq-bar' : ''}
      />
      <rect x="26" y="12" width="2" height="8" rx="1"
        fill="currentColor"
        opacity={ativo ? '0.5' : '0.2'}
        style={ativo ? { animation: 'eq-pulse 1.4s ease-in-out 0.25s infinite' } : {}}
        className={ativo ? 'eq-bar' : ''}
      />
    </svg>
  );
}

/** Ícone de informação */
function IconeInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

/**
 * Controle individual de um som.
 *
 * @param {{
 *   audio: { id: string, titulo: string, descricao?: string, urlArquivo?: string },
 *   volume: number,
 *   aoMudarVolume: (idAudio: string, volume: number) => void,
 * }} props
 */
export function ControleSom({ audio, volume, aoMudarVolume }) {
  const [mostrarTooltip, setMostrarTooltip] = useState(false);
  const ativo = volume > 0;

  return (
    <div className="flex flex-col items-center gap-2 min-w-0">
      {/* Ícone equalizador */}
      <div
        className="mb-1 transition-colors"
        style={{ color: ativo ? 'var(--color-accent)' : 'var(--color-icon-muted)' }}
      >
        <IconeEq ativo={ativo} />
      </div>

      {/* Nome + tooltip de informação */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-xs font-medium truncate max-w-[100px]"
          style={{ color: ativo ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}
          title={audio.titulo}
        >
          {audio.titulo}
        </span>
        {audio.descricao && (
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setMostrarTooltip(true)}
              onMouseLeave={() => setMostrarTooltip(false)}
              onFocus={() => setMostrarTooltip(true)}
              onBlur={() => setMostrarTooltip(false)}
              aria-label={`Informações sobre ${audio.titulo}: ${audio.descricao}`}
              className="flex items-center justify-center transition-colors"
              style={{ color: 'var(--color-icon-muted)' }}
            >
              <IconeInfo />
            </button>
            {mostrarTooltip && (
              <div
                className="absolute z-50 bottom-5 left-1/2 -translate-x-1/2 w-48 p-2.5 rounded-lg text-xs leading-relaxed shadow-lg pointer-events-none"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border-subtle)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}
                role="tooltip"
              >
                {audio.descricao}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slider de volume + porcentagem */}
      <div className="flex items-center gap-2 w-full">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={volume}
          onChange={(e) => aoMudarVolume(audio.id, Number(e.target.value))}
          aria-label={`Volume de ${audio.titulo}: ${volume}%`}
          className="slider-sonessia flex-1"
          style={{
            '--slider-fill': `${volume}%`,
            background: volume > 0
              ? `linear-gradient(to right, var(--color-accent) ${volume}%, var(--color-border) ${volume}%)`
              : 'var(--color-border)',
          }}
        />
        <span
          className="text-xs tabular-nums w-7 text-right flex-shrink-0"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {volume}%
        </span>
      </div>
    </div>
  );
}
