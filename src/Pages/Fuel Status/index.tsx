import React from "react";
import FuelCard from "./FuelCard";
import { FuelData } from "./interfaces/FuelData";
import "./style.css";

const fuels: FuelData[] = [
  {
    id: "DT101",
    status: "Healthy",
    smu: 23456.67,
    fuelLevel: 30,
    fuelRate: 38.92,
    imageUrl: "https://picsum.photos/200/300",
    lastUpdated: "1h",
    sync: "manual",
  },
  {
    id: "DT101",
    status: "Critical",
    smu: 23456.67,
    fuelLevel: 30,
    fuelRate: 38.92,
    imageUrl: "https://picsum.photos/200/300",
    lastUpdated: "1h",
    sync: "inactive",
  },
  {
    id: "DT101",
    status: "Schedule Refuel",
    smu: 23456.67,
    fuelLevel: 30,
    fuelRate: 38.92,
    imageUrl: "https://picsum.photos/200/300",
    lastUpdated: "1h",
    sync: "active",
  },
  {
    id: "DT101",
    status: "Schedule Refuel",
    smu: 23456.67,
    fuelLevel: 30,
    fuelRate: 38.92,
    imageUrl: "https://picsum.photos/200/300",
    lastUpdated: "1h",
    sync: "active",
  },
  {
    id: "DT101",
    status: "Schedule Refuel",
    smu: 23456.67,
    fuelLevel: 30,
    fuelRate: 38.92,
    imageUrl: "https://picsum.photos/200/300",
    lastUpdated: "1h",
    sync: "active",
  },
  {
    id: "DT101",
    status: "Schedule Refuel",
    smu: 23456.67,
    fuelLevel: 30,
    fuelRate: 38.92,
    imageUrl: "https://picsum.photos/200/300",
    lastUpdated: "1h",
    sync: "active",
  },
  {
    id: "DT101",
    status: "Schedule Refuel",
    smu: 23456.67,
    fuelLevel: 30,
    fuelRate: 38.92,
    imageUrl: "https://picsum.photos/200/300",
    lastUpdated: "1h",
    sync: "active",
  },
];

const FuelStatusDashboard: React.FC = () => {
  return (
    <div className="page-content">
      <div className="fuel-cards-container">
        {fuels.map((fuel) => (
          <FuelCard
            key={fuel.id}
            id={fuel.id}
            status={fuel.status}
            smu={fuel.smu}
            fuelLevel={fuel.fuelLevel}
            fuelRate={fuel.fuelRate}
            imageUrl={fuel.imageUrl}
            lastUpdated={fuel.lastUpdated}
            sync={fuel.sync}
          />
        ))}
      </div>
    </div>
  );
};

export default FuelStatusDashboard;
