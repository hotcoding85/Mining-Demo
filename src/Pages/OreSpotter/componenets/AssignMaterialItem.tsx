import React from "react";
import { useDrop } from "react-dnd";
import "../../DispatchLive/styles/assignItem.scss";
import { Material } from "Pages/DispatchLive/interfaces/type";
import { useMaterials } from "Hooks/useMaterials";
import { toast } from "react-toastify";

interface AssignMaterialItemProps {
  inprogressSource: any;
  vehicleId: string;
  truck: any;
  shiftRoster: any;
  targetMaterials: Material[];
  updateTargetMaterials: (oldMaterial: any, updatedMaterial: any) => void;
}

const AssignMaterialItem: React.FC<AssignMaterialItemProps> = ({
  vehicleId,
  inprogressSource,
  truck,
  shiftRoster,
  targetMaterials,
  updateTargetMaterials,
}) => {
  const { findMaterialsById } = useMaterials();
  const materialForAssign = targetMaterials?.find(
    (material: any) =>
      material?.vehicleId === vehicleId && material?.truckId === truck?.truckId
  );

  const DropTarget = ({
    targetData,
    dropId,
    field,
    children,
    updateMaterials,
    style = "",
  }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: "TARGETMATERIAL",
      drop: ({ id, value }: any) =>
        updateMaterials(id, dropId, field, value, targetData),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }));

    return (
      <div
        ref={drop}
        className={
          "assign-material-item " +
          (isOver ? "can-drop " : "") +
          (materialForAssign ? "filled" : "")
        }
      >
        {children}
      </div>
    );
  };

  const updateMaterial = (
    id: string,
    dropId: string,
    field: string,
    value: any,
    targetData: any
  ) => {
    if (dropId === "material") {
      if (!!truck) {
        if (!!inprogressSource?.id) {
          const roster =
            shiftRoster?.find((item) => item.vehicleId === vehicleId)?.roster ??
            shiftRoster?.[0]?.roster ??
            [];

          const data = {
            id: targetData?.id || undefined,
            vehicleId: vehicleId || undefined,
            truckId: truck?.truckId || undefined,
            destinationId: truck?.destinationId || undefined,
            sourceId: inprogressSource?.source.id || undefined,
            planId: inprogressSource?.id || undefined,
            materialId: value.id || undefined,
            roster: roster || undefined,
          };

          updateTargetMaterials(targetData, data);
        } else {
          toast.warning("No assigned current work location!", {
            autoClose: 2000,
          });
        }
      } else
        toast.warning(
          "Not able to assign material! Please assign truck first!",
          { autoClose: 2000 }
        );
    }
  };

  return (
    <DropTarget
      targetData={materialForAssign}
      dropId="material"
      field={"material"}
      updateMaterials={updateMaterial}
    >
      {materialForAssign ? (
        <div className="assigned-material-item-container">
          <div className="assigned-material-item-label">
            {findMaterialsById(materialForAssign.materialId)?.name}
          </div>
        </div>
      ) : (
        <div className="empty">+ Assign Mateiral here</div>
      )}
    </DropTarget>
  );
};

export default AssignMaterialItem;
