import React from "react";
import { useDrag } from "react-dnd";
import { Material } from "./interfaces/type";

interface OreBodyItemProps {
  oreBodyId: string;
  fontColor: string;
  oreBody: any;
}
const OreBodyItem: React.FC<OreBodyItemProps> = ({
  oreBodyId,
  oreBody,
  fontColor,
}) => {
  function DragTarget({ id, value, disabled, onDragStart, children }) {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: "TARGETMATERIAL",
      item: { id: id, value: value },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));

    return (
      <div
        className={"ore-body-item " + (oreBody ? "filled" : "empty")}
        style={{
          opacity: isDragging ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "move",
        }}
        draggable
        ref={drag}
        onDragStart={disabled ? (e) => e.preventDefault() : onDragStart}
      >
        {children}
      </div>
    );
  }

  return (
    <DragTarget
      id={"material"}
      disabled={oreBody !== "" ? false : true}
      value={oreBody}
      onDragStart={() => {}}
    >
      <p className="ore-body-label">{oreBody.name}</p>
    </DragTarget>
  );
};

export default OreBodyItem;
