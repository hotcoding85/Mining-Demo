import { LAYOUT_MODE_TYPES } from "Components/constants/layout";
import { useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { LayoutSelector } from "selectors";

interface AnalysisChartProps {
  chartData: {
    x: string;
    y: number;
  }[];
  color: string;
  width?: number;
  height?: number;
}

const AnalysisChart: React.FC<AnalysisChartProps> = ({
  chartData,
  color,
  width,
  height,
}) => {
  const { layoutModeType } = useSelector(LayoutSelector);

  const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart width={width} height={height} data={chartData} barSize={40}>
        <XAxis
          dataKey="x"
          tickLine={false}
          axisLine={false}
          stroke={isLight ? "#828282" : "#FFF"}
        />
        <YAxis
          dataKey="y"
          max={30}
          min={0}
          tickLine={false}
          axisLine={false}
          tickCount={7}
          type="number"
          stroke={isLight ? "#828282" : "#FFF"}
        />
        <CartesianGrid
          vertical={false}
          stroke={isLight ? "#4F5868" : "#C1C1C1"}
        />
        <Bar dataKey="y" fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AnalysisChart;
