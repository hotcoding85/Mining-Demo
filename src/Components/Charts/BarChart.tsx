import { Bar } from "react-chartjs-2";
import "./style.css";
import { ChartOptions } from "chart.js";
import { CustomBarChartData, TextColor } from "./interfaces/general";
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

interface BarGraphProps {
  data: CustomBarChartData;
  options: ChartOptions<"bar">;
  widthVal?: string;
  backgroundCol?: string;
}

export const BarGraph: React.FC<BarGraphProps> = ({
  data,
  options,
  widthVal,
  backgroundCol,
}) => {

  const labels = data.datasets.map(item => {return {'title': item.label, 'color':item.backgroundColor}})
  return (
    <div className="BarGraphContainer">
      <div className="LegendContainer">
        {labels.map((item, index) => (
          <div className="LegendItem" key={index}>
            <div
              className="LegendCircle"
              style={{ backgroundColor: item.color }}
            />
            <div className="LegendText">{item.title}</div>
          </div>
        ))}
      </div>
      <Bar data={data} options={options} />
    </div>
  );
};
