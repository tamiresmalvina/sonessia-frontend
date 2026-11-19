export function SonessiaLogo({ variante = "padrao", className = "" }) {
  const isBranca = variante === "branca";

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sonessia-logo-auth-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9B51B6" />
            <stop offset="50%" stopColor="#7656A8" />
            <stop offset="100%" stopColor="#5E67CE" />
          </linearGradient>
        </defs>
        {/* Fundo do ícone se for padrão ou neutro */}
        <rect
          width="40"
          height="40"
          rx="10"
          fill={isBranca ? "rgba(255, 255, 255, 0.08)" : "var(--bg-2, #f0f0f8)"}
        />
        {/* 5 barras verticais proporcionais com degradê sonoro */}
        <rect x="7" y="15" width="3.6" height="10" rx="1.8" fill="url(#sonessia-logo-auth-gradient)" />
        <rect x="13.2" y="10" width="3.6" height="20" rx="1.8" fill="url(#sonessia-logo-auth-gradient)" />
        <rect x="19.4" y="6.5" width="3.6" height="27" rx="1.8" fill="url(#sonessia-logo-auth-gradient)" />
        <rect x="25.6" y="11.5" width="3.6" height="17" rx="1.8" fill="url(#sonessia-logo-auth-gradient)" />
        <rect x="31.8" y="16" width="3.6" height="8" rx="1.8" fill="url(#sonessia-logo-auth-gradient)" />
      </svg>

      <span
        className={`text-2xl font-bold tracking-tight ${
          isBranca ? "text-white" : "text-fg"
        }`}
      >
        Sonessia
      </span>
    </div>
  );
}
