import { Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

const abas = [
  { id: "sons", nome: "Criar ambiente" },
  { id: "ambientes", nome: "Ambientes prontos" },
];

export default function Header({
  pagina,
  onMudarPagina,
  temaEscuro,
  onAlternarTema,
}) {
  function renderizarNavegacao(mobile = false) {
    return (
      <nav
        aria-label={
          mobile
            ? "Navegação principal para dispositivos móveis"
            : "Navegação principal"
        }
        className={
          mobile
            ? "flex h-11 justify-center gap-8 border-t border-line-subtle md:hidden"
            : "hidden h-full items-stretch gap-8 md:flex"
        }
      >
        {abas.map((aba) => {
          const selecionada = pagina === aba.id;

          return (
            <button
              key={aba.id}
              type="button"
              aria-current={selecionada ? "page" : undefined}
              onClick={() => onMudarPagina(aba.id)}
              className={`relative flex items-center whitespace-nowrap text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                selecionada
                  ? "font-medium text-fg after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-[image:linear-gradient(90deg,var(--accent),var(--indigo))] after:content-['']"
                  : "text-fg-3 hover:text-fg"
              }`}
            >
              {aba.nome}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line-subtle bg-bg">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:grid md:grid-cols-[1fr_auto_1fr] md:px-10">
        <a
          href="#inicio"
          onClick={(evento) => {
            evento.preventDefault();
            onMudarPagina("sons");
          }}
          className="flex items-center gap-2.5 rounded-sm text-[15px] font-semibold tracking-[-0.02em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          aria-label="Sonessia - página inicial"
        >
          <span
            aria-hidden="true"
            className="flex h-5 items-center gap-[2.5px]"
          >
            {[0.4, 0.8, 1, 0.65, 0.3].map((altura, indice) => (
              <span
                key={indice}
                className="w-[3px] rounded-full bg-[image:var(--audio)]"
                style={{ height: `${altura * 100}%` }}
              />
            ))}
          </span>
          Sonessia
        </a>

        {renderizarNavegacao()}

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          {/* <button
            type="button"
            disabled
            aria-label="Entrar — disponível em breve"
            title="Disponível em breve"
            className="hidden h-9 cursor-not-allowed items-center rounded-md px-3 text-sm text-fg-2 opacity-60 sm:inline-flex"
          >
            Entrar
          </button> */}

          <Link
            to="/login"
            className="hidden h-9 items-center rounded-md px-3 text-sm text-fg-2 transition-colors hover:text-fg sm:inline-flex"
          >
            Entrar
          </Link>

          <Link
            to="/cadastro"
            className="inline-flex h-9 items-center whitespace-nowrap rounded-lg bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Criar conta
          </Link>
          <button
            type="button"
            onClick={onAlternarTema}
            aria-label={temaEscuro ? "Ativar modo claro" : "Ativar modo escuro"}
            aria-pressed={temaEscuro}
            className="grid size-10 place-items-center rounded-full text-icon-2 transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            {temaEscuro ? (
              <Sun size={18} strokeWidth={1.6} />
            ) : (
              <Moon size={18} strokeWidth={1.6} />
            )}
          </button>
        </div>
      </div>

      {renderizarNavegacao(true)}
    </header>
  );
}
