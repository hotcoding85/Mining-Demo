import React from "react";
import OreBodyItem from "./OreBodyItem";
import { Material } from "./interfaces/type";

interface OreBodiesProps {
  targetMaterials?: Material[];
}

const OreBodies: React.FC<OreBodiesProps> = ({ targetMaterials }) => {
  return (
    <React.Fragment>
      <div>
        <p className="right-board-topic">Ore Bodies Material Grades</p>
        <div
          className="d-flex flex-row justify-content-start flex-wrap"
          style={{ columnGap: "32px" }}
        >
          {targetMaterials?.map((material: any) => (
            <OreBodyItem
              key={material.materialId}
              oreBodyId={material.materialId}
              oreBody={material}
              fontColor="#FFFFFF"
            />
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default OreBodies;
