import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft, Clock } from "lucide-react";

export default function Ambientes() {
  return (
    <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border border-line-subtle bg-surface p-8 text-center animate-fadeIn">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent shadow-xs">
        <Sparkles size={32} />
      </div>

      <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-line-subtle bg-bg px-3 py-1 text-xs font-medium text-fg-3">
        <Clock size={13} className="text-accent" />
        <span>Funcionalidade em desenvolvimento</span>
      </div>

      <h2 className="mt-4 text-2xl font-bold tracking-tight text-fg">
        Ambientes Prontos
      </h2>

      <p className="mt-2 max-w-md text-sm leading-relaxed text-fg-2">
        A curadoria e configuração de composições sonoras padrão (foco, relaxamento, chuva, ruídos harmônicos) serão implementadas na próxima etapa.
      </p>

      <div className="mt-8">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 rounded-xl bg-[image:linear-gradient(100deg,#7656a8,#6474c8)] px-5 py-2.5 text-sm font-medium text-white shadow-xs transition-all duration-200 hover:bg-[image:linear-gradient(100deg,#684a98,#5667b8)] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <ArrowLeft size={16} />
          <span>Voltar para Visão geral</span>
        </Link>
      </div>
    </div>
  );
}
