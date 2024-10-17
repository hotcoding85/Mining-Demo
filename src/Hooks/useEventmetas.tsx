import { omit, uniq } from "lodash";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import {
  addEventMetas,
  removeEventMetasFromState,
} from "slices/thunk";

export const useEventmetas = () => {
  const dispatch: any = useDispatch();

  const { eventmetas } = useSelector(
    createSelector(
      (state: any) => state,
      (state) => {
        return {
          eventmetas: state.EventMeta.data,
        };
      }
    )
  );

  // New Event Metas
  const [savedEventmetas, setSavedEventmetas] = useState<any[]>([]);
  const [deletedEventmataIds, setDeletedEventmataIds] = useState<string[]>([]);

  const findEventmetaByTruckId = (truckId) =>
    eventmetas?.find((item) => item.truckId === truckId) || null;

  const isExistSavedEventmeta = (truckId) =>
    savedEventmetas?.find((item) => item.truckId === truckId) || null;

  const isExistEventmeta = (truckId) =>
    eventmetas?.find((item) => item.truckId === truckId) || null;

  const handleSaveEventmeta = (eventmeta) => {
    setSavedEventmetas([...savedEventmetas, eventmeta]);
  };

  const addNewEventmeta = (eventmeta) => {
    let selectedEventmeta = isExistEventmeta(eventmeta);

    if (!!selectedEventmeta) {
      return;
    } else {
      handleSaveEventmeta(eventmeta);
    }
  };

  const updateEventmeta = (truckId, newData) => {
    removeEventmeta(truckId);
    setSavedEventmetas((prevData) => [...prevData, omit(newData, ["id"])]);
  };

  const removeEventmeta = (truckId) => {
    const selectedEventMeta = isExistEventmeta(truckId);
    const selectedSavedEventMeta = isExistSavedEventmeta(truckId);
    
    if (!!selectedEventMeta || !!selectedSavedEventMeta) {
      setSavedEventmetas((prevData) =>
        prevData.filter((item) => item.truckId !== selectedEventMeta.truckId)
      );
      setDeletedEventmataIds((prevIds) =>
        uniq([...prevIds, selectedEventMeta.id])
      );
    }
  };

  const handleSubmitEventmeta = async () => {
    if (!!savedEventmetas.length && !!deletedEventmataIds.length) {
      await dispatch(
        addEventMetas([
          ...deletedEventmataIds.map((id) => ({
            id,
            status: "ARCHIVE",
          })),
          ...savedEventmetas.map((item: any) => ({
            id: item?.id || undefined,
            planId: item?.planId || undefined,
            vehicleId: item?.vehicleId || undefined,
            truckId: item?.truckId || undefined,
            destinationId: item?.destinationId || undefined,
            sourceId: item?.sourceId || undefined,
            materialId: item?.materialId || undefined,
            roster: item?.roster || undefined,
            status: "ACTIVE",
          })),
        ])
      );

      dispatch(removeEventMetasFromState(deletedEventmataIds));
      setDeletedEventmataIds([]);
      setSavedEventmetas([]);
    }
  };

  return {
    eventmetas,
    savedEventmetas,
    deletedEventmataIds,
    addNewEventmeta,
    updateEventmeta,
    removeEventmeta,
    findEventmetaByTruckId,
    handleSubmitEventmeta,
  };
};
