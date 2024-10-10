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
      style={{ opacity: isDragging ? 0.5 : 1, height: "64px" }}
      className={"ore-body-item " + (oreBody ? "filled" : "empty")}
    >
      <p className="ore-body-label">{oreBody.name}</p>
    </div>
  );
};

export default OreBodyItem;
