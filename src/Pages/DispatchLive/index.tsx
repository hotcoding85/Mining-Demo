import React, { useEffect, useState } from "react";
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

const DispatchLive: React.FC = () => {
  document.title = "Dispatch Live | FMS Live";
  const [readyTrucks, setreadyTrucks] = useState<Truck[]>(sampleReadyTrucks);
  const [targetMaterials, setTargetMaterials] = useState<Material[]>(
    sampleTargetMaterials
  );
  const [dumpLocations, setDumpLocations] = useState<DumpLocation[]>([]);

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
    console.log(key);
  };
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "All",
    },
    {
      key: "2",
      label: "Digger1",
    },
    {
      key: "3",
      label: "Digger2",
    },
    {
      key: "4",
      label: "Digger3",
    },
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
                  <Col md="12" className="mb-4 d-flex">
                    <Space>
                      <Tabs
                        defaultActiveKey="1"
                        items={items}
                        onChange={onTabChange}
                      ></Tabs>
                    </Space>
                  </Col>
                </Row>
                <MainCard
                  readyTrucks={readyTrucks}
                  updateReadyTrucks={updateReadyTrucks}
                  dumpLocations={dumpLocations}
                  addDumpLocation={addDumpLocation}
                />
              </div>
              <div className="dispatch-live-right">
                <RightBoard
                  readyTrucks={readyTrucks}
                  targetMaterials={targetMaterials}
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
