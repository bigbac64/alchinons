import { forwardRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useMergedRefs } from "../../../hooks/useMergedRefs.js";

const DropZone = forwardRef(({ className, id, children, ...other }, ref) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  const setRefs = useMergedRefs(setNodeRef, ref);

  return (
    <div
      ref={setRefs}
      className={`
                absolute
                rounded-lg
                border-2
                ${isOver ? "border-blue-500" : "border-slate-600"}
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
