import {
  AudioLines,
  Folder,
  MoreHorizontal,
  Pause,
  Play,
} from "lucide-react";
import { IconButton } from "./UserUI";

export function PlayButton({
  playing = false,
  onClick,
  label,
  size = "md",
  className = "",
}) {
  const dimension = size === "sm" ? "size-9" : "size-11";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ?? (playing ? "Pausar reprodução" : "Reproduzir")}
      aria-pressed={playing}
      className={`play grid ${dimension} shrink-0 place-items-center rounded-full text-white transition-[filter] duration-150 hover:brightness-110 user-focus-ring ${className}`}
    >
      {playing ? (
        <Pause size={16} fill="currentColor" strokeWidth={0} />
      ) : (
        <Play size={16} fill="currentColor" strokeWidth={0} className="translate-x-px" />
      )}
    </button>
  );
}

export function EnvironmentCard({
  environment,
  playing = false,
  onPlay,
  onOpen,
  onMenu,
  menuLabel = "Ações do ambiente",
  className = "",
}) {
  const env = environment ?? {};
  const image = env.image ?? env.img ?? env.cover;
  const title = env.name ?? env.title ?? "Ambiente sem título";
  const description = env.description ?? "";
  const sounds = env.sounds ?? env.soundNames ?? [];

  return (
    <article className={`user-card group ${className}`}>
      <div className="relative">
        {image ? (
          <img
            src={image}
            alt={env.imageAlt ?? env.alt ?? ""}
            className="user-card-image"
          />
        ) : (
          <div className="user-card-image grid place-items-center bg-bg-2 text-fg-3">
            <AudioLines size={28} strokeWidth={1.4} aria-hidden />
          </div>
        )}

        {env.kind === "platform" && (
          <span className="absolute left-3 top-3 rounded-md bg-black/45 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            Sonessia
          </span>
        )}

        {onMenu && (
          <div className="absolute right-2 top-2">
            <IconButton
              icon={MoreHorizontal}
              label={menuLabel}
              overlay
              onClick={onMenu}
            />
          </div>
        )}
      </div>

      <div className="user-card-content">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onOpen}
            className="min-w-0 flex-1 text-left user-focus-ring rounded-sm"
          >
            <h3 className="user-card-title">{title}</h3>
            {description && (
              <p className="user-card-description">{description}</p>
            )}
          </button>
          {onPlay && <PlayButton playing={playing} onClick={onPlay} size="sm" />}
        </div>

        {sounds.length > 0 && (
          <div className="user-card-meta">
            <AudioLines size={14} strokeWidth={1.5} aria-hidden />
            <span className="truncate">
              {Array.isArray(sounds) ? sounds.join(" · ") : sounds}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

export function CollectionThumbnail({
  collection,
  environments = [],
  className = "",
}) {
  const ids = collection?.environmentIds ?? collection?.envIds ?? [];
  const covers = ids
    .map((id) => environments.find((environment) => String(environment.id) === String(id)))
    .filter(Boolean)
    .slice(0, 4);

  if (!covers.length) {
    return (
      <div className={`grid aspect-square place-items-center bg-bg-2 text-fg-3 ${className}`}>
        <Folder size={32} strokeWidth={1.4} aria-hidden />
      </div>
    );
  }

  if (covers.length === 1) {
    const cover = covers[0];
    const image = cover.image ?? cover.img ?? cover.cover;

    return image ? (
      <img
        src={image}
        alt=""
        className={`aspect-square w-full object-cover ${className}`}
      />
    ) : (
      <div className={`grid aspect-square place-items-center bg-bg-2 text-fg-3 ${className}`}>
        <AudioLines size={30} aria-hidden />
      </div>
    );
  }

  return (
    <div className={`grid aspect-square grid-cols-2 grid-rows-2 overflow-hidden ${className}`}>
      {covers.map((environment) => {
        const image = environment.image ?? environment.img ?? environment.cover;

        return image ? (
          <img
            key={environment.id}
            src={image}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div key={environment.id} className="grid place-items-center bg-bg-2 text-fg-3">
            <AudioLines size={18} aria-hidden />
          </div>
        );
      })}
      {covers.length < 4 &&
        Array.from({ length: 4 - covers.length }).map((_, index) => (
          <div key={`empty-${index}`} className="grid place-items-center bg-bg-2 text-fg-3">
            <Folder size={18} aria-hidden />
          </div>
        ))}
    </div>
  );
}

export function CollectionCard({
  collection,
  environments = [],
  onOpen,
  onMenu,
  menuLabel = "Ações da coleção",
  className = "",
}) {
  const item = collection ?? {};
  const name = item.name ?? item.title ?? "Coleção sem título";
  const description = item.description ?? "";
  const ids = item.environmentIds ?? item.envIds ?? [];
  const count = item.environmentCount ?? ids.length;

  return (
    <article className={`user-card group ${className}`}>
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left user-focus-ring"
      >
        <CollectionThumbnail
          collection={item}
          environments={environments}
        />
      </button>

      <div className="user-card-content">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onOpen}
            className="min-w-0 flex-1 text-left user-focus-ring rounded-sm"
          >
            <h3 className="user-card-title">{name}</h3>
            {description && <p className="user-card-description">{description}</p>}
          </button>

          {onMenu && (
            <IconButton
              icon={MoreHorizontal}
              label={menuLabel}
              onClick={onMenu}
              className="-mr-2 -mt-1 size-9"
            />
          )}
        </div>

        <div className="user-card-meta">
          <span>
            {count} {count === 1 ? "ambiente" : "ambientes"}
          </span>
          {item.updatedAt && (
            <>
              <span aria-hidden>·</span>
              <span>{item.updatedLabel ?? item.updatedAt}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
