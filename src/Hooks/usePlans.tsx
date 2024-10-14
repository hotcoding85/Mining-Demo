import { filter, uniq, uniqBy, update } from "lodash";
import { useState } from "react";

export const usePlans = (dispatchs: any[]) => {
  const [savedPlans, setSavedPlans] = useState<any[]>([]);

  const isExistPlanOnSave = (plan) =>
    savedPlans.find((item) => item.excavatorId === plan?.excavatorId);

  const handleSavePlan = (plan) => {
    setSavedPlans([...(savedPlans || []), plan]);
  };

  const addNewPlan = (plan) => {
    let selectedPlan = isExistPlanOnSave(plan);

    if (!!selectedPlan) {
      return;
    } else {
      handleSavePlan(plan);
    }
  };

  const addLocationToPlan = (plan, location) => {
    return {
      ...plan,
      sourceId: location.id,
      source: location,
    };
  };

  const updateLocationToPlan = (plan, location) => {
    const updatedPlans = savedPlans.map((l) => {
      // Check if the current plan's sourceId matches
      if (l.sourceId === plan.sourceId) {
        // If it matches, update the source
        return { ...l, source: location, sourceId: location.id }; // Create a new object with updated source
      }
      // If it doesn't match, return the original object
      return l;
    });
    setSavedPlans(updatedPlans);
  };

  const addNewLocation = (plan, location) => {
    let selectedPlan = isExistPlanOnSave(plan); 
    if (plan.sourceId) {
      updateLocationToPlan(plan, location);
    } else {
      if (!!selectedPlan) {
        handleSavePlan(addLocationToPlan(selectedPlan, location));
      } else {
        console.log("plan && location", plan, location)
        handleSavePlan(addLocationToPlan(plan, location));
      }
    }
  };

  const clearSavedPlans = () => setSavedPlans([]);

  return {
    savedPlans,
    addNewPlan,
    addNewLocation,
    clearSavedPlans,
  };
};
