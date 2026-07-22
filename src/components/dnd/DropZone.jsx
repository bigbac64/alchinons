import { forwardRef } from "react";
import { useDroppable } from "@dnd-kit/core";

const DropZone = forwardRef(({ className, id, children, ...other }, ref) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  function setRefs(node) {
    setNodeRef(node);
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }

  return (
    <div
      ref={setRefs}
      className={`
                absolute
                rounded-lg
                border-2
                ${isOver ? "border-blue-500" : "border-gray-500"}
                ${className}
            `}
      {...other}
    >
      {children}
    </div>
  );
});

DropZone.displayName = "DropZone";

export default DropZone;
