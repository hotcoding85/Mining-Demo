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
import { Card } from "reactstrap";

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

const TruckingPerformance = () => {
  const planExecutionData = {
    labels: [
      "Availability",
      "Utilization",
      "Delays",
    ],
    datasets: [
      {
        data: [75, 10, 15],
        backgroundColor: [
          "#389E0D",
          "#FAAD14",
          "#CF1322",
          
        ],
        borderWidth: 0,
      },
    ],
  };

  const operationalDelaysData = {
    labels: ["Fueling", "Queueing", "Clean Up", "Weather", "Other", "Waiting Operator"],
    datasets: [
      {
        data: [10, 10, 20, 40, 15, 5 ],
        backgroundColor: ["#D3ADF7", "#722ED1", "#B37FEB", "#531DAB", "#9254DE", "#391085"],
        borderWidth: 0,
      },
    ],
  };

  const truckIdlingData = {
    labels: ["Fueling", "Planned", "Clean Up", "Weather"],
    datasets: [
      {
        data: [30, 40, 20, 10],
        backgroundColor: ["#E0E0E0", "#C1C1C1", "#828282", "#656565"],
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
        ticks: {
          color:'#fff',
          font: {
            size:14
          }
        }
      },
      y: {
        grid: {
          display: true,
          color: "#9CA3B1",
          lineWidth: 0.2,
        },
        ticks: {
          color:'#fff',
          font: {
            size:14
          }
        }
      },
    },
  };

  return (
    <div className="page-content">
      <div className="DashboardContainer">
        <div className="trucking-header light-box">
          <h1>Trucking Performance</h1>
          <div className="performance-header">
            <PerformanceHeader
              label="Waste Moved"
              status="On target"
              currentValue="35,855t"
              totalValue="50,000t"
            />
            <PerformanceHeader
              label="Ore Moved"
              status="Below target"
              currentValue="2,855t"
              totalValue="5,000t"
            />
          </div>
        </div>

        <div className="ChartContainer">
          <div className="bar-progress">
            <div className="BarAndProgressContainer" style={{ alignItems: 'flex-start' }}>
              <TripProgressBar
                completed={50}
                forecast={100}
                subHeader="3 of 18 ROMS Delivered"
                header={"Current Trucking Execution Plan"}
              />
              <Card style={{width:'100%'}}>
                <BarGraph
                  data={barData}
                  options={barOptions}
                />
              </Card>
            </div>
            {/* <div className="BarAndProgressContainer" style={{ alignItems: 'flex-start' }}>
              <TripProgressBar
                completed={50}
                forecast={100}
                subHeader="3 of 18 ROMS Delivered"
                header={"Operator Delays"}
              />
              <Card style={{width:'100%'}}>
                <BarGraph
                  data={barData}
                  options={barOptions}
                  textColor={textColor}
                />
              </Card>
            </div>
            <div className="BarAndProgressContainer" style={{ alignItems: 'flex-start' }}>
              <TripProgressBar
                completed={50}
                forecast={100}
                subHeader="3 of 18 ROMS Delivered"
                header={"Idle"}
              />
              <Card style={{width:'100%'}}>
                <BarGraph
                  data={barData}
                  options={barOptions}
                  textColor={textColor}
                />
              </Card>
            </div> */}

          </div>
          <div className="pie light-box">
            <div className="BarAndProgressContainer">
              <PieChart title="ORE Target/Plan Execution" data={planExecutionData} />
              <PieChart title="Operational Delays" data={operationalDelaysData} />
              <PieChart title="Truck Idling" data={truckIdlingData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruckingPerformance;
