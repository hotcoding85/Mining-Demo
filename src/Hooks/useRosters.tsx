import { useState } from "react";

export const useRosters = () => {
  const [savedRosters, setSavedRosters] = useState<any[]>([]);

  const isExistRosterOnSave = (vehicleId) =>
    savedRosters.find((item) => item.vehicleId === vehicleId);

  const saveShiftRoster = (roster) => {
    const filteredPlan = savedRosters?.filter(
      (item) => item.vehicleId !== roster.vehicleId
    );
    setSavedRosters([...(filteredPlan || []), roster]);
  };

  const addNewRoster = (roster, operator) => {
    const selectedRoster = isExistRosterOnSave(roster?.vehicleId);

    saveShiftRoster({
      ...(selectedRoster || roster),
      operators: [operator],
    });
  };

  const clearSavedRoster = () => setSavedRosters([]);

  return {
    savedRosters,
    addNewRoster,
    clearSavedRoster,
  };
};
