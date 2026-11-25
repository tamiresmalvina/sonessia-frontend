import {
  forwardRef,
  useId,
} from "react";
import {
  LoaderCircle,
  Search,
  X,
} from "lucide-react";

const buttonVariants = {
  primary: "user-button-primary",
  secondary: "user-button-secondary",
  ghost: "user-button-ghost",
  danger: "user-button-danger",
};

export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    icon: Icon,
    loading = false,
    className = "",
    children,
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`user-button ${size === "sm" ? "user-button-sm" : "user-button-md"} ${buttonVariants[variant] ?? buttonVariants.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <LoaderCircle size={16} className="animate-spin" aria-hidden />
      ) : Icon ? (
        <Icon size={size === "sm" ? 15 : 16} strokeWidth={1.8} aria-hidden />
      ) : null}
      {children}
    </button>
  );
});

export const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, className = "", overlay = false, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={`user-icon-button user-focus-ring ${overlay ? "bg-black/35 text-white hover:bg-black/55 hover:text-white" : ""} ${className}`}
      {...props}
    >
      <Icon size={18} strokeWidth={1.6} aria-hidden />
    </button>
  );
});

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
}) {
  return (
    <header className={`user-page-header ${className}`}>
      <div className="user-page-header-content">
        {eyebrow && <p className="user-page-eyebrow">{eyebrow}</p>}
        <h1 className="user-page-title">{title}</h1>
        {description && (
          <p className="user-page-description">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}

export function SectionHeading({
  title,
  count,
  aside,
  hint,
  className = "",
}) {
  return (
    <div className={`user-section-heading ${className}`}>
      <div className="min-w-0">
        <h2 className="user-section-title">
          {title}
          {count !== undefined && (
            <span className="user-section-count">{count}</span>
          )}
        </h2>
        {hint && <p className="user-section-hint">{hint}</p>}
      </div>
      {aside}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  label = "Pesquisar",
  placeholder = "Pesquisar...",
  className = "",
}) {
  const id = useId();

  return (
    <div className={`relative w-full sm:max-w-[320px] ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        size={16}
        strokeWidth={1.6}
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-icon-muted"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="user-input pl-10 pr-10 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          aria-label="Limpar pesquisa"
          onClick={() => onChange("")}
          className="user-icon-button absolute right-1 top-1/2 size-9 -translate-y-1/2"
        >
          <X size={15} strokeWidth={1.8} aria-hidden />
        </button>
      )}
    </div>
  );
}

export function SelectField({
  value,
  onChange,
  label,
  options,
  className = "",
}) {
  const id = useId();

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <label htmlFor={id} className="shrink-0 text-[13px] text-fg-3">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="user-input w-auto min-w-0"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SegmentedControl({
  label,
  options,
  value,
  onChange,
  className = "",
}) {
  return (
    <div className={`-mx-5 flex overflow-x-auto px-5 sm:mx-0 sm:px-0 ${className}`}>
      <div
        role="group"
        aria-label={label}
        className="flex shrink-0 gap-0.5 rounded-[10px] border border-line-subtle bg-bg-2 p-1"
      >
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`h-9 shrink-0 rounded-[7px] px-4 text-[13px] transition-colors user-focus-ring ${
                selected
                  ? "lift bg-accent text-on-accent hover:bg-accent-hover"
                  : "text-fg-2 hover:bg-surface-hover hover:text-fg"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  hint,
  error,
  maxLength,
  rows = 3,
  className = "",
}) {
  const id = useId();
  const messageId = `${id}-message`;

  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="user-field-label mb-0">
          {label}
        </label>
        {maxLength !== undefined && (
          <span className="font-mono text-[11px] tabular-nums text-fg-3" aria-hidden>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={hint || error ? messageId : undefined}
        className={`user-textarea ${error ? "border-danger" : ""}`}
      />
      {error ? (
        <p id={messageId} className="user-field-error">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="user-field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Avatar({ name = "", src, size = 40, className = "" }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-accent-soft font-medium text-accent ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
      }}
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        initials || "?"
      )}
    </span>
  );
}

export function Skeleton({ className = "" }) {
  return <div aria-hidden className={`user-skeleton ${className}`} />;
}

export function LoadingRegion({ children, label = "Carregando..." }) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
