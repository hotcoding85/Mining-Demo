import React from "react";
import VehicleCard from "./VehicleCard";
import AssignTruckItem from "./AssignTruckItem";
import AssignLocationItem from "./AssignLocationItem";
import { pc2000 } from "assets/images/equipment";
import { Row, Col } from "reactstrap";
import { Select, Progress } from "antd";
import { DumpLocation, Truck } from './interfaces/type';
import AssignBoard from "./AssignBoard";

interface MainCardProps {
    readyTrucks : Truck[];
    updateReadyTrucks : (updatedTask: Truck) => void;
    dumpLocations : DumpLocation[];
    addDumpLocation : (newDumpLocation: DumpLocation) => void;
}  

const MainCard : React.FC<MainCardProps> = ({
    readyTrucks,
    updateReadyTrucks,
    dumpLocations,
    addDumpLocation
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
                <div className="dispatch-location">
                    <div className="current-location-container">
                        <div className="current-location-text">
                            <p className="current-location-label">Current Work Location</p>
                            <select name="current-work-location" id="currentWorkLocation">
                                <option value="440_BLK1_HG01" selected>440_BLK1_HG01</option>
                            </select>
                        </div>
                        <div className="current-location-progress">
                            <p className="vehicle-progress-text" style={{color : "white"}}>
                                <span className="vehicle-progress-label">Total Tonnes Moved</span>
                                <span className="vehicle-progress-value">50t/100t</span>
                            </p>
                            <Progress percent={50} showInfo={false} />
                        </div>
                    </div>
                    <div className="location-divider"></div>
                    <div className="next-location-container">
                        <p className="next-location-label">Next Work Location</p>
                        <select name="next-work-location" id="nextWorkLocation">
                                <option value="440_BLK1_HG02" selected>440_BLK1_HG01</option>
                        </select>
                    </div>
                </div>
                <div className="content-container">
                    <div className="vehicle-card-container">
                        <p className="vehicle-card-name">Digger Fleet</p>
                        <VehicleCard
                            key={1}
                            id={'EX201'}
                            status={'Healthy'}
                            smu={getRandomFloat(23000, 38000, 1)}
                            fuelLevel={getRandomInt(20, 100)}
                            fuelRate={getRandomFloat(40, 80, 1)}
                            imageUrl={pc2000}
                            lastUpdated={getRandomInt(1, 2)+'m'}
                            sync={'active'}
                        >
                        </VehicleCard>
                    </div>
                    <AssignBoard 
                        readyTrucks={readyTrucks}
                        updateReadyTrucks={updateReadyTrucks}
                        dumpLocations={dumpLocations}
                        addDumpLocation={addDumpLocation}
                    />
                </div>
                 
            </div>
            
        </React.Fragment>
    )
}

export default MainCard;