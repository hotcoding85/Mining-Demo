import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

export const useTruckAllocations = () => {
  const { truckAllocations } = useSelector(
    createSelector(
      (state: any) => state,
      (state) => {
        return {
          truckAllocations: state.TruckAllocation.data,
        };
      }
    )
  );
  const [savedTruckAllocations, setSavedTruckAllocations] = useState<any[]>(
    truckAllocations || []
  );

  useEffect(() => {
    setSavedTruckAllocations(truckAllocations);
  }, [truckAllocations]);

  const handleSaveAllocation = (truckAllocation) => {
    const filteredTruckAllocation = savedTruckAllocations?.filter(
      (item) => item.truckId !== truckAllocation.truckId
    );
    setSavedTruckAllocations([
      ...(filteredTruckAllocation || []),
      truckAllocation,
    ]);
  };

  const assignTruckToPlan = (plan, truck) => {
    if (plan?.truckId) {
      const updatedTruckAllocations = savedTruckAllocations.map((l) => {
        if (l.truckId === plan.truckId) {
          return { ...l, truckId: truck.id, truck: truck };
        }
        return l;
      });
      setSavedTruckAllocations(updatedTruckAllocations);
    } else {
      handleSaveAllocation({
        ...plan,
        truckId: truck.id,
        truck: truck,
        deletedId: false,
      });
    }
  };

  const revokeTruckFromPlan = (truckAllocation, truckId) => {
    const updatedTruckAllocations = savedTruckAllocations.map((t) => {
      if (t.truckId === truckId) {
        return { ...t, deletedId: true };
      }
      return t;
    });
    setSavedTruckAllocations(updatedTruckAllocations);
  };

  const clearSavedPTruckAllocations = () => setSavedTruckAllocations([]);

  return {
    savedTruckAllocations,
    assignTruckToPlan,
    revokeTruckFromPlan,
    clearSavedPTruckAllocations,
  };
};
