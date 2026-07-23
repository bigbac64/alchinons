import { useEffect, useRef, useState } from "react";
import { DndContext, rectIntersection } from "@dnd-kit/core";
import DragEntity from "../dnd/Dragger.jsx";
import DropZone from "../dnd/DropZone.jsx";
import ScrollCraft from "./ScrollCraft.jsx";
import Button from "../Button/Button.jsx";
import { craft, listenEngineEvents } from "../../utils/api.js";

const CAULDRON_ZONE = "cauldron";
const COLUMNS = 4;

function layoutItems(recipes) {
  return recipes.map((recipe, index) => ({
    id: recipe.id,
    recipe,
    position: defaultPositionItem(recipe, index),
    inCauldron: false,
  }));
}

function defaultPositionItem(item, index) {
  return {
    x: 16 ,
    y: 16 + Math.floor(index) * 60,
  }
}

const TableScroll = (props) => {
  const { className, recipes = [], player, ...other } = props;
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [crafting, setCrafting] = useState(false);
  const [craftError, setCraftError] = useState(null);
  const canvasRef = useRef(null);
  const [topId, setTopId] = useState(null);
  const refs = useRef({});

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

  function handleDragStart({ active }) {
    setTopId(active.id);
  }

  function handleDragEnd({ active, delta, over }) {
    if (over?.id === CAULDRON_ZONE) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      console.log(over)
      setItems((items) =>
        items.map((item, index) => {
          const node = refs.current[item.id];
          const width = node?.getBoundingClientRect().width ?? 0;
          const default_position = defaultPositionItem(item, index)

          return item.id === active.id
            ? {
              ...item,
              inCauldron: true,
              position: {
                x: over.rect.left - canvasRect.left + (over.rect.width - width) / 2,
                y: over.rect.top - canvasRect.top + 18,
              },
            }
            : item.inCauldron ?
              {
                ...item,
                inCauldron: false,
                position: {
                  x: default_position.x,
                  y: default_position.y,
                },
              }
              : item
          })
      );
      setActiveId(active.id);
      return;
    }

    setItems((items) =>
      items.map((item) =>
        item.id === active.id
          ? {
              ...item,
              inCauldron: false,
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
      <div className="relative select-none w-full h-[70vh] border-2 border-slate-700 rounded-2xl">
        <DndContext onDragEnd={handleDragEnd} collisionDetection={rectIntersection} onDragStart={handleDragStart}>
          <DropZone ref={canvasRef} id="table" className="w-full h-full top-0 left-0">
            {items.map((item) => (
              <DragEntity getterRef={(el) => (refs.current[item.id] = el)} key={item.id} entity={item} zIndex={item.id === topId ? 20 : 10}>
                <ScrollCraft recipe={item.recipe} inventory={player} active={item.id === activeId} />
              </DragEntity>
            ))}

            <DropZone
              id={CAULDRON_ZONE}
              className={`right-4 w-2xs h-60 bottom-4 flex items-start justify-center ${craftError ? "border-red-500" : ""}`}
            >
              <span className="text-[10px] uppercase tracking-widest text-slate-500">Imprimerie</span>
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
          {crafting ? "…" : "Fabriquer"}
        </Button>
      </div>
    </div>
  );
};

export default TableScroll;
