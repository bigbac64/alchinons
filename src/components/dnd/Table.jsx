import { useEffect, useRef, useState } from "react";
import { DndContext, rectIntersection } from "@dnd-kit/core";
import DragEntity from "./Dragger.jsx";
import DropZone from "./DropZone.jsx";
import ScrollCraft from "../craft/ScrollCraft.jsx";
import Button from "../Button/Button.jsx";
import { craft, listenEngineEvents } from "../../utils/api.js";

const CAULDRON_ZONE = "cauldron";
const COLUMNS = 4;

function layoutItems(recipes) {
  return recipes.map((recipe, index) => ({
    id: recipe.id,
    recipe,
    position: {
      x: 16 + (index % COLUMNS) * 190,
      y: 16 + Math.floor(index / COLUMNS) * 140,
    },
  }));
}

const TableScroll = (props) => {
  const { className, recipes = [], player, ...other } = props;
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [crafting, setCrafting] = useState(false);
  const [craftError, setCraftError] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    setItems(layoutItems(recipes));
  }, [recipes]);

  useEffect(() => {
    const unlisten = listenEngineEvents({
      InventoryUpdated: () => setCrafting(false),
      CraftFailed: ({ recipe: label }) => {
        setCrafting(false);
        setCraftError(label);
        setTimeout(() => setCraftError(null), 1200);
      },
    });
    return () => { unlisten.then((fn) => fn()); };
  }, []);

  function handleDragEnd({ active, delta, over }) {
    if (over?.id === CAULDRON_ZONE) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      setItems((items) =>
        items.map((item) =>
          item.id === active.id
            ? {
                ...item,
                position: {
                  x: over.rect.left - canvasRect.left + 6,
                  y: over.rect.top - canvasRect.top + 12,
                },
              }
            : item
        )
      );
      setActiveId(active.id);
      return;
    }

    setItems((items) =>
      items.map((item) =>
        item.id === active.id
          ? {
              ...item,
              position: {
                x: item.position.x + delta.x,
                y: item.position.y + delta.y,
              },
            }
          : item
      )
    );

    if (active.id === activeId) setActiveId(null);
  }

  const activeItem = items.find((item) => item.id === activeId);

  function handleBump() {
    if (!activeItem || crafting) return;
    setCrafting(true);
    craft(activeItem.recipe.id, "player");
  }

  return (
    <div className={["w-full", className].join(" ")} {...other}>
      <div className="relative select-none w-full h-[28rem] border-2 border-slate-700 rounded-2xl overflow-hidden">
        <DndContext onDragEnd={handleDragEnd} collisionDetection={rectIntersection}>
          <DropZone ref={canvasRef} id="table" className="w-full h-full top-0 left-0">
            {items.map((item) => (
              <DragEntity key={item.id} entity={item}>
                <ScrollCraft recipe={item.recipe} inventory={player} active={item.id === activeId} />
              </DragEntity>
            ))}

            <DropZone
              id={CAULDRON_ZONE}
              className={`right-1.5 bottom-3 w-1/4 h-1/3 flex items-start justify-center pt-1 ${craftError ? "border-red-500" : ""}`}
            >
              <span className="text-[10px] uppercase tracking-widest text-slate-500">Chaudron</span>
            </DropZone>
          </DropZone>
        </DndContext>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-slate-700 bg-[#161d2e] px-4 py-2.5">
        <span className="text-sm text-slate-300">
          {craftError
            ? `Ressources insuffisantes pour ${craftError}.`
            : activeItem
              ? `Prêt à forger : ${activeItem.recipe.label}`
              : "Déposez un scroll dans le chaudron pour lancer un craft."}
        </span>
        <Button variant="dumper" onClick={handleBump} disabled={!activeItem || crafting}>
          {crafting ? "…" : "Bump"}
        </Button>
      </div>
    </div>
  );
};

export default TableScroll;
