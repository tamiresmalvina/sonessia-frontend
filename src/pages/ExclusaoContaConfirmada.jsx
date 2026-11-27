import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CalendarClock, LoaderCircle } from "lucide-react";
import { useAuth } from "../contexts/useAuth.js";
import {
  assinarEsperaLogoutExclusao,
  calcularSegundosRestantes,
  limparEsperaLogoutExclusao,
  obterEsperaLogoutExclusao,
} from "../utils/exclusaoContaSuccess.js";

function formatarData(valor) {
  const data = new Date(valor);
  if (!valor || Number.isNaN(data.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

export default function ExclusaoContaConfirmada() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const estado = obterEsperaLogoutExclusao();
  const [segundos, setSegundos] = useState(() =>
    estado ? calcularSegundosRestantes(estado.prazoLogoutEm, Date.now()) : 30,
  );
  const [saindo, setSaindo] = useState(false);
  const finalizacaoIniciada = useRef(false);
  const dataExclusao = formatarData(estado?.exclusaoDefinitivaEm);

  const sair = useCallback(async () => {
    if (finalizacaoIniciada.current) return;
    finalizacaoIniciada.current = true;
    setSaindo(true);
    try {
      await logout();
    } finally {
      limparEsperaLogoutExclusao();
      navigate("/login", {
        replace: true,
        state: { mensagem: "Você saiu da conta. A solicitação de exclusão está registrada." },
      });
    }
  }, [logout, navigate]);

  useEffect(() => {
    const espera = obterEsperaLogoutExclusao();
    if (!espera) {
      navigate("/login", { replace: true });
      return undefined;
    }

    function atualizarContagem() {
      const restante = calcularSegundosRestantes(espera.prazoLogoutEm, Date.now());
      setSegundos(restante);
      if (restante === 0) void sair();
    }

    const atualizacaoInicial = setTimeout(atualizarContagem, 0);
    const timer = setInterval(atualizarContagem, 1000);
    const cancelarNaOutraAba = () => {
      if (!obterEsperaLogoutExclusao()) navigate("/login", { replace: true });
    };
    const pararEscuta = assinarEsperaLogoutExclusao(cancelarNaOutraAba);
    return () => {
      clearTimeout(atualizacaoInicial);
      clearInterval(timer);
      pararEscuta();
    };
  }, [navigate, sair]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-8 sm:px-6">
      <section aria-labelledby="exclusao-confirmada-titulo" className="w-full max-w-xl rounded-2xl border border-line-subtle bg-surface p-6 text-center shadow-sm sm:p-9">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-success" aria-hidden="true">
          <CalendarClock size={26} strokeWidth={2} />
        </span>
        <h1 id="exclusao-confirmada-titulo" className="mt-5 text-2xl font-medium tracking-[-0.03em] text-fg">Solicitação de exclusão realizada</h1>
        <p className="mt-4 text-sm leading-relaxed text-fg-2">Sua conta foi desativada e sua solicitação de exclusão foi registrada com sucesso. Você receberá um e-mail com os detalhes e as instruções para recuperar sua conta.</p>

        <div className="mx-auto mt-5 max-w-md rounded-xl bg-bg-2 px-4 py-4">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-fg-2"><CalendarClock size={17} aria-hidden="true" />Sua conta será excluída definitivamente em:</p>
          <p className="mt-2 text-base font-semibold text-accent">{dataExclusao || "Data indisponível"}</p>
          {dataExclusao && <p className="mt-1 text-xs text-fg-3">Horário de Brasília</p>}
        </div>

        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-fg-2">Você poderá recuperar sua conta até essa data. Para isso, basta tentar entrar novamente no Sonessia e confirmar a reativação.</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-fg-2">Se você não fizer nada, a exclusão será processada definitivamente após o prazo.</p>

        <p role="status" aria-live="polite" className="mx-auto mt-5 flex items-center justify-center gap-2 text-sm text-fg-3">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>Você será desconectado automaticamente em <span className="font-mono font-semibold tabular-nums text-accent">{segundos}</span> segundos.</span>
        </p>
        <button type="button" disabled={saindo} onClick={() => void sair()} className="user-button user-button-md user-button-primary mx-auto mt-6 min-h-12 min-w-52">
          {saindo && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
          {saindo ? "Encerrando sessão…" : "Entendi, sair da minha conta"}
        </button>
      </section>
    </main>
  );
}
