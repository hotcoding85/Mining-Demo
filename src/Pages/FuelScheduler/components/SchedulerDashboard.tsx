import React, { useEffect, useState } from "react";
import "../styles/schedulerDashboard.css";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { getAllFleet } from "slices/thunk";
import FuelSchedulerCard from "./FuelSchedulerCard";
import { CardSampleData } from "../data/sampleData";
import { DraggedEvent } from "../interfaces/types";

interface SchedulerDashboardProps {
  draggedEvent: DraggedEvent | null;
}

const SchedulerDashboard: React.FC<SchedulerDashboardProps> = ({
  draggedEvent,
}) => {
  document.title = "Fuel Status | FMS Live";
  const dispatch = useDispatch<any>();
  const [cardsData, setCardsData] = useState(CardSampleData);

  const selectProperties = createSelector(
    (state: any) => state.Fleet,
    (fleetState) => ({
      fleetList: fleetState.data,
      loading: fleetState.loading,
    })
  );

  const { fleetList } = useSelector(selectProperties);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, id: number) => {
    event.preventDefault();
    if (!draggedEvent) return;
    setCardsData((prevData) =>
      prevData.map((item) =>
        item.id === id
          ? { ...item, [draggedEvent.type]: draggedEvent.name }
          : item
      )
    );
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    dispatch(getAllFleet(1, 50, "name", "ASC"));
  }, [dispatch]);

  return (
    <div>
      <div className="fuel-cards-container fuel-schedular-calendar">
        {cardsData.map((item) => (
          <FuelSchedulerCard
            key={item.id}
            id={item.name}
            isRequestingFuel={item.isRequestingFuel}
            smu={item.smu}
            fuelLevel={item.fuelLevel}
            fuelRate={item.fuelRate}
            priority={item.priority}
            fuelTruckAssign={item.fuelTruckAssign}
            handleDrop={(event) => handleDrop(event, item.id)}
            handleDragOver={handleDragOver}
          />
        ))}
      </div>
    </div>
  );
};

export default SchedulerDashboard;
