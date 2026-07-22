import React, {useEffect, useState} from 'react';
import {useDraggable} from "@dnd-kit/core";
import {CSS} from "@dnd-kit/utilities";

const DragEntity = (props) => {
  const {entity, className, children, ...other} = props;

  const {setNodeRef, listeners, attributes, transform} = useDraggable({
    id: entity.id
  });

  return (
    <div className={["select-none touch-none", className].join(" ")}
         ref={setNodeRef}
         {...listeners}
         {...attributes}
         style={{
           position: "absolute",
           left: entity.position.x,
           top: entity.position.y,
           transform: CSS.Translate.toString(transform),
         }}
         {...other}>

      {children}
    </div>
  );
}

export default DragEntity;