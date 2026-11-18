/**
 * Logotipo oficial da Sonessia
 *
 * @param {object} props
 * @param {'padrao' | 'branca'} [props.variante='padrao']
 * @param {string} [props.className='']
 */
export function SonessiaLogo({ variante = 'padrao', className = '' }) {
  const corTexto = variante === 'branca' ? '#FFFFFF' : '#24113D';
  const corOndaPrimaria = variante === 'branca' ? '#C4B5FD' : '#6D28D9';
  const corOndaSecundaria = variante === 'branca' ? '#A78BFA' : '#8B5CF6';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Símbolo de ondas sonoras Sonessia */}
      <svg
        width="38"
        height="38"
        viewBox="0 0 38 38"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-hidden="true"
      >
        <rect width="38" height="38" rx="10" fill={variante === 'branca' ? '#3B1366' : '#FAF8FF'} />
        <rect
          x="1"
          y="1"
          width="36"
          height="36"
          rx="9"
          stroke={variante === 'branca' ? '#6D28D9' : '#EDE9FE'}
          strokeWidth="1.5"
        />
        {/* Barras de frequência sonora */}
        <rect x="9" y="15" width="2.8" height="8" rx="1.4" fill={corOndaSecundaria} />
        <rect x="14" y="11" width="2.8" height="16" rx="1.4" fill={corOndaPrimaria} />
        <rect x="19" y="8" width="2.8" height="22" rx="1.4" fill={corOndaPrimaria} />
        <rect x="24" y="12" width="2.8" height="14" rx="1.4" fill={corOndaSecundaria} />
        <rect x="29" y="16" width="2.8" height="6" rx="1.4" fill={corOndaSecundaria} opacity="0.8" />
      </svg>

      <span
        className="text-2xl font-bold tracking-tight"
        style={{ color: corTexto, fontFamily: 'inherit' }}
      >
        Sonessia
      </span>
    </div>
  );
}
