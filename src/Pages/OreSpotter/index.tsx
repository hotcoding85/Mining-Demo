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
} from "../DispatchLive/data/sampleData";
import { Space, Tabs } from "antd";
import type { TabsProps } from "antd";
import { Truck, DumpLocation, Material } from "../DispatchLive/interfaces/type";
import "../DispatchLive/styles/style.scss";
import "./styles/style.scss";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { useDispatch } from "react-redux";
import { getAllFleet } from "slices/thunk";
import RightBoard from "Pages/DispatchLive/RightBoard";

const OreSpotter: React.FC = () => {
  document.title = "Ore tracker | FMS Live";
  const dispatch = useDispatch<any>();

  const [readyTrucks, setReadyTrucks] = useState<Truck[]>(sampleReadyTrucks);
  const [targetMaterials, setTargetMaterials] = useState<Material[]>(
    sampleTargetMaterials
  );
  const [dumpLocations, setDumpLocations] = useState<DumpLocation[]>([]);
  const [selectedTab, setSelectedTab] = useState<number>(1);

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
    setSelectedTab(Number(key));
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "All",
    },
    ...diggers.map((item, idx) => ({
      key: idx + 2,
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
                  {selectedTab === 1
                    ? diggers.map((digger, index) => (
                        <div
                          key={index}
                          className={index !== 0 ? "mt-4" : "mt-0"}
                        >
                          <MainCard
                            digger={digger}
                            readyTrucks={readyTrucks}
                            updateReadyTrucks={updateReadyTrucks}
                            targetMaterials={targetMaterials}
                            updateTargetMaterials={updateTargetMaterials}
                            dumpLocations={dumpLocations}
                            addDumpLocation={addDumpLocation}
                          />
                        </div>
                      ))
                    : selectedTab && (
                        <MainCard
                          digger={diggers[selectedTab - 2]}
                          readyTrucks={readyTrucks}
                          updateReadyTrucks={updateReadyTrucks}
                          targetMaterials={targetMaterials}
                          updateTargetMaterials={updateTargetMaterials}
                          dumpLocations={dumpLocations}
                          addDumpLocation={addDumpLocation}
                        />
                      )}
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
