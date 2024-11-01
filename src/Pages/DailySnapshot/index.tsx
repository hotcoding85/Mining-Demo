import { LineGraph } from "Components/Charts/LineGraph";
import { BarGraph } from "../../Components/Charts/BarChart";
import { TextColor } from "../../Components/Charts/interfaces/general";
import { PieChart } from "../../Components/Charts/PieChart";
import { TripProgressBar } from "../Trucking/TripProgressBar";
import { hd785, pc1250 } from "assets/images/equipment";
import BarHeader from "./BarHeader";
import "./style.css";

const DailyProductionDashboard = () => {
  const diggerBarData = {
    labels: [
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ],
    datasets: [
      {
        label: "Plan",
        data: [23, 21, 15, 18, 20, 21, 23, 15, 20, 13, 5, 3],
        backgroundColor: "#9CA3B1",
        barPercentage: 1,
        categoryPercentage: 1,
        barThickness: 22,
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
        categoryPercentage: 1,
        barThickness: 22,
        borderRadius: {
          topLeft: 3,
          topRight: 3,
        },
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
        categoryPercentage: 1,
        barThickness: 22,
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
        categoryPercentage: 1,
        barThickness: 22,
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
          size: 14,
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

  const lineData = {
    labels: [
      "07:00",
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ],
    datasets: [
      {
        label: "Plan",
        data: [23, 21, 15, 18, 20, 21, 23, 15, 20, 13, 5, 3],
        borderColor: "#CF1322",
        backgroundColor: "rgba(24, 144, 255, 0.2)",
        fill: true,
        tension: 0,
        pointRadius: 4,
      },
      {
        label: "Actual",
        data: [21, 18, 14, 20, 19, 22, 19, 13, 18, 9, 3, 3],
        borderColor: "#389E0D",
        backgroundColor: "rgba(0, 80, 179, 0.2)",
        fill: true,
        tension: 0,
        pointRadius: 4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      x: {
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

  const textColor2: TextColor[] = [
    { text: "Plan", color: "#CF1322" },
    { text: "Actual", color: "#389E0D" },
  ];

  const operationalDelaysData = {
    labels: ["Fueling", "Clean Up", "Other", "Queueing", "Weather", "Operator"],
    datasets: [
      {
        data: [10, 10, 5, 15, 20, 40],
        backgroundColor: ["#D3ADF7", "#722ED1", "#B37FEB", "#531DAB", "#9254DE", "#391085"],
        borderWidth: 0,
      },
    ],
  };
  return (
    <div className="page-content">
      <div className="progress-bar-container">
        <h1 style={{ textAlign: "left"}}>Daily Mining Production Snapshot</h1>
        <TripProgressBar
          completed={200}
          planned={400}
          forecast={380}
          total={1000}
          useCustomLabels={false}
          type={"Production"}
          subHeader={`${200} of ${700} completed`}
          header={"Overall Load Target (Planned vs. Actual vs. Forecast)"}
          widthVal='95%'
        />
        <TripProgressBar
          completed={83000}
          planned={80000}
          total={200000}
          useCustomLabels={false}
          forecast={83000}
          subHeader={`${200} of ${700} completed`}
          type={"Production"}
          header={"Overall Tonnes Target (Planned vs. Actual vs. Forecast)"}
          widthVal='95%'
        />
      </div>
      <div className="ChartContainer prod-chart">
        <div className="bar-progress prod-bar-progress">
          <div style={{ marginBottom: "5%" }}>
            <BarHeader image={pc1250} title={'Diggers'} total={3} />
            <BarGraph
              data={diggerBarData}
              options={barOptions}
              widthVal={'100%'}
              backgroundCol={"#24314D"}
            />
          </div>
          <div style={{ marginBottom: "5%" }}>
            <BarHeader image={hd785} title={'Trucks'} total={10} />
            <BarGraph
              data={barData}
              options={barOptions}
              widthVal={'100%'}
              backgroundCol={"#24314D"}
            />
          </div>
          <div style={{ marginBottom: "5%" }}>
            {/* <TripProgressBar
              completed={120}
              planned={650}
              total={1200}
              forecast={500}
              header={"Overall Load"}
              subHeader="9 of 18 ROMS Delivered"
              backgroundCol={"#24314D"}
              widthVal={'100%'}
              subType="Production"
            /> */}
            <div className="bar-header-container light-box">
              <h2>Pit Extraction by Hour (Plan vs Actual)</h2>
            </div>
            <LineGraph
              data={lineData}
              widthVal={'100%'}
              options={lineOptions}
              textColor={textColor2}
              backgroundCol={"#24314D"}
            />
          </div>
          <div style={{ marginBottom: "5%" }}>
            {/* <TripProgressBar
              completed={420}
              planned={300}
              total={1000}
              forecast={800}
              header={"Overall Load"}
              subHeader="3 of 18 ROMS Delivered"
              backgroundCol={"#24314D"}
              widthVal={'100%'}
              subType="Production"
            /> */}
            {/* <LineGraph
              data={lineData}
              options={lineOptions}
              widthVal={'100%'}
              textColor={textColor2}
              backgroundCol={"#24314D"}
            /> */}
          </div>
        </div>
        <div className="pie prod light-box">
          <h2 style={{ padding: "20px", marginBottom: "50px", textAlign:'center' }}>
            {/* Truck and Digger Target Plan */}
          </h2>
          <PieChart
            title="Digger Operational Delays"
            data={operationalDelaysData}
            showLegend={true}
          />
          <PieChart
            title="Truck Operational Delays"
            data={operationalDelaysData}
            showLegend={true}
          />
          {/* <PieChart
            title="Digger Idling"
            data={operationalDelaysData}
            showLegend={false}
          />
          <PieChart
            title="Truck Idling"
            data={operationalDelaysData}
            showLegend={false}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default DailyProductionDashboard;
