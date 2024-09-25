import React, { useState } from "react";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Col, Container, Row } from "reactstrap";
import MainCard from "./MainCard";
import RightBoard from "./RightBoard";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  sampleReadyTrucks,
  dumpLocationsForAssign,
  sampleAssignedBenches,
  diggers,
  sampleTargetMaterials,
} from "./data/sampleData";
import { Space, Tabs } from "antd";
import type { TabsProps } from "antd";
import "./styles/style.scss";
import {
  Truck,
  DumpLocation,
  ActiveBenchData,
  DiggerData,
  Material,
} from "./interfaces/type";

const DispatchLive: React.FC = () => {
  document.title = "Dispatch Live | FMS Live";
  const [readyTrucks, setreadyTrucks] = useState<Truck[]>(sampleReadyTrucks);
  const [assignedTrucks, setAssignedTrucks] = useState<Truck[]>([]);
  const [dumpLocations, setDumpLocations] = useState<DumpLocation[]>([]);
  const [assignedBenches, setAssignedBenches] = useState<ActiveBenchData[]>(
    sampleAssignedBenches
  );
  const [targetMaterials, setTargetMaterials] = useState<Material[]>(
    sampleTargetMaterials
  );
  const [diggersForShow, setdiggersForShow] = useState<DiggerData[]>(diggers);

  const updateReadyTrucks = (assignedTruck: Truck) => {
    setreadyTrucks((prevTrucks: Truck[]) =>
      prevTrucks.filter((truck) => truck.id !== assignedTruck.id)
    );

    setAssignedTrucks((prevAssignedTrucks: Truck[]) => [
      ...prevAssignedTrucks,
      assignedTruck,
    ]);
  };

    const onTabChange = (key: string) => {
        if (key === "All") {
        setdiggersForShow(diggers);
        } else {
        const filteredDiggers = diggers.filter(
            (digger) => digger.diggerId == key
        );
        setdiggersForShow(filteredDiggers);
        }
    }

    const removeTruckFromAssigned = (removedTruck : Truck) => {
        setreadyTrucks((prevTrucks: Truck[]) => [
            ...prevTrucks, 
            removedTruck
        ]
        );
        
        setAssignedTrucks((prevAssignedTrucks: Truck[]) => 
            prevAssignedTrucks.filter((truck) => truck.id !== removedTruck.id )
        );
    }

    const assignTruckToFleet = (truck : Truck, diggerId : string) => {
        const assignIds = assignedTrucks.filter(truck => truck.diggerId == diggerId).map(truck => {return truck.assignId});
        const maxValue = assignIds.length > 0 ? Math.max(...assignIds) : -1; 
        const updatedTruck = {
            ...truck,
            diggerId : diggerId,
            assignId : maxValue + 1
        }
        setAssignedTrucks((prevAssignedTrucks) => (
            prevAssignedTrucks.map(item => (item.id == truck.id) ? updatedTruck  : item)
        ))
    }

    const addDumpLocation = (newDumpLocation: DumpLocation) => {
        const existItem = dumpLocations.find(
            (item) =>
              item.assignId === newDumpLocation.assignId && item.diggerId == newDumpLocation.diggerId
        );
        if(existItem) {
            setDumpLocations((prevBenches) => (
                prevBenches.map(item => (item.assignId === newDumpLocation.assignId && item.diggerId == newDumpLocation.diggerId) ? newDumpLocation : item)
            ));
        } else {
            setDumpLocations((prevLocations) => [...prevLocations, newDumpLocation]);
        }
        
    };

    const addBenches= (newBenches : ActiveBenchData) => {
        const existItem = assignedBenches.find(
            (item) =>
              item.id === newBenches.id && item.assignId === newBenches.assignId
        );
        if(!existItem) {
            setAssignedBenches((prevBenches) => [...prevBenches, newBenches]);
        }
    }

    const tabItems: TabsProps['items'] = [
        {
            key: 'All',
            label: 'All',
        },
        {
            key: 'Digger1',
            label: 'Digger1'
        },
        {
            key: 'Digger2',
            label: 'Digger2'
        },
        {
            key: 'Digger3',
            label: 'Digger3'
        }
    ];

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <DndProvider backend={HTML5Backend}>
                        <div className='dispatch-live-content'>
                            <div className='dispatch-live-left'>
                                <Breadcrumb breadcrumbItem="Dispatch Live" title="Operations" />
                                <Row>
                                    <Col md="12" className='mb-4 d-flex'>
                                        <Space>
                                            <Tabs defaultActiveKey='1' items={tabItems} onChange={onTabChange}></Tabs>
                                        </Space>
                                    </Col>
                                </Row>
                                {diggersForShow.map((digger, index) => (
                                    <MainCard 
                                        digger = {digger}
                                        diggerHeader = {digger.headerName}
                                        assignedTrucks = {assignedTrucks}
                                        updateReadyTrucks = {updateReadyTrucks}
                                        removeTruckFromAssigned = {removeTruckFromAssigned}
                                        assignTruckToFleet={assignTruckToFleet}
                                        dumpLocations={dumpLocations}
                                        addDumpLocation={addDumpLocation}
                                        assignedBenches={assignedBenches}
                                        addBenches={addBenches}
                                    />
                                ))}
                                
                            </div>
                            <div className='dispatch-live-right'>
                                <RightBoard 
                                    readyTrucks = {readyTrucks}
                                    targetMaterials={targetMaterials.filter(
                                        (item) => !item.diggerId
                                      )}
                                    dumpLocationsForAssign = {dumpLocationsForAssign}
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
