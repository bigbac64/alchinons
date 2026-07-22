import React, {useEffect, useRef, useState} from 'react';
import {DndContext, DragOverlay, rectIntersection} from "@dnd-kit/core";
import DragEntity from "./Dragger.jsx";
import DropZone from "./DropZone.jsx";
import ScrollCraft from "../craft/ScrollCraft.jsx";

const TableScroll = (props) => {
  const {className, children, recipes, ...other} = props;
  const [items, setItems] = useState();
  const canvas = useRef()

  useEffect(() => {
    setItems([{id: 'name', position: {x: 100, y: 50}}, {id: 'namo', position: {x: 100, y: 60}}])
  }, []);

  function handleDragEnd(event) {
    const {active, over} = event;

    console.log(over)
    if (!over) {
      return;
    }
    const rect = canvas.current.getBoundingClientRect()

    switch (over.id) {
      case "inv":
        console.log("inv");
        setItems(items =>
          items.map(item =>
            item.id === event.active.id
              ? {
                ...item,
                position: {
                  x: 6 + over.rect.left - rect.left,
                  y: 12 + over.rect.top - rect.top,
                },
              }
              : item
          )
        );
        break;

      case "trash":
        console.log("Supprimer");
        break;

      default:
        console.log("defaulted")
        setItems(items => items?.map(item => {
              console.log(item.x + event.delta.x)
              console.log(item.x)
              console.log(event.delta.x)
              console.log(event.active.id)
              return item.id === event.active.id
                ? {
                  ...item,
                  position: {
                    x: item.position.x + event.delta.x,
                    y: item.position.y + event.delta.y,
                  }
                }
                : item
            }
          )
        );
    }
  }

  return (
    <div className={["relative select-none w-full h-2/3 border-2 border-slate-700 rounded-2xl", className].join(" ")} {...other}>
      <DndContext onDragEnd={handleDragEnd}
                  collisionDetection={rectIntersection}
      >
        <DropZone ref={canvas} id={"table"} className={"w-full h-full top-0 left-0"}>
          {items?.map((item, i) => (
            <DragEntity
              key={item.id}
              entity={item}
            >
              <ScrollCraft recipe={recipes[i]}/>
            </DragEntity>
          ))}

          <DropZone id={"inv"} className={"right-1.5 bottom-3 w-1/4 h-1/3 z-0"}/>
        </DropZone>

      </DndContext>
      </div>
  );
}

export default TableScroll;