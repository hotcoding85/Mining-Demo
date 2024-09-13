import React, { useEffect } from "react";
import "../styles/schedulerDashboard.css";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { getAllFleet } from "slices/thunk";
import FuelSchedulerCard from "./FuelSchedulerCard";
import { CardSampleData } from "../data/sampleData";

const SchedulerDashboard: React.FC = () => {
  document.title = "Fuel Status | FMS Live";
  const dispatch = useDispatch<any>();

  const selectProperties = createSelector(
    (state: any) => state.Fleet,
    (fleetState) => ({
      fleetList: fleetState.data,
      loading: fleetState.loading,
    })
  );

  const { fleetList } = useSelector(selectProperties);

  useEffect(() => {
    dispatch(getAllFleet(1, 50, "name", "ASC"));
  }, [dispatch]);

  console.log("fleet", fleetList);

  return (
    <div>
      <div className="fuel-cards-container">
        {CardSampleData.map((item) => (
          <FuelSchedulerCard
            key={item.id}
            id={item.name}
            smu={item.smu}
            fuelLevel={item.fuelLevel}
            fuelRate={item.fuelRate}
          />
        ))}
      </div>
    </div>
  );
};

export default SchedulerDashboard;
