const RESOURCE_ICONS = {
  Wood: "🪵",
  Stone: "🪨",
  Plank: "🪵",
  Charcoal: "⚫",
};

function ResourceIcon({ resource, className = "text-xl" }) {
  return <span className={className}>{RESOURCE_ICONS[resource] ?? "❔"}</span>;
}

/**
 * Slot d'affichage d'une ressource à l'unité : icône + quantité, ou
 * placeholder en pointillés si vide. Purement visuel (pas de drag and drop).
 */
export default function Slot({
  resource = null,
  placeholder = null,
  layout = "tile",
  className = "",
}) {
  const filled = !!resource;
  const showPlaceholder = !filled && placeholder;

  if (layout === "row") {
    return (
      <li
        className={`
          flex items-center justify-between px-4 py-2.5
          ${className}
        `}
      >
        <span className="flex items-center gap-2 text-slate-200">
          <ResourceIcon resource={resource?.name} className="text-base" />
          {resource?.name}
        </span>
        <span className="rounded-md bg-slate-700 px-2.5 py-0.5 font-mono text-sm text-emerald-300">
          {resource?.quantity}
        </span>
      </li>
    );
  }

  return (
    <div
      className={`
        flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5
        rounded-lg border-2 select-none
        ${filled ? "border-emerald-600 bg-emerald-950/40" : "border-dashed border-slate-600 bg-slate-800/40"}
        ${className}
      `}
    >
      {filled ? (
        <>
          <ResourceIcon resource={resource.name} />
          {resource.quantity > 1 && (
            <span className="font-mono text-[10px] text-emerald-300">{resource.quantity}</span>
          )}
        </>
      ) : showPlaceholder ? (
        <ResourceIcon resource={placeholder} className="text-xl opacity-30" />
      ) : null}
    </div>
  );
}
