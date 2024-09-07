import React, { useEffect } from "react";
import FuelCard from "./FuelCard";
import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { getAllFleet } from "slices/thunk";
import { getRandomFloat, getRandomInt } from "utils/random";
import { getImage } from "utils/fleet";

const FuelStatusDashboard: React.FC = () => {
  document.title = "Fuel Status | FMS Live";
  const dispatch = useDispatch<any>();

  const selectProperties = createSelector(
    (state: any) => state.Fleet,
    (fleetState) => ({
      fleetList: fleetState.data,
      loading: fleetState.loading,
    })
  );

  const { fleetList, loading } = useSelector(selectProperties);

  useEffect(() => {
    dispatch(getAllFleet(1, 50, "name", "ASC")); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  return (
    <div className="page-content">
      <div className="fuel-cards-container">
        {fleetList.map((item) => (
          <FuelCard
            key={item.id}
            id={item.name}
            status={"Healthy"}
            smu={getRandomFloat(23000, 38000, 1)}
            fuelLevel={getRandomInt(20, 100)}
            fuelRate={getRandomFloat(40, 80, 1)}
            imageUrl={getImage(item.model)}
            lastUpdated={getRandomInt(1, 2) + "m"}
            sync={"active"}
          />
        ))}
      </div>
      {/* <Container fluid>
          <Breadcrumb title="Maintenance" breadcrumbItem="Fuel Status" />
          {fleetList.map((item) => (
            <FuelCard
              key={item.id}
              id={item.name}
              status={'Healthy'}
              smu={getRandomFloat(23000, 38000, 1)}
              fuelLevel={getRandomInt(20, 100)}
              fuelRate={getRandomFloat(40, 80, 1)}
              imageUrl={getImage(item.model)}
              lastUpdated={item.updatedAt}
              sync={item.sync}
            />
          ))}
        </Container> */}
    </div>
  );
};

export default FuelStatusDashboard;
