import { omit, uniq } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import {
  addTruckAllocations,
  removeTruckAllocationFromState,
} from "slices/thunk";
import { useVehicles } from "./useVehicles";

export const useTruckAllocations = () => {
  const dispatch: any = useDispatch();

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

  const { findVehicleById } = useVehicles();

  // Updated or Added Truck Allocations
  const [savedTruckAllocations, setSavedTruckAllocations] = useState<any[]>([]);
  const [deletedTruckAllocationIds, setDeletedTruckAllocationIds] = useState<
    string[]
  >([]);
  const [isLoading, setIsLoaing] = useState<boolean>(false);
  const [mergedTruckAllocations, setMergedTruckAllocation] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading) {
      const result = [...truckAllocations, ...savedTruckAllocations]
      .filter((item) => !deletedTruckAllocationIds.includes(item?.id))
      .map((item) => ({
        ...item,
        truck: findVehicleById(item.truckId),
      }));
      setMergedTruckAllocation([...result]);
    }
  }, [truckAllocations, savedTruckAllocations, deletedTruckAllocationIds, isLoading]);

  const findTruckAllocationByTruckId = (truckId) =>
    mergedTruckAllocations?.find((item) => item.truckId === truckId) || null;

  const isExistSavedTruckAllocation = (truckId) =>
    savedTruckAllocations.find((item) => item.truckId === truckId) || null;

  const isExistTruckAllocation = (truckId) =>
    truckAllocations.find((item) => item.truckId === truckId) || null;

  const addNewTruckAllocation = (truckAllocation) => {
    setSavedTruckAllocations([...savedTruckAllocations, truckAllocation]);
  };

  const updateTruckAllocation = (truckId, newTruckAllocation) => {
    removeTruckAllocation(truckId);
    setSavedTruckAllocations((prevData) => [
      ...prevData,
      omit(newTruckAllocation, ["id"]),
    ]);
  };

  const removeTruckAllocation = (truckId) => {
    const selectedTruckAllocation = isExistTruckAllocation(truckId);
    const selectedSavedTruckAllocation = isExistSavedTruckAllocation(truckId);
    if (!!selectedSavedTruckAllocation || !!selectedTruckAllocation) {
      setSavedTruckAllocations((prevData) =>
        prevData.filter(
          (item) => item.truckId !== selectedSavedTruckAllocation?.truckId
        )
      );
      if (!!selectedTruckAllocation) {
        setDeletedTruckAllocationIds((prevIds) =>
          uniq([...prevIds, selectedTruckAllocation?.id])
        );
      }
    }
  };



  const handleSubmitTruckAllocation = async () => {
    setIsLoaing(true);
    if (!!savedTruckAllocations.length || !!deletedTruckAllocationIds.length) {
      await dispatch(
        addTruckAllocations([
          ...deletedTruckAllocationIds.map((id) => ({
            id,
            status: "ARCHIVE",
          })),
          ...savedTruckAllocations.map((item) => ({
            id: item?.id || undefined,
            roster: item?.roster || undefined,
            excavatorId: item?.excavatorId || undefined,
            truckId: item?.truckId || undefined,
            destinationId: item?.destinationId || undefined,
            status: "ACTIVE",
          })),
        ])
      );

      await dispatch(removeTruckAllocationFromState(deletedTruckAllocationIds));
      setDeletedTruckAllocationIds([]);
      setSavedTruckAllocations([]);
    }
    setIsLoaing(false);
  };
  return {
    truckAllocations,
    savedTruckAllocations,
    deletedTruckAllocationIds,
    mergedTruckAllocations,
    findTruckAllocationByTruckId,
    addNewTruckAllocation,
    updateTruckAllocation,
    removeTruckAllocation,
    handleSubmitTruckAllocation,
  };
};
