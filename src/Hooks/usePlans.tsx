import { filter, uniq, uniqBy, update } from "lodash";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { useEffect, useState } from "react";

export const usePlans = (dispatchs: any[]) => {
  const { plans } = useSelector(
    createSelector(
      (state: any) => state,
      (state) => {
        return {
          plans: state.Dispatch.data,
        };
      }
    )
  );
  const [savedPlans, setSavedPlans] = useState<any[]>(plans || []);

  useEffect(() => {
    setSavedPlans(plans || []);
  }, [plans]);

  const isExistPlanOnSave = (plan) =>
    savedPlans.find((item) => item.excavatorId === plan?.excavatorId);

  const handleSavePlan = (plan) => {
    setSavedPlans([...savedPlans, { ...plan, updated: true }]);
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

  const updateLocationToPlan = (oldLocation, newLocation) => {
    const updatedPlans = savedPlans.map((l) => {
      if (l.sourceId === oldLocation.sourceId) {
        return {
          ...l,
          source: newLocation,
          sourceId: newLocation.id,
          updated: true,
        };
      }
      return l;
    });
    setSavedPlans(updatedPlans);
  };

  const addNewLocation = (oldLocation, newLocation) => {
    if (oldLocation.sourceId) {
      updateLocationToPlan(oldLocation, newLocation);
    } else {
      handleSavePlan(addLocationToPlan(oldLocation, newLocation));
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
