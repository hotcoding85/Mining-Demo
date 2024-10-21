import { useCallback } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

export const useMaterials = () => {
  const { materials } = useSelector(
    createSelector(
      (state: any) => state,
      (state) => {
        return {
          materials: state.Materials.data,
        };
      }
    )
  );

  const findMaterialsById = useCallback(
    (id) => materials?.find((item) => item.id === id) || null,
    [materials]
  );

  return {
    materials,
    findMaterialsById,
  };
};
