import React from "react";
import "./styles/truckItem.scss";
import { ActiveBenchData } from "./interfaces/type";
import { useDrag } from "react-dnd";

interface ActiveBenchItemProps {
  benchItem: any;
}
const ActiveBenchItem: React.FC<ActiveBenchItemProps> = ({ benchItem }) => {

  function DragTarget({ id, value, disabled, onDragStart, style, children }) {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: "image",
      item: { id: id, value: value },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));

    return (
      <div
        className={style}
        style={{ opacity: isDragging ? 0.5 : 1 }}
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
      id={"location"}
      style="benches-item"
      disabled={benchItem !== "" ? false : true}
      value={benchItem}
      onDragStart={() => { }}
    >
      <p className="benches-item-label">
        {benchItem.name} - {benchItem.blockId}
      </p>
    </DragTarget>
  );
};

export default ActiveBenchItem;
