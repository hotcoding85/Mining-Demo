import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Col, Container, Row } from "reactstrap";
import MainCard from "./componenets/MainCard";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  sampleReadyTrucks,
  dumpLocationsForAssign,
  sampleTargetMaterials,
  sampleAssignedBenches,
} from "../DispatchLive/data/sampleData";
import { Space, Tabs } from "antd";
import type { TabsProps } from "antd";
import {
  Truck,
  DumpLocation,
  Material,
  ActiveBenchData,
} from "../DispatchLive/interfaces/type";
import "../DispatchLive/styles/style.scss";
import "./styles/style.scss";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { useDispatch } from "react-redux";
import { getAllFleet } from "slices/thunk";
import RightBoard from "Pages/DispatchLive/RightBoard";
import { Vehicle } from "slices/fleet/reducer";

const OreSpotter: React.FC = () => {
  document.title = "Ore tracker | FMS Live";
  const dispatch = useDispatch<any>();

  const [readyTrucks, setReadyTrucks] = useState<Truck[]>(sampleReadyTrucks);
  const [targetMaterials, setTargetMaterials] = useState<Material[]>(
    sampleTargetMaterials
  );
  const [dumpLocations, setDumpLocations] = useState<DumpLocation[]>([]);
  const [assignedBenches, setAssignedBenches] = useState<ActiveBenchData[]>(
    sampleAssignedBenches
  );
  const [diggersForShow, setDiggersForShow] = useState<Vehicle[]>([]);

  const { data } = useSelector(
    createSelector(
      (state: any) => state.Fleet,
      (Fleet) => ({
        data: Fleet.data,
      })
    )
  );

  const diggers = useMemo(
    () => data.filter((item) => item.category === "EXCAVATOR"),
    [data]
  );

  useEffect(() => {
    setDiggersForShow(diggers);
  }, [diggers]);

  const trucks = useMemo(
    () => data.filter((item) => item.category === "DUMP_TRUCK"),
    [data]
  );

  useEffect(() => {
    setReadyTrucks(
      trucks.map((truck) => ({
        id: truck.id,
        assignedId: 0,
        truckId: truck.name,
        operator: "J.Taylor",
      }))
    );
  }, [trucks]);

  useEffect(() => {
    dispatch(getAllFleet(1, 50));
  }, []);

  const updateReadyTrucks = (updatedTruck: Truck) => {
    setReadyTrucks((prevTrucks: Truck[]) =>
      prevTrucks.map((truck) =>
        truck.id === updatedTruck.id ? updatedTruck : truck
      )
    );
  };

  
  const removeTruckFromAssigned = (removedTruck : Truck) => {

  }

  const assignTruckToFleet = (truck : Truck, diggerId : string) => {

  }
  const addBenches= (newBenches : ActiveBenchData) => {
        const existItem = assignedBenches.find(
            (item) =>
              item.id === newBenches.id && item.assignId === newBenches.assignId
        );
        if(!existItem) {
            setAssignedBenches((prevBenches) => [...prevBenches, newBenches]);
        }
  };

  const updateTargetMaterials = (updatedTruck: Material) => {
    setTargetMaterials((prevTrucks: Material[]) =>
      prevTrucks.map((truck) =>
        truck.id === updatedTruck.id ? updatedTruck : truck
      )
    );
  };

  const addDumpLocation = (newDumpLocation: DumpLocation) => {
    setDumpLocations((prevLocations) => [...prevLocations, newDumpLocation]);
  };

  const onTabChange = (key: string) => {
    if (key === "All") {
      setDiggersForShow(diggers);
    } else {
      const filteredDiggers = diggers.filter((digger) => digger.name == key);
      setDiggersForShow(filteredDiggers);
    }
  };

  const items: TabsProps["items"] = [
    {
      key: "All",
      label: "All",
    },
    ...diggers.map((item, idx) => ({
      key: item.name,
      label: item.name,
    })),
  ];

  return (
    <React.Fragment>
      <DndProvider backend={HTML5Backend}>
        <div className="page-content">
          <Container fluid>
            <div className="ore-trakcer-content dispatch-live-content">
              <div className="dispatch-live-left">
                <Breadcrumb breadcrumbItem="Ore Spotter" title="Operations" />
                <Row>
                  <Col md="12" className="d-flex">
                    <Space>
                      <Tabs
                        defaultActiveKey="1"
                        items={items}
                        onChange={onTabChange}
                      ></Tabs>
                    </Space>
                  </Col>
                </Row>
                <div className="dispatch-digger-container">
                  {diggersForShow.map((digger, index) => (
                    <MainCard
                      digger={digger}
                      readyTrucks={readyTrucks}
                      updateReadyTrucks={updateReadyTrucks}
                      removeTruckFromAssigned = {removeTruckFromAssigned}
                      assignTruckToFleet={assignTruckToFleet}
                      targetMaterials={targetMaterials}
                      updateTargetMaterials={updateTargetMaterials}
                      dumpLocations={dumpLocations}
                      addDumpLocation={addDumpLocation}
                      assignedBenches={assignedBenches}
                      addBenches={addBenches}
                    />
                  ))}
                </div>
              </div>
              <div className="dispatch-live-right">
                <RightBoard
                  readyTrucks={readyTrucks.filter((item) => !item.diggerId)}
                  targetMaterials={targetMaterials.filter(
                    (item) => !item.diggerId
                  )}
                  dumpLocationsForAssign={dumpLocationsForAssign}
                />
              </div>
            </div>
          </Container>
        </div>
      </DndProvider>
    </React.Fragment>
  );
};
export default OreSpotter;
