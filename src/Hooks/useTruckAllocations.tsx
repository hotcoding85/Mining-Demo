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
      {...truckAllocation, updated:true},
    ]);
  };

  const assignTruckToPlan = (plan, truck) => {
    if (plan?.truckId) {
      const updatedTruckAllocations = savedTruckAllocations.map((l) => {
        if (l.truckId === plan.truckId) {
          return { ...l, truckId: truck.id, truck: truck, updated:true };
        }
        return l;
      });
      setSavedTruckAllocations(updatedTruckAllocations);
    } else {
      handleSaveAllocation({
        ...plan,
        truckId: truck.id,
        truck: truck,
      });
    }
  };

  const revokeTruckFromPlan = (truckId) => {
    const updatedTruckAllocations = savedTruckAllocations.filter(
      (t) => t.truckId !== truckId
    );
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
