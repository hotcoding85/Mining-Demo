import { ApexOptions } from "apexcharts";
import { useMemo } from "react";
import Chart from "react-apexcharts";

export interface ProgressPieChartProps {
  color: string;
  bgColor: string;
  value?: number;
  pctValue?: number;
  maxValue?: number;
  width?: number;
  height?: number;
}

const ProgressPieChart: React.FC<ProgressPieChartProps> = ({
  color,
  bgColor,
  value,
  maxValue,
  pctValue,
  width,
  height,
}) => {
  var options: ApexOptions = {
    plotOptions: {
      radialBar: {
        startAngle: 0,
        endAngle: 360,

        dataLabels: {
          name: {
            show: false,
          },
          value: {
            color: "#FFFFFF",
            offsetY: 10,
            fontSize: "2em",
            fontWeight: "500",
          },
        },
      },
    },
    fill: {
      colors: [color, bgColor],
    },
    labels: ["Utilization"],
  };

  const series = useMemo(
    () =>
      (value && maxValue && Number(((value / maxValue) * 100).toFixed(2))) || 0,
    [maxValue, value]
  );

  return (
    <Chart
      options={options}
      series={[pctValue || series]}
      type="radialBar"
      width={width}
      height={height}
    />
  );
};

export default ProgressPieChart;
