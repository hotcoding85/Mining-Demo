import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

import "./style.css";
import { TripProgressBar } from "./TripProgressBar";
import { BarGraph } from "../../Components/Charts/BarChart";
import { PieChart } from "../../Components/Charts/PieChart";
import { TextColor } from "../../Components/Charts/interfaces/general";
import PerformanceHeader from "./PerformanceHeader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
  ArcElement
);

const TruckingDashboard = () => {
  const operationalDelaysData = {
    labels: [
      "Fueling",
      "Clean Up",
      "Other",
      "Queueing",
      "Weather",
      "Waiting Operator",
    ],
    datasets: [
      {
        data: [10, 10, 5, 15, 20, 40],
        backgroundColor: [
          "#9b59b6",
          "#8e44ad",
          "#3498db",
          "#e74c3c",
          "#f39c12",
          "#2ecc71",
        ],
        borderWidth: 0,
      },
    ],
  };

  const truckIdlingData = {
    labels: ["Fueling", "Planned", "Clean Up", "Weather"],
    datasets: [
      {
        data: [10, 30, 20, 40],
        backgroundColor: ["#3498db", "#9b59b6", "#2ecc71", "#f39c12"],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: [
      "DT01",
      "DT02",
      "DT03",
      "DT04",
      "DT05",
      "DT06",
      "DT07",
      "DT08",
      "DT09",
      "DT10",
      "DT11",
      "DT12",
    ],
    datasets: [
      {
        label: "Plan",
        data: [23, 21, 15, 18, 20, 21, 23, 15, 20, 13, 5, 3],
        backgroundColor: "#9CA3B1",
        barPercentage: 1,
        categoryPercentage: 0.4,
        barThickness: 17,
        borderRadius: {
          topLeft: 3,
          topRight: 3,
        },
      },
      {
        label: "Actual",
        data: [21, 18, 14, 20, 19, 22, 19, 13, 18, 9, 3, 3],
        backgroundColor: "#535E77",
        barPercentage: 1,
        categoryPercentage: 0.4,
        barThickness: 17,
        borderRadius: {
          topLeft: 3,
          topRight: 3,
        },
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        display: false,
      },
      datalabels: {
        anchor: "start" as const,
        align: "end" as const,
        color: "#fff",
        font: {
          size: 10,
          weight: "bold" as const,
        },
        formatter: (value: number) => value,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: true,
          color: "#9CA3B1",
          lineWidth: 0.2,
        },
      },
    },
  };

  const textColor: TextColor[] = [
    { text: "Plan", color: "#9CA3B1" },
    { text: "Actual", color: "#535E77" },
  ];

  return ( 
    <div className="page-content">
    <div className="DashboardContainer">
      <div className="trucking-header">
        <h1>Trucking Performance</h1>
        <div className="performance-header">
          <PerformanceHeader
            label="Waste Material Movement"
            status="On target"
            currentValue="135,855t"
            totalValue="150,000t"
          />
          <PerformanceHeader
            label="Waste Material Movement"
            status="Below target"
            currentValue="135,855t"
            totalValue="150,000t"
          />
        </div>
      </div>

      <div className="ChartContainer">
        <div className="bar-progress">
          <div className="BarAndProgressContainer"  style={{alignItems:'flex-start'}}>
            <TripProgressBar
              completed={50}
              forecast={100}
              subHeader="3 of 18 ROMS Delivered"
              header={"Overall Load Target (Planned vs. Actual vs. Forecast)"}
            />
            <BarGraph
              data={barData}
              options={barOptions}
              textColor={textColor}
            />
          </div>
          
        </div>
        <div className="pie">
          <div className="BarAndProgressContainer">
            <PieChart title="Operational Delays" data={operationalDelaysData} />
            <PieChart title="Truck Idling" data={truckIdlingData} />
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default TruckingDashboard;
