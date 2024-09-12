import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Col, Container, Row } from "reactstrap";
import MainCard from "./MainCard";
import RightBoard from "./RightBoard";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  sampleReadyTrucks,
  dumpLocationsForAssign,
  sampleTargetMaterials,
} from "./data/sampleData";
import { Space, Tabs } from "antd";
import type { TabsProps } from "antd";
import "./styles/style.scss";
import { Truck, DumpLocation, Material } from "./interfaces/type";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { getAllFleet } from "slices/thunk";
import { useDispatch } from "react-redux";

const DispatchLive: React.FC = () => {
  document.title = "Dispatch Live | FMS Live";

  const dispatch = useDispatch<any>();

  const [readyTrucks, setreadyTrucks] = useState<Truck[]>(sampleReadyTrucks);
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

  useEffect(() => {
    dispatch(getAllFleet(1, 50));
  }, []);

  const updateReadyTrucks = (updatedTruck: Truck) => {
    setreadyTrucks((prevTrucks: Truck[]) =>
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
      <div className="page-content">
        <Container fluid>
          <DndProvider backend={HTML5Backend}>
            <div className="dispatch-live-content">
              <div className="dispatch-live-left">
                <Breadcrumb breadcrumbItem="Dispatch Live" title="Operations" />
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
                          key={digger.id}
                          className={index !== 0 ? "mt-4" : "mt-0"}
                        >
                          <MainCard
                            digger={digger}
                            readyTrucks={readyTrucks}
                            updateReadyTrucks={updateReadyTrucks}
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
                          dumpLocations={dumpLocations}
                          addDumpLocation={addDumpLocation}
                        />
                      )}
                </div>
              </div>
              <div className="dispatch-live-right">
                <RightBoard
                  readyTrucks={readyTrucks}
                  targetMaterials={sampleTargetMaterials}
                  dumpLocationsForAssign={dumpLocationsForAssign}
                />
              </div>
            </div>
          </DndProvider>
        </Container>
      </div>
    </React.Fragment>
  );
};
export default DispatchLive;
