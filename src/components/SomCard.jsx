import { createElement } from "react";
import { Info } from "lucide-react";
import ControleVolume from "./ControleVolume";
import { obterComponenteIconeAudio } from "../data/icones-audio.js";

export default function SomCard({ audio, volume, cor, onAlterarVolume }) {
  const ativo = volume > 0;

  return (
    <li className="flex flex-col items-center text-center">
      <span
        className={`relative grid size-12 place-items-center rounded-xl border transition-all duration-300 ${
          ativo
            ? "lift border-line-subtle bg-surface"
            : "border-transparent text-icon-muted"
        }`}
        style={ativo ? { color: cor } : undefined}
        aria-hidden="true"
      >
        {createElement(obterComponenteIconeAudio(audio.icone), {
          size: 22,
          strokeWidth: 1.4,
        })}
      </span>

      <div className="mt-3 flex items-center gap-1.5">
        <span
          className={`text-sm transition-colors duration-200 ${
            ativo ? "font-medium text-fg" : "text-fg-2"
          }`}
        >
          {audio.titulo}
        </span>

        <span
          className="inline-flex"
          title={`Som da categoria ${audio.categoria}`}
          aria-label={`Categoria: ${audio.categoria}`}
        >
          <Info
            size={13}
            strokeWidth={1.6}
            className="text-icon-muted"
            aria-hidden="true"
          />
        </span>
      </div>

      <ControleVolume
        nome={audio.titulo}
        valor={volume}
        cor={cor}
        onAlterar={onAlterarVolume}
      />
    </li>
  );
}
