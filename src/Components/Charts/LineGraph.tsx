import { Line } from "react-chartjs-2";
import "./style.css";
import { ChartOptions } from "chart.js";
import { CustomLineChartData, TextColor } from "./interfaces/general";
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
  Filler
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Card } from "reactstrap";

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
  ArcElement,
  Filler
);

interface LineGraphProps {
  data: CustomLineChartData;
  options: ChartOptions<"line">;
  textColor: TextColor[];
  widthVal?: string;
  header?: string,
  backgroundCol?: string;
}

export const LineGraph: React.FC<LineGraphProps> = ({
  data,
  options,
  textColor,
  widthVal,
  backgroundCol,
  header="",
}) => {

  return (
    <Card>
      <div className="BarGraphContainer">
        {header && <h4 className="progress-header">{header}</h4>}
        <div className="LegendContainer">
          {textColor.map((item, index) => (
            <div className="LegendItem" key={index}>
              <div
                className="LegendCircle"
                style={{ backgroundColor: item.color }}
              />
              <div className="LegendText">{item.text}</div>
            </div>
          ))}
        </div>

        <Line data={data} options={options} />

      </div>
    </Card>
  );
};
