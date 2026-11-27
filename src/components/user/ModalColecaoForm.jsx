import { useMemo, useState } from "react";
import { AudioLines, Check, Info, Plus, Search, X } from "lucide-react";

/** Formulário reutilizável para criar ou editar uma coleção. */
export default function ModalColecaoForm({
  titulo,
  textoAuxiliar,
  aviso,
  valoresIniciais = {},
  ambientesDisponiveis = [],
  idsAmbientesSelecionadosIniciais = [],
  carregandoAmbientes = false,
  erroAmbientes = "",
  erroApi = "",
  salvando = false,
  textoBotao = "Salvar coleção",
  textoSalvando = "Salvando...",
  IconeAcao = Plus,
  onFechar,
  onSalvar,
  onTentarCarregarAmbientes,
}) {
  const [nome, setNome] = useState(valoresIniciais.nome ?? "");
  const [descricao, setDescricao] = useState(valoresIniciais.descricao ?? "");
  const [pesquisa, setPesquisa] = useState("");
  const [idsSelecionados, setIdsSelecionados] = useState(idsAmbientesSelecionadosIniciais);
  const [erro, setErro] = useState("");

  const ambientesFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLocaleLowerCase("pt-BR");
    if (!termo) return ambientesDisponiveis;
    return ambientesDisponiveis.filter((ambiente) =>
      ambiente.nome?.toLocaleLowerCase("pt-BR").includes(termo),
    );
  }, [ambientesDisponiveis, pesquisa]);

  const erroExibicao = erro || erroApi;

  function alternarAmbiente(idAmbienteSonoro) {
    if (salvando) return;
    setIdsSelecionados((atuais) =>
      atuais.includes(idAmbienteSonoro)
        ? atuais.filter((id) => id !== idAmbienteSonoro)
        : [...atuais, idAmbienteSonoro],
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (salvando) return;

    const nomeNormalizado = nome.trim();
    if (!nomeNormalizado) {
      setErro("Informe um nome para a coleção.");
      return;
    }
    if (nomeNormalizado.length > 255) {
      setErro("O nome deve ter no máximo 255 caracteres.");
      return;
    }

    const descricaoNormalizada = descricao.trim();
    if (descricaoNormalizada.length > 1000) {
      setErro("A descrição deve ter no máximo 1000 caracteres.");
      return;
    }

    await onSalvar({
      nome: nomeNormalizado,
      descricao: descricaoNormalizada || null,
      idsAmbientesSonoros: idsSelecionados,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (!salvando && event.target === event.currentTarget) onFechar();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-colecao-titulo"
        aria-describedby="modal-colecao-descricao"
        className="relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-line bg-surface shadow-2xl sm:max-w-[580px] sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 px-6 pb-4 pt-6">
          <div className="min-w-0">
            <h2 id="modal-colecao-titulo" className="text-[22px] font-light leading-tight tracking-[-0.03em]">
              {titulo}
            </h2>
            <p id="modal-colecao-descricao" className="mt-2 text-sm leading-relaxed text-fg-2">
              {textoAuxiliar}
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            disabled={salvando}
            aria-label="Fechar"
            className="-mr-2 -mt-1 grid size-10 shrink-0 place-items-center rounded-full text-icon-2 transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          <form id="form-colecao" onSubmit={handleSubmit} className="space-y-5 pt-2">
            {aviso && (
              <div className="flex items-start gap-3 rounded-xl border border-line-subtle bg-accent-soft px-4 py-3 text-sm leading-relaxed text-fg">
                <Info size={17} className="mt-0.5 shrink-0 text-accent" />
                <span>{aviso}</span>
              </div>
            )}

            <div>
              <label htmlFor="nome-colecao" className="mb-2 block text-sm font-medium text-fg">
                Nome
              </label>
              <input
                id="nome-colecao"
                autoFocus
                type="text"
                value={nome}
                disabled={salvando}
                onChange={(event) => {
                  setNome(event.target.value);
                  setErro("");
                }}
                maxLength={255}
                spellCheck={false}
                placeholder="Ex.: Para dormir"
                aria-invalid={Boolean(erroExibicao)}
                aria-describedby={erroExibicao ? "erro-form-colecao" : undefined}
                className="h-12 w-full rounded-lg border border-line bg-surface px-3.5 text-[15px] text-fg outline-none transition-colors placeholder:text-fg-3 hover:border-line-strong focus:border-focus focus:ring-1 focus:ring-focus disabled:cursor-not-allowed disabled:opacity-60"
              />
              {erroExibicao && (
                <p id="erro-form-colecao" role="alert" className="mt-2 text-sm text-danger">
                  {erroExibicao}
                </p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <label htmlFor="descricao-colecao" className="text-sm font-medium text-fg">
                  Descrição (opcional)
                </label>
                <span aria-hidden="true" className="font-mono text-[11px] tabular-nums text-fg-3">
                  {descricao.length}/1000
                </span>
              </div>
              <textarea
                id="descricao-colecao"
                rows={3}
                maxLength={1000}
                value={descricao}
                disabled={salvando}
                onChange={(event) => setDescricao(event.target.value)}
                className="w-full resize-none rounded-lg border border-line bg-surface px-3.5 py-3 text-[15px] leading-relaxed text-fg outline-none transition-colors placeholder:text-fg-3 hover:border-line-strong focus:border-focus focus:ring-1 focus:ring-focus disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <section aria-labelledby="ambientes-colecao-titulo">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 id="ambientes-colecao-titulo" className="text-sm font-medium text-fg">
                  Ambientes <span className="font-normal text-fg-2">(opcional)</span>
                </h3>
                <label className="relative block w-full sm:max-w-[220px]">
                  <span className="sr-only">Pesquisar ambientes pelo nome</span>
                  <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-icon-muted" />
                  <input
                    type="search"
                    value={pesquisa}
                    onChange={(event) => setPesquisa(event.target.value)}
                    placeholder="Pesquisar pelo nome"
                    autoComplete="off"
                    disabled={salvando}
                    className="h-10 w-full rounded-[10px] border border-line bg-surface pl-9 pr-3 text-sm text-fg outline-none placeholder:text-fg-3 hover:border-line-strong focus:border-focus focus:ring-1 focus:ring-focus"
                  />
                </label>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-fg-2">
                Os ambientes marcados serão tocados na ordem da marcação.
              </p>

              {erroAmbientes && (
                <div role="alert" className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-line-subtle bg-danger-soft px-3 py-2.5 text-sm text-danger">
                  <span>{erroAmbientes}</span>
                  {onTentarCarregarAmbientes && (
                    <button type="button" onClick={onTentarCarregarAmbientes} className="shrink-0 font-medium underline underline-offset-2">
                      Tentar novamente
                    </button>
                  )}
                </div>
              )}

              <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-line-subtle bg-surface">
                {carregandoAmbientes ? (
                  <div className="flex items-center justify-center gap-3 px-4 py-8 text-sm text-fg-2" role="status">
                    <span className="size-5 animate-spin rounded-full border-2 border-line border-t-accent" />
                    Carregando ambientes...
                  </div>
                ) : ambientesDisponiveis.length === 0 ? (
                  <p className="px-4 py-7 text-center text-sm text-fg-2">
                    Você ainda não possui ambientes sonoros disponíveis.
                  </p>
                ) : ambientesFiltrados.length === 0 ? (
                  <p className="px-4 py-7 text-center text-sm text-fg-2">
                    Nenhum ambiente corresponde à pesquisa.
                  </p>
                ) : (
                  <ul className="divide-y divide-line-subtle">
                    {ambientesFiltrados.map((ambiente) => {
                      const id = ambiente.idAmbienteSonoro || ambiente.id;
                      const ordem = idsSelecionados.indexOf(id);
                      const selecionado = ordem !== -1;
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            aria-pressed={selecionado}
                            onClick={() => alternarAmbiente(id)}
                            disabled={salvando}
                            className="flex min-h-[62px] w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span className={`grid size-7 shrink-0 place-items-center rounded-full border text-xs font-medium tabular-nums ${selecionado ? "border-accent bg-accent text-on-accent" : "border-line-strong text-transparent"}`} aria-hidden="true">
                              {selecionado ? ordem + 1 : ""}
                            </span>
                            <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-line-subtle bg-bg-2">
                              {ambiente.imagem ? (
                                <img src={ambiente.imagem} alt="" loading="lazy" className="size-full object-cover" />
                              ) : (
                                <AudioLines size={18} className="text-icon-muted" strokeWidth={1.5} />
                              )}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">
                              {ambiente.nome}
                            </span>
                            <span className={`grid size-5 shrink-0 place-items-center rounded-full border ${selecionado ? "border-accent bg-accent text-on-accent" : "border-line-strong text-transparent"}`} aria-hidden="true">
                              {selecionado && <Check size={13} strokeWidth={2.5} />}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>
          </form>
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-line-subtle px-6 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onFechar} disabled={salvando} className="user-button user-button-secondary user-button-md disabled:cursor-not-allowed disabled:opacity-60">
            Cancelar
          </button>
          <button type="submit" form="form-colecao" disabled={salvando} className="user-button user-button-primary user-button-md disabled:cursor-not-allowed disabled:opacity-60">
            <IconeAcao size={16} strokeWidth={1.8} />
            {salvando ? textoSalvando : textoBotao}
          </button>
        </footer>
      </section>
    </div>
  );
}
