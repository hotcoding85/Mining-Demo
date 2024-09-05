import { Pie } from "react-chartjs-2";
import { ChartData, ChartOptions, TooltipItem } from "chart.js";
import "./style.css";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
  ArcElement
);

interface PieChartProps {
  title: string;
  data: ChartData<"pie">;
  showLegend?: boolean;
  legendsFirst?: boolean;
  width?: number;
  height?: number;
  legendsPosition?: "top" | "bottom";
  fontStyle?: any;
}

export const PieChart: React.FC<PieChartProps> = ({
  title,
  data,
  width,
  height,
  showLegend = true,
  legendsFirst = false,
  legendsPosition = "top",
  fontStyle,
}) => {
  const options: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<"pie">) => {
            const label = tooltipItem.label || "";
            const value = tooltipItem.raw as number;
            return `${label}: ${value}%`;
          },
        },
      },
      datalabels: {
        formatter: (value: number) => (value >= 5 ? `${value}%` : ""),
        color: fontStyle?.color || "#fff",
        font: {
          weight: "bold",
          size: 10,
          ...fontStyle,
        },
      },
    },
  };

  return (
    <div className="PieChartContainer">
      {legendsPosition === "top" && legendsFirst && showLegend && (
        <div className="LegendContainer2">
          {data.labels!.map((label, index) => (
            <div className="LegendItem2" key={index}>
              <div
                className="LegendCircle"
                style={{
                  backgroundColor: (
                    data.datasets[0].backgroundColor as string[]
                  )[index],
                }}
              />
              <div className="LegendText">{label as string}</div>
            </div>
          ))}
        </div>
      )}
      <div className="progress-header" style={{ textAlign: "center" }}>
        {title}
      </div>
      {legendsPosition === "top" && !legendsFirst && showLegend && (
        <div className="LegendContainer2">
          {data.labels!.map((label, index) => (
            <div className="LegendItem2" key={index}>
              <div
                className="LegendCircle"
                style={{
                  backgroundColor: (
                    data.datasets[0].backgroundColor as string[]
                  )[index],
                }}
              />
              <div className="LegendText">{label as string}</div>
            </div>
          ))}
        </div>
      )}
      <Pie data={data} options={options} width={width} height={height} />
      {legendsPosition === "bottom" && !legendsFirst && showLegend && (
        <div className="LegendContainer2 mt-5">
          {data.labels!.map((label, index) => (
            <div className="LegendItem2" key={index}>
              <div
                className="LegendCircle"
                style={{
                  backgroundColor: (
                    data.datasets[0].backgroundColor as string[]
                  )[index],
                }}
              />
              <div className="LegendText">{label as string}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
