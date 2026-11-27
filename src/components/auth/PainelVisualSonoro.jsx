import { useState, useEffect } from "react";

export function PainelVisualSonoro({
  className = "",
  variante = "padrao",
  titulo = "Seu refúgio sonoro está à sua espera.",
  descricao = "Conecte-se com suas composições favoritas e transforme seus momentos em experiências de foco, relaxamento e bem-estar.",
}) {
  const [temImagemCustomizada, setTemImagemCustomizada] = useState(false);
  const caminhoImagem = "/images/login-background.jpg";

  useEffect(() => {
    if (variante === "login") return undefined;

    const img = new Image();
    img.src = caminhoImagem;
    img.onload = () => setTemImagemCustomizada(true);
    img.onerror = () => setTemImagemCustomizada(false);
  }, [variante]);

  if (variante === "login") {
    return (
      <div
        className={`relative isolate flex min-h-[560px] flex-col overflow-hidden bg-gradient-to-br from-[#f7f5fc] via-[#f0ecfa] to-[#e7e2f4] text-[#241f31] dark:from-[#14111f] dark:via-[#211a32] dark:to-[#161323] dark:text-white ${className}`}
        role="complementary"
        aria-label="Painel de ambientação sonora Sonessia"
      >
        {/* Iluminação ambiente */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-8 size-[28rem] rounded-full bg-[#ad8de2]/25 blur-[100px] dark:bg-[#8b5bd1]/25"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-20 size-[26rem] rounded-full bg-[#aaa5ee]/30 blur-[100px] dark:bg-[#6255bc]/20"
        />

        {/* Ondas sonoras decorativas */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 size-full opacity-35 dark:opacity-30"
          viewBox="0 0 700 900"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M-40 410C70 410 70 350 150 350S230 470 310 470 390 385 470 385 550 440 740 440"
            stroke="currentColor"
            strokeOpacity=".24"
          />
          <path
            d="M-40 430C70 430 70 390 150 390S230 490 310 490 390 410 470 410 550 460 740 460"
            stroke="currentColor"
            strokeOpacity=".16"
          />
          <path
            d="M-40 390C70 390 70 310 150 310S230 445 310 445 390 360 470 360 550 420 740 420"
            stroke="currentColor"
            strokeOpacity=".12"
          />
        </svg>

        {/* Imagem principal */}
        <img
          src="/images/womanwithheadphones.png"
          alt="Mulher ouvindo música com fones de ouvido e olhos fechados"
          className="absolute bottom-0 right-[-8%] z-[1] h-[82%] max-w-none object-contain object-bottom drop-shadow-[0_0_42px_rgba(150,110,220,0.22)] sm:right-[-3%] sm:h-[88%] lg:right-[0%] lg:h-[94%]"
        />

        {/* Gradiente de integração da imagem com o fundo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(to_bottom,transparent_25%,rgba(241,237,249,0.55)_58%,rgba(241,237,249,0.98)_100%)] dark:bg-[linear-gradient(to_bottom,transparent_25%,rgba(23,20,36,0.65)_58%,rgba(23,20,36,0.98)_100%)]"
        />

        {/* Conteúdo institucional */}
        <div className="relative z-10 mt-auto w-full max-w-xl p-8 pt-32 pb-14 sm:p-12 sm:pt-40 sm:pb-16">
          <h2 className="mb-3 max-w-md text-3xl font-bold tracking-tight text-[#282236] dark:text-white sm:text-4xl lg:text-4xl">
            {titulo}
          </h2>

          <p className="max-w-md text-base leading-relaxed text-[#514b60] dark:text-white/80 sm:text-lg">
            {descricao}
          </p>
        </div>
      </div>
    );
  }

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

      {/* Conteúdo de inspiração */}
      <div className="relative z-10 max-w-lg p-8 sm:p-12">
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
          Crie seu refúgio sonoro sob medida.
        </h2>

        <p className="text-sm leading-relaxed text-white/80 sm:text-base">
          Mergulhe em composições acústicas desenhadas para transformar seu
          foco, relaxamento e bem-estar diário.
        </p>
      </div>
    </div>
  );
}
