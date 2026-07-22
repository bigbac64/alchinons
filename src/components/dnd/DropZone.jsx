import {useDroppable} from "@dnd-kit/core";

const DropZone = ({className, id, ...other}) => {
  const {
    isOver,
    setNodeRef,
  } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
                absolute
                rounded-lg
                border-2
                ${isOver ? "border-blue-500" : "border-gray-500"}
                ${className}
            `}
      {...other}
    ></div>
  );
}

export default DropZone;
