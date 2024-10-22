import { useState } from "react";
import { useDispatch } from "react-redux";
import { addShiftRosters } from "slices/thunk";

export const useRosters = () => {
  const dispatch: any = useDispatch();
  const [savedRosters, setSavedRosters] = useState<any[]>([]);

  const isExistRosterOnSave = (vehicleId) =>
    savedRosters.find((item) => item.vehicleId === vehicleId);

  const saveShiftRoster = (roster) => {
    const filteredPlan = savedRosters?.filter(
      (item) => item.vehicleId !== roster.vehicleId
    );
    setSavedRosters([...(filteredPlan || []), { ...roster, updated: true }]);
  };

  const addNewRoster = (roster, operator) => {
    const selectedRoster = isExistRosterOnSave(roster?.vehicleId);

    saveShiftRoster({
      ...(selectedRoster || roster),
      operators: [operator],
    });
  };

  const clearSavedRoster = () => setSavedRosters([]);

  const handleSubmitShiftRoster = async () => {
    const rosterResult = savedRosters.filter((item) => item.updated);
    if (!!rosterResult.length) {
      await dispatch(
        addShiftRosters(
          rosterResult.map((item) => ({
            id: item?.id || undefined,
            operators: item?.operators || undefined,
            roster: item?.roster || undefined,
            vehicleId: item?.vehicleId || undefined,
          }))
        )
      );
      clearSavedRoster();
    }
  };

  return {
    savedRosters,
    addNewRoster,
    clearSavedRoster,
    handleSubmitShiftRoster,
  };
};
