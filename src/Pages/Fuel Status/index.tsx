import React, { useEffect } from "react";
import FuelCard from "./FuelCard";
import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { getAllFleet } from "slices/thunk";
import { hd1500, hd785, pc1250, pc2000, placeHolder, wa600 } from "assets/images/equipment";
import { Container } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";

const FuelStatusDashboard: React.FC = () => {

  document.title = "Fuel Status | FMS Live";
  const dispatch = useDispatch<any>();

  const selectProperties = createSelector(
    (state: any) => state.Fleet,
    (fleetState) => ({
      fleetList: fleetState.data,
      loading: fleetState.loading
    })
  );

  const { fleetList, loading } = useSelector(selectProperties);

  useEffect(() => {
    dispatch(getAllFleet(1, 50, 'name', 'ASC')); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  const getImage = (category: string) => {
    if (!category) {
      return placeHolder;
    }

    if (containsCaseInsensitive(category, "hd785")) {
      return hd785;
    } else if (containsCaseInsensitive(category, "hd1500")) {
      return hd1500;
    } else if (containsCaseInsensitive(category, "pc1250")) {
      return pc1250;
    } else if (containsCaseInsensitive(category, "pc2000")) {
      return pc2000;
    } else if (containsCaseInsensitive(category, "wa600")) {
      return wa600;
    } else {
      return placeHolder;
    }
  }

  function containsCaseInsensitive(str: string, substr: string): boolean {
    return str.toLowerCase().includes(substr.toLowerCase());
  }

  function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getRandomFloat(min: number, max: number, decimalPlaces: number): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round((Math.random() * (max - min) + min) * factor) / factor;
  }

  return (
    <div className="page-content">
      <div className="fuel-cards-container">
        {fleetList.map((item) => (
          <FuelCard
            key={item.id}
            id={item.name}
            status={'Healthy'}
            smu={getRandomFloat(23000, 38000, 1)}
            fuelLevel={getRandomInt(20, 100)}
            fuelRate={getRandomFloat(40, 80, 1)}
            imageUrl={getImage(item.model)}
            lastUpdated={getRandomInt(1, 2)+'m'}
            sync={'active'}
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
