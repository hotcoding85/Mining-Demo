import React from "react";
import VehicleCard from "./VehicleCard";
import AssignTruckItem from "./AssignTruckItem";
import AssignLocationItem from "./AssignLocationItem";
import { pc2000 } from "assets/images/equipment";
import { Row, Col } from "reactstrap";
import { Select, Progress } from "antd";
import { ActiveBenchData, DiggerData, DumpLocation, Truck } from './interfaces/type';
import AssignBoard from "./AssignBoard";
import { Vehicle } from "slices/fleet/reducer";

interface MainCardProps {
    digger: DiggerData;
    assignedTrucks : Truck[];
    updateReadyTrucks : (updatedTruck: Truck) => void;
    removeTruckFromAssigned : (removedTruck: Truck) => void;
    assignTruckToFleet : (truck : Truck, diggerId : string) => void;
    dumpLocations : DumpLocation[];
    addDumpLocation : (newDumpLocation: DumpLocation) => void;
    assignedBenches : ActiveBenchData[];
    addBenches : (newBenches: ActiveBenchData) => void;
    diggerHeader : string;
}  

const MainCard : React.FC<MainCardProps> = ({
    digger,
    assignedTrucks,
    updateReadyTrucks,
    removeTruckFromAssigned,
    assignTruckToFleet,
    dumpLocations,
    addDumpLocation,
    assignedBenches,
    addBenches,
    diggerHeader
}) => {

    function getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandomFloat(min: number, max: number, decimalPlaces: number): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round((Math.random() * (max - min) + min) * factor) / factor;
    }

    return (
        <React.Fragment>
            <div className="dispatch-live-main-card">
                <div className="content-container">
                    <div className="vehicle-card-container">
                        <p className="vehicle-card-name">{diggerHeader}</p>
                        <VehicleCard
                            index={digger.no}
                            id={'EX201'}
                            status={'Healthy'}
                            smu={getRandomFloat(23000, 38000, 1)}
                            fuelLevel={getRandomInt(20, 100)}
                            fuelRate={getRandomFloat(40, 80, 1)}
                            imageUrl={pc2000}
                            lastUpdated={getRandomInt(1, 2)+'m'}
                            sync={'active'}
                            assignedBenches={assignedBenches}
                            addBenches={addBenches}
                            collapse={false}
                        >
                        </VehicleCard>
                    </div>
                    <AssignBoard 
                        digger={digger}
                        assignedTrucks={assignedTrucks}
                        updateReadyTrucks={updateReadyTrucks}
                        removeTruckFromAssigned={removeTruckFromAssigned}
                        assignTruckToFleet={assignTruckToFleet}
                        dumpLocations={dumpLocations}
                        addDumpLocation={addDumpLocation}
                    />
                </div>
                 
            </div>
            
        </React.Fragment>
    )
}

export default MainCard;
