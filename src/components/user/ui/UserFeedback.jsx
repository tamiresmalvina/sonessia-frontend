import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  CircleAlert,
  Info,
  RotateCw,
  X,
} from "lucide-react";
import { Button, IconButton } from "./UserUI";
import { ToastContext } from "./useToast";

const toneConfig = {
  success: {
    Icon: Check,
    wrapper: "bg-success-soft",
    icon: "text-success",
  },
  error: {
    Icon: CircleAlert,
    wrapper: "bg-danger-soft",
    icon: "text-danger",
  },
  info: {
    Icon: Info,
    wrapper: "bg-accent-subtle",
    icon: "text-accent",
  },
};

export function Banner({ tone = "info", children, className = "" }) {
  const config = toneConfig[tone] ?? toneConfig.info;
  const { Icon } = config;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`user-feedback-banner ${config.wrapper} ${className}`}
    >
      <Icon
        size={17}
        strokeWidth={1.8}
        aria-hidden
        className={`mt-px shrink-0 ${config.icon}`}
      />
      <div className="min-w-0 text-fg">{children}</div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  children,
  actions,
  className = "",
}) {
  return (
    <div className={`user-empty-state ${className}`}>
      <span className="user-empty-icon">
        {Icon && <Icon size={22} strokeWidth={1.5} aria-hidden />}
      </span>
      <h2 className="user-empty-title">{title}</h2>
      {children && <p className="user-empty-description">{children}</p>}
      {actions && (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Não foi possível carregar",
  description = "Houve um problema de conexão. Seus dados estão seguros — tente novamente em instantes.",
  onRetry,
  className = "",
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center rounded-xl border border-line-subtle bg-danger-soft px-6 py-16 text-center ${className}`}
    >
      <span className="grid size-12 place-items-center rounded-xl bg-surface text-danger">
        <CircleAlert size={22} strokeWidth={1.5} aria-hidden />
      </span>
      <h2 className="mt-5 text-xl font-medium tracking-[-0.02em]">{title}</h2>
      <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-fg-2">
        {description}
      </p>
      {onRetry && (
        <Button variant="secondary" icon={RotateCw} onClick={onRetry} className="mt-7">
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

let toastSequence = 0;

export function ToastProvider({ children, initialMessage }) {
  const [items, setItems] = useState([]);
  const initialShown = useRef(false);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((message, options = {}) => {
    const id = ++toastSequence;
    const item = {
      id,
      message,
      tone: options.tone ?? "success",
      action: options.action,
    };

    setItems((current) => [...current.slice(-2), item]);

    const timeout = options.action ? 8000 : 4800;
    const timer = setTimeout(() => dismiss(id), timeout);
    timers.current.set(id, timer);

    return id;
  }, [dismiss]);

  useEffect(() => {
    if (initialMessage && !initialShown.current) {
      initialShown.current = true;
      push(initialMessage, { tone: "success" });
    }
  }, [initialMessage, push]);

  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-[68px] z-[70] flex flex-col items-center gap-2 px-4 md:top-5"
      >
        {items.map((item) => {
          const config = toneConfig[item.tone] ?? toneConfig.info;
          const { Icon } = config;

          return (
            <div key={item.id} className="user-toast pointer-events-auto">
              <Icon size={16} strokeWidth={2} aria-hidden className={config.icon} />
              <span className="min-w-0 flex-1 py-1">{item.message}</span>
              {item.action && (
                <button
                  type="button"
                  onClick={() => {
                    item.action.run();
                    dismiss(item.id);
                  }}
                  className="h-9 rounded-md px-3 text-[13px] font-medium text-accent hover:bg-accent-soft user-focus-ring"
                >
                  {item.action.label}
                </button>
              )}
              <IconButton
                label="Fechar aviso"
                icon={X}
                onClick={() => dismiss(item.id)}
                className="size-9"
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
