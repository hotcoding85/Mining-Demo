import { filter, uniq, uniqBy, update } from "lodash";
import { useState } from "react";

export const usePlans = (dispatchs: any[]) => {
  const [savedPlans, setSavedPlans] = useState<any[]>([]);

  const isExistPlanOnSave = (plan) =>
    savedPlans.find((item) => item.vehicleId === plan?.vehicleId);

  const addSupportTruck = (plan, truck, oldTruckId) => {
    if (oldTruckId) {
      const filteredSupporting =
        plan?.supporting?.filter((fleetId) => fleetId !== oldTruckId) || [];
      const filteredSupportTrucks =
        plan?.supportTrucks?.filter((truck) => truck.id !== oldTruckId) || [];

      return {
        ...plan,
        supporting: [...filteredSupporting, truck.id],
        supportTrucks: [...filteredSupportTrucks, truck],
      };
    } else {
      return {
        ...plan,
        supporting: [...(plan?.supporting || []), truck.id],
        supportTrucks: [...(plan?.supportTrucks || []), truck],
      };
    }
  };

  const revokeSupportTruck = (plan, truckId) => {
    return {
      ...plan,
      supporting: plan.supporting?.filter((fleetId) => fleetId !== truckId),
      supportTrucks: plan.supportTrucks?.filter((item) => item.id !== truckId),
    };
  };

  const handleSavePlan = (plan) => {
    const filteredPlan = savedPlans?.filter(
      (item) => item.vehicleId !== plan.vehicleId
    );
    setSavedPlans([...(filteredPlan || []), plan]);
  };

  const addNewPlan = (plan, truck, oldTruckId) => {
    let selectedPlan = isExistPlanOnSave(plan);

    if (!!selectedPlan) {
      handleSavePlan(addSupportTruck(selectedPlan, truck, oldTruckId));
    } else {
      handleSavePlan(addSupportTruck(plan, truck, oldTruckId));
    }
  };

  const revokeTruckFromPlan = (plan, truckId) => {
    let selectedPlan = isExistPlanOnSave(plan);
    if (!!selectedPlan) {
      handleSavePlan(revokeSupportTruck(selectedPlan, truckId));
    } else {
      handleSavePlan(revokeSupportTruck(plan, truckId));
    }
  };

  const addLocationToPlan = (plan, location, destinationId) => {
    return {
      ...plan,
      sourceId: location.id,
      source: location.source,
      materialId: location.materialId || undefined,
      destinationId: location.materialId
        ? destinationId || undefined
        : undefined,
      supporting: plan.supporting || [],
    };
  };

  const addNewLocation = (plan, location, destinationId) => {
    let selectedPlan = isExistPlanOnSave(plan);
    if (!!selectedPlan) {
      handleSavePlan(addLocationToPlan(selectedPlan, location, destinationId));
    } else {
      handleSavePlan(addLocationToPlan(plan, location, destinationId));
    }
  };

  const clearSavedPlans = () => setSavedPlans([]);

  return {
    savedPlans,
    addNewPlan,
    revokeTruckFromPlan,
    addNewLocation,
    clearSavedPlans
  };
};
