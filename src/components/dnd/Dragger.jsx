import React, {useEffect, useState} from 'react';
import {useDraggable} from "@dnd-kit/core";
import {CSS} from "@dnd-kit/utilities";

const DragEntity = (props) => {
  const {entity, getterRef, className, children, zIndex, ...other} = props;

  const {setNodeRef, listeners, attributes, transform} = useDraggable({
    id: entity.id
  });

  function setRefs(node) {
    setNodeRef(node);
    getterRef?.(node);
  }

  return (
    <div className={["select-none touch-none", className].join(" ")}
         ref={setRefs}
         {...listeners}
         {...attributes}
         style={{
           position: "absolute",
           left: entity.position.x,
           top: entity.position.y,
           transform: CSS.Translate.toString(transform),
           zIndex: zIndex,
         }}
         {...other}>

      {children}
    </div>
  );
}

export default DragEntity;