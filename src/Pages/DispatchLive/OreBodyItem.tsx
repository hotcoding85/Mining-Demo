import React from "react";
import { useDrag } from "react-dnd";
import { Material } from "./interfaces/type";

interface OreBodyItemProps {
  oreBodyId: string;
  fontColor: string;
  oreBody: Material;
}
const OreBodyItem: React.FC<OreBodyItemProps> = ({
  oreBodyId,
  oreBody,
  fontColor,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: "TARGETMATERIAL",
    item: { ...oreBody },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={"ore-body-item " + (oreBodyId ? "filled" : "empty")}
    >
      <p className="ore-body-label">{oreBodyId}</p>
    </div>
  );
};

export default OreBodyItem;
