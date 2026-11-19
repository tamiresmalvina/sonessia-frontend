import { useState, useEffect } from "react";

/**
 * Painel visual lateral de ambientação sonora da Sonessia.
 *
 * Configuração de imagem:
 * Para personalizar, basta adicionar o arquivo `login-background.jpg` em `public/images/login-background.jpg`.
 * Caso a imagem não exista, o painel exibe um gradiente sofisticado alinhado ao Design System
 * da plataforma Sonessia (tons de #181625, #7656A8 e #6474C8) acompanhado de ondas sonoras harmoniosas.
 */
export function PainelVisualSonoro({ className = "" }) {
  const [temImagemCustomizada, setTemImagemCustomizada] = useState(false);
  const caminhoImagem = "/images/login-background.jpg";

  useEffect(() => {
    const img = new Image();
    img.src = caminhoImagem;
    img.onload = () => setTemImagemCustomizada(true);
    img.onerror = () => setTemImagemCustomizada(false);
  }, []);

  const estiloFundo = temImagemCustomizada
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(24, 22, 37, 0.45) 0%, rgba(24, 22, 37, 0.92) 100%), url('${caminhoImagem}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundImage: `linear-gradient(160deg, #181625 0%, #1e1b33 45%, #131221 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#181625",
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
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-35 blur-3xl"
        style={{
          background: "radial-gradient(circle, #7656A8 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-96 w-96 rounded-full opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, #6474C8 0%, transparent 70%)",
        }}
      />

      {/* Topo do painel: Tag de tranquilidade sonora */}
      <div className="relative z-10 p-8 sm:p-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/90 backdrop-blur-md">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#8A5FC7]" />
          Frequências & Ambientes Sonoros
        </div>
      </div>

      {/* Centro / Base do painel: Frase de inspiração e barras sonoras */}
      <div className="relative z-10 p-8 sm:p-12 max-w-lg">
        {/* Equalizador animado suave */}
        <div
          className="mb-6 flex items-end gap-1.5 h-8 opacity-85"
          aria-hidden="true"
        >
          <span className="w-1 bg-[#8A5FC7] rounded-full h-3 animate-pulse" />
          <span
            className="w-1 bg-[#7656A8] rounded-full h-6 animate-pulse"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="w-1 bg-[#6474C8] rounded-full h-8 animate-pulse"
            style={{ animationDelay: "0.3s" }}
          />
          <span
            className="w-1 bg-[#536DCB] rounded-full h-5 animate-pulse"
            style={{ animationDelay: "0.45s" }}
          />
          <span
            className="w-1 bg-[#8A5FC7] rounded-full h-7 animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
          <span
            className="w-1 bg-[#C875A8] rounded-full h-4 animate-pulse"
            style={{ animationDelay: "0.35s" }}
          />
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3">
          Crie seu refúgio sonoro sob medida.
        </h2>

        <p className="text-sm sm:text-base text-white/80 leading-relaxed">
          Mergulhe em composições acústicas desenhadas para transformar seu
          foco, relaxamento e bem-estar diário.
        </p>

        {/* Rodapé discreto sobre a imagem */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
          <span>Experiência Sonora Imersiva</span>
          <span>Sonessia Plataforma</span>
        </div>
      </div>
    </div>
  );
}
