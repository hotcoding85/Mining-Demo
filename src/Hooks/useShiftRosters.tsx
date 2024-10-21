import { useCallback } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

export const useShiftRosters = () => {
  const { shiftRosters } = useSelector(
    createSelector(
      (state: any) => state,
      (state) => {
        return {
          shiftRosters: state.ShiftRosters.data,
        };
      }
    )
  );

  const findShiftRostersByTruckId = useCallback(
    (id) => shiftRosters.find((item) => item.vehicleId === id) || null,
    [shiftRosters]
  );

  return {
    shiftRosters,
    findShiftRostersByTruckId,
  };
};
