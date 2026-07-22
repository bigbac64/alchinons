import { useId, useMemo, useState } from "react";
import Slot from "../dnd/Slot.jsx";
import Button from "../Button/Button.jsx";

const SLOT_SIZE = 56;

/**
 * Formats de disposition des slots de besoin autour du slot de résultat.
 * Chaque format ne fait qu'une chose : donner la position (style) du slot
 * d'index `index` parmi `total`. Ajouter une disposition = ajouter une entrée.
 */
const FORMATS = {
  circle: (index, total, radius) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      left: `calc(50% + ${Math.cos(angle) * radius}px - ${SLOT_SIZE / 2}px)`,
      top: `calc(50% + ${Math.sin(angle) * radius}px - ${SLOT_SIZE / 2}px)`,
    };
  },
  line: (index, total, gap) => {
    return {
      left: `calc(${(index / total) * gap}px + ${SLOT_SIZE / 2}px)`,
      top: `50%`,
    };
  }
};

/**
 * Craft multi-ressource instantané : combine N slots de besoin (répartis selon
 * `format`) en un slot de résultat unique. Une même recette peut nécessiter
 * plusieurs unités d'une ressource (ex. 2x Bois) : elles sont éclatées en
 * autant de slots à l'unité, pas de gestion de quantité par slot pour l'instant.
 */
export default function ScrollCraft({
  recipe,
  filled,
  format = "line",
  className = "",
}) {
  const instanceId = useId();
  const [crafting, setCrafting] = useState(false);

  const needSlots = useMemo(() => (
    recipe?.inputs?.flatMap((input, inputIndex) =>
      Array.from({ length: input.quantity }, (_, unit) => ({
        id: `craft:${instanceId}:${inputIndex}:${unit}`,
        resourceName: input.resource,
      }))
    )
  ), [recipe, instanceId]);


  const output = recipe.outputs[0];
  const place = FORMATS[format] ?? FORMATS.circle;

  return (
    <div className={`rounded-xl border border-slate-700 bg-[#161d2e] overflow-hidden ${className}`}>
      <h3 className=" text-center text-m font-semibold uppercase tracking-widest text-slate-400 bg-slate-700">
        {recipe.label}
      </h3>

      <div className="relative mx-auto p-4 flex flex-row-reverse justify-between items-center gap-4">
        <div className="">
          <Slot
            id={`craft:${instanceId}:result`}
            resource={{ name: output.resource, quantity: output.quantity }}
            layout="tile"
            className={"border-emerald-400"}
          />
        </div>

        >

        <div className={"flex gap-2 flex-wrap flex-1 justify-center items-center"}>
          {needSlots.map((slot, index) => {
            const filledResource = "A";
            return (
              <div key={slot.id} >
                <Slot
                  id={slot.id}
                  resource={filledResource ? { name: filledResource, quantity: 1 } : null}
                  droppable={!filledResource}
                  accepts={slot.resourceName}
                  placeholder={slot.resourceName}
                  layout="tile"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
