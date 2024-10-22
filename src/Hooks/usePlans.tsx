import { omit, uniq } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { addDispatchs, removeDispatchFromState } from "slices/thunk";
import { useVehicles } from "./useVehicles";
import { useBenches } from "./useBenches";

export const usePlans = () => {
  const dispatch: any = useDispatch();

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
  const { findVehicleById } = useVehicles();
  const { findBenchesById } = useBenches();
  const [mergedPlans, setMergedPlans] = useState<any[]>([]);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [deletedPlanIds, setDeletedPlanIds] = useState<string[]>([]);
  const [normalPlans, setNomalPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const result = normalPlans.map((item) => ({
      ...item,
      excavator: findVehicleById(item.excavatorId),
      source: findBenchesById(item.sourceId),
    }));
    setMergedPlans(result);
  }, [normalPlans]);


  useEffect(() => {
    if (!isLoading) {
      const result = plans.filter((item) => !deletedPlanIds.includes(item?.id));
      setNomalPlans([...result, ...savedPlans]);
    }
  }, [plans, savedPlans, deletedPlanIds, isLoading]);

  const findPlanBySourceId = (sourceId) =>
    normalPlans?.find((item) => item.sourceId === sourceId);

  const findInprogressPlan = (excavatorId) =>
    normalPlans?.find(
      (item) =>
        item?.status === "INPROGRESS" && item?.excavatorId === excavatorId
    );

  const isExistSavedPlan = (sourceId) =>
    savedPlans.find((item) => item.sourceId === sourceId);

  const isExistPlan = (sourceId) =>
    plans.find((item) => item.sourceId === sourceId);

  const addNewPlan = (plan) => {
    setSavedPlans([...savedPlans, plan]);
  };

  const updatePlanStatus = (plans, sourceId, status) =>
    plans.map((item) =>
      item.sourceId === sourceId ? { ...item, status } : item
    );

  const changePlan = (newSourceId, excavatorId) => {
    const oldPlan = findInprogressPlan(excavatorId);

    let updatedPlans = savedPlans;
    let deletedPlans = deletedPlanIds;

    if (oldPlan) {
      const savedOldPlan = isExistSavedPlan(oldPlan.sourceId);

      if (savedOldPlan) {
        updatedPlans = updatePlanStatus(
          updatedPlans,
          oldPlan.sourceId,
          "PLANNED"
        );
      } else {
        const isOldPlan = isExistPlan(oldPlan.sourceId);
        updatedPlans.push({ ...isOldPlan, status: "PLANNED" });
        deletedPlans.push(isOldPlan.id);
      }
    }

    const savedNewPlan = isExistSavedPlan(newSourceId);

    // Handle new plan
    if (savedNewPlan) {
      updatedPlans = updatePlanStatus(updatedPlans, newSourceId, "INPROGRESS");
    } else {
      const newPlan = isExistPlan(newSourceId);
      updatedPlans.push({ ...newPlan, status: "INPROGRESS" });
      deletedPlans.push(newPlan.id);
    }

    setSavedPlans(updatedPlans);
    setDeletedPlanIds(deletedPlans);
  };

  const updatePlan = (sourceId, newPlan) => {
    removePlan(sourceId);
    setSavedPlans((prevData) => [...prevData, omit(newPlan, ["id"])]);
  };

  const removePlan = (sourceId) => {
    const selectedPlan = isExistPlan(sourceId);
    const selectedSavedPlan = isExistSavedPlan(sourceId);

    if (!!selectedPlan) {
      setDeletedPlanIds((prevIds) => uniq([...prevIds, selectedPlan.id]));
    }
    if (!!selectedSavedPlan) {
      setSavedPlans((prevData) =>
        prevData.filter((item) => item.sourceId !== selectedSavedPlan?.sourceId)
      );
    }
  };

  const handlepublishPlan = async () => {
    setIsLoading(true);

    if (!!savedPlans.length || !!deletedPlanIds.length) {
      await dispatch(removeDispatchFromState(deletedPlanIds));
      await dispatch(
        addDispatchs([
          ...deletedPlanIds.map((id) => ({
            id,
            status: "ARCHIVE",
          })),
          ...savedPlans.map((item) => ({
            id: item?.id || undefined,
            endTime: item?.endTime || undefined,
            roster: item?.roster || undefined,
            sourceId: item?.sourceId || undefined,
            startTime: item?.startTime || undefined,
            excavatorId: item?.excavatorId,
            status: item?.status || "PLANNED",
          })),
        ])
      );
    }

    setDeletedPlanIds([]);
    setSavedPlans([]);

    setIsLoading(false);
  };

  return {
    plans,
    savedPlans,
    deletedPlanIds,
    mergedPlans,
    findPlanBySourceId,
    findInprogressPlan,
    addNewPlan,
    updatePlan,
    removePlan,
    changePlan,
    handlepublishPlan,
  };
};
