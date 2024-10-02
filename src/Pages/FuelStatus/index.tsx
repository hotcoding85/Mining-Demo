import React, { useEffect, useState } from "react";
import FuelCard from "./components/FuelCard";
import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { getAllFleet } from "slices/thunk";
import { getRandomFloat, getRandomIndex, getRandomInt } from "utils/random";
import { getImage, MaintenanceStatus } from "utils/fleet";
import {
  hd1500,
  hd785,
  pc1250,
  pc2000,
  placeHolder,
  wa600,
} from "assets/images/equipment";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import FuelStatusHeader from "./components/FuelStatusHeader";
import FuelStatusTableView from "./components/FuelStatusTableView";

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

  const [displayType, setDisplayType] = useState<string>("GRID");

  useEffect(() => {
    dispatch(getAllFleet(1, 50, "name", "ASC")); // Dispatch action to fetch data on component mount
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
  };

  function containsCaseInsensitive(str: string, substr: string): boolean {
    return str.toLowerCase().includes(substr.toLowerCase());
  }

  function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getRandomFloat(
    min: number,
    max: number,
    decimalPlaces: number
  ): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round((Math.random() * (max - min) + min) * factor) / factor;
  }

  function getMinutesDifference(lastUpdatedTime: any): number {
    const currentDate: Date = new Date();
    const lastUpdatedDate: Date = new Date(lastUpdatedTime);
    const diffMs: number = currentDate.getTime() - lastUpdatedDate.getTime();
    const diffMinutes: number = diffMs / (1000 * 60);
    return Math.abs(diffMinutes);
  }

  const fleetData = fleetList.map((item) => ({
    id: item.id,
    name: item.name,
    model: item.model,
    status: MaintenanceStatus[getRandomIndex(0, 3)],
    gpsLocation: getRandomFloat(23000, 38000, 1),
    smu: getRandomFloat(23000, 38000, 1),
    fuelLevel: getRandomInt(20, 100),
    fuelRate: getRandomFloat(40, 80, 1),
    imageUrl: getImage(item.model),
    lastUpdated: getMinutesDifference("2024-08-20T22:49:20.030Z"),
    sync: "active",
  }));

  return (
    <div className="page-content">
      <Container fluid>
        <Breadcrumb title="Maintenance" breadcrumbItem="Fuel Status" />
        <Row>
          <Col lg={12}>
            <FuelStatusHeader
              displayType={displayType}
              setDisplayType={setDisplayType}
            />
          </Col>

          {displayType === "TABLE" && (
            <Col lg="12">
              <FuelStatusTableView data={fleetData} />
            </Col>
          )}
        </Row>
        <Row className="mt-3 gy-4">
          {displayType === "GRID" &&
            fleetData.map((item) => (
              <Col xs={3}>
                <FuelCard
                  key={item.id}
                  id={item.name}
                  model={item.model}
                  status={item.status}
                  gpsLocation={item.gpsLocation}
                  smu={item.smu}
                  fuelLevel={item.fuelLevel}
                  fuelRate={item.fuelRate}
                  imageUrl={getImage(item.model)}
                  lastUpdated={item.lastUpdated}
                  sync="active"
                />
              </Col>
            ))}
        </Row>
      </Container>
    </div>
  );
};

export default FuelStatusDashboard;
