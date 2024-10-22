import { useCallback } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

export const useVehicles = () => {
  const { vehicles } = useSelector(
    createSelector(
      (state: any) => state,
      (state) => {
        return {
          vehicles: state.Fleet.data,
        };
      }
    )
  );

  const findVehicleById = useCallback(
    (id) => vehicles.find((item) => item.id === id) || null,
    [vehicles]
  );

  return {
    vehicles,
    findVehicleById,
  };
};
