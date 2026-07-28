import { useEffect, useRef, useState } from "react";
import { craft, listenEngineEvents } from "../api/engine.js";

export const CAULDRON_ZONE = "cauldron";

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
    x: 16,
    y: 16 + Math.floor(index) * 60,
  };
}

/**
 * État et logique du plateau de craft : positionnement des scrolls de
 * recette, dépôt dans le chaudron, déclenchement du craft côté moteur et
 * écoute des events `InventoryUpdated`/`CraftFailed`. Extrait de
 * `TableScroll.jsx`, qui ne garde que le rendu (DnD + affichage).
 * @param {Array} recipes
 */
export function useCraft(recipes) {
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [crafting, setCrafting] = useState(false);
  const [craftError, setCraftError] = useState(null);
  const [topId, setTopId] = useState(null);
  const canvasRef = useRef(null);
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
      setItems((items) =>
        items.map((item, index) => {
          const node = refs.current[item.id];
          const width = node?.getBoundingClientRect().width ?? 0;
          const default_position = defaultPositionItem(item, index);

          return item.id === active.id
            ? {
                ...item,
                inCauldron: true,
                position: {
                  x: over.rect.left - canvasRect.left + (over.rect.width - width) / 2,
                  y: over.rect.top - canvasRect.top + 18,
                },
              }
            : item.inCauldron
              ? {
                  ...item,
                  inCauldron: false,
                  position: {
                    x: default_position.x,
                    y: default_position.y,
                  },
                }
              : item;
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

  return {
    items,
    activeItem,
    crafting,
    craftError,
    topId,
    canvasRef,
    refs,
    handleDragStart,
    handleDragEnd,
    handleBump,
  };
}
