import { DndContext, rectIntersection } from "@dnd-kit/core";
import DragEntity from "../ui/dnd/Dragger.jsx";
import DropZone from "../ui/dnd/DropZone.jsx";
import ScrollCraft from "./ScrollCraft.jsx";
import Button from "../ui/Button/Button.jsx";
import Panel from "../ui/Panel.jsx";
import { useCraft, CAULDRON_ZONE } from "../../hooks/useCraft.js";

const TableScroll = (props) => {
  const { className, recipes = [], player, ...other } = props;
  const {
    items, activeItem, crafting, craftError, topId,
    canvasRef, refs,
    handleDragStart, handleDragEnd, handleBump,
  } = useCraft(recipes);

  return (
    <div className={["w-full", className].join(" ")} {...other}>
      <div className="relative select-none w-full h-[70vh] border-2 border-slate-700 rounded-2xl">
        <DndContext onDragEnd={handleDragEnd} collisionDetection={rectIntersection} onDragStart={handleDragStart}>
          <DropZone ref={canvasRef} id="table" className="w-full h-full top-0 left-0">
            {items.map((item) => (
              <DragEntity getterRef={(el) => (refs.current[item.id] = el)} key={item.id} entity={item} zIndex={item.id === topId ? 20 : 10}>
                <ScrollCraft recipe={item.recipe} inventory={player} active={item.id === activeItem?.id} />
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

      <Panel className="mt-3 flex items-center justify-between gap-4 px-4 py-2.5">
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
      </Panel>
    </div>
  );
};

export default TableScroll;
