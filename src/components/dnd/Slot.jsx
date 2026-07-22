import { useDraggable, useDroppable } from "@dnd-kit/core";

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
 * Slot générique de drag and drop pour une ressource à l'unité (pas de fusion
 * de quantité pour l'instant). Source (draggable) et/ou cible (droppable) selon
 * les props : un item d'inventaire est draggable, un slot de besoin de craft est
 * droppable avec une contrainte `accepts`.
 */
export default function Slot({
  id,
  resource = null,
  draggable = false,
  droppable = false,
  accepts = null,
  placeholder = null,
  layout = "tile",
  dragData,
  className = "",
  onClick,
}) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id,
    data: dragData,
    disabled: !draggable || !resource,
  });

  const { setNodeRef: setDropRef, isOver, active } = useDroppable({
    id,
    data: { accepts },
    disabled: !droppable,
  });

  function setRefs(node) {
    setDragRef(node);
    setDropRef(node);
  }

  const filled = !!resource;
  const showPlaceholder = !filled && placeholder;
  const draggedResource = active?.data?.current?.resource;
  const isInvalidOver = droppable && isOver && accepts && draggedResource && draggedResource !== accepts;
  const dragProps = draggable && resource ? { ...listeners, ...attributes } : {};

  if (layout === "row") {
    return (
      <li
        ref={setRefs}
        {...dragProps}
        onClick={onClick}
        className={`
          flex items-center justify-between px-4 py-2.5 transition-colors
          ${draggable ? "cursor-grab active:cursor-grabbing hover:bg-slate-700/20" : ""}
          ${isDragging ? "opacity-30" : ""}
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
      ref={setRefs}
      {...dragProps}
      onClick={onClick}
      className={`
        flex h-14 w-14 shrink-0 flex-col items-center justify-center gap-0.5
        rounded-lg border-2 transition-colors select-none
        ${filled ? "border-emerald-600 bg-emerald-950/40" : "border-dashed border-slate-600 bg-slate-800/40"}
        ${droppable && isOver && !isInvalidOver ? "border-emerald-400 bg-emerald-900/50" : ""}
        ${isInvalidOver ? "border-red-500 bg-red-950/30" : ""}
        ${draggable && resource ? "cursor-grab active:cursor-grabbing" : ""}
        ${filled && onClick ? "cursor-pointer" : ""}
        ${isDragging ? "opacity-30" : ""}
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
