import React from "react";
import { useDrop } from "react-dnd";
import "../../DispatchLive/styles/assignItem.scss";
import { Material } from "Pages/DispatchLive/interfaces/type";

interface AssignMaterialItemProps {
  sourceId: number;
  targetMaterials: Material[];
  updateTargetMaterials: (updatedTask: Material) => void;
}

const AssignMaterialItem: React.FC<AssignMaterialItemProps> = ({
  sourceId,
  targetMaterials,
  updateTargetMaterials,
}) => {
  const materialForAssign = targetMaterials.find(
    (material) => material.assignId === sourceId
  );

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "TARGETMATERIAL",
    drop: (draggedMaterial: Material) => {
      const updatedMaterial = {
        ...draggedMaterial,
        assignId: sourceId,
      };

      updateTargetMaterials(updatedMaterial);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  return (
    <div
      ref={drop}
      className={
        "assign-material-item " +
        (isOver && canDrop ? "can-drop " : "") +
        (materialForAssign ? "filled" : "")
      }
    >
      {materialForAssign ? (
        <div className="assigned-material-item-container">
          <div className="assigned-material-item-label">
            {materialForAssign.materialId}
          </div>
        </div>
      ) : (
        <div className="empty">+Assign Mateiral here</div>
      )}
    </div>
  );
};

export default AssignMaterialItem;
