import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

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
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart width={width} height={height} data={chartData} barSize={40}>
        <XAxis dataKey="x" tickLine={false} axisLine={false} stroke="#FFF" />
        <YAxis
          dataKey="y"
          max={30}
          min={0}
          tickLine={false}
          axisLine={false}
          tickCount={7}
          type="number"
          stroke="#FFF"
        />
        <CartesianGrid vertical={false} stroke="#4F5868" />
        <Bar dataKey="y" fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AnalysisChart;
