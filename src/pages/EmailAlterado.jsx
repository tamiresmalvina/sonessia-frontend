import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, LoaderCircle } from "lucide-react";
import { useAuth } from "../contexts/useAuth.js";
import { calcularSegundosRestantes, limparPrazoSaidaEmail, obterPrazoSaidaEmail } from "../utils/emailAlteradoSuccess.js";

export default function EmailAlterado() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [segundos, setSegundos] = useState(30);
  const [saindo, setSaindo] = useState(false);
  const finalizacaoIniciada = useRef(false);
  const email = typeof state?.novoEmail === "string" ? state.novoEmail : "";

  const sair = useCallback(async () => {
    if (finalizacaoIniciada.current) return;
    finalizacaoIniciada.current = true;
    setSaindo(true);
    await logout();
    limparPrazoSaidaEmail();
    navigate("/login", {
      replace: true,
      state: { mensagem: "Todas as sessões foram encerradas por segurança. Entre novamente com seu novo e-mail." },
    });
  }, [logout, navigate]);

  useEffect(() => {
    const prazo = obterPrazoSaidaEmail();
    if (prazo === null) {
      navigate("/login", { replace: true });
      return undefined;
    }

    function atualizarContagem() {
      const restante = calcularSegundosRestantes(prazo, Date.now());
      setSegundos(restante);
      if (restante === 0) void sair();
    }

    const atualizacaoInicial = setTimeout(atualizarContagem, 0);
    const timer = setInterval(atualizarContagem, 1000);
    return () => {
      clearTimeout(atualizacaoInicial);
      clearInterval(timer);
    };
  }, [navigate, sair]);

  return <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-8 sm:px-6">
    <section aria-labelledby="email-alterado-titulo" className="w-full max-w-xl rounded-2xl border border-line-subtle bg-surface p-6 text-center shadow-sm sm:p-9">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-success-soft text-success" aria-hidden="true">
        <Check size={27} strokeWidth={2.2} />
      </span>
      <h1 id="email-alterado-titulo" className="mt-5 text-2xl font-medium tracking-[-0.03em] text-fg">E-mail alterado com sucesso!</h1>
      <p className="mt-4 text-sm leading-relaxed text-fg-2">Seu endereço de e-mail foi atualizado para:</p>
      <p className="mt-1 break-all text-base font-semibold text-accent">{email || "seu novo endereço de e-mail"}</p>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-fg-2">Por segurança, todas as sessões da sua conta serão encerradas. Você precisará entrar novamente utilizando seu novo e-mail.</p>
      <p role="status" aria-live="polite" className="mt-5 text-sm text-fg-3">
        Você será desconectado automaticamente em <span className="font-mono font-medium tabular-nums text-accent">{segundos}</span> segundos.
      </p>
      <button type="button" disabled={saindo} onClick={() => void sair()} className="user-button user-button-md user-button-primary mx-auto mt-6 min-h-12 min-w-52">
        {saindo && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
        {saindo ? "Encerrando sessão…" : "Entrar novamente agora"}
      </button>
    </section>
  </main>;
}
