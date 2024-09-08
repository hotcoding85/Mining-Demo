import { ApexOptions } from "apexcharts";
import { useMemo } from "react";
import Chart from "react-apexcharts";

export interface ProgressPieChartProps {
  color: string;
  bgColor: string;
  textColor: string;
  value?: number;
  pctValue?: number;
  maxValue?: number;
  width?: number;
  height?: number;
}

const ProgressPieChart: React.FC<ProgressPieChartProps> = ({
  color,
  bgColor,
  textColor,
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
        track: {
          background: bgColor,
          show: true,
          strokeWidth: '100%',
          margin: 5, // Optional, gives space between bars
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            blur: 4,
            opacity: 0.15
          }
        },
        hollow: {
          size: '65%', // Adjusts the size of the hollow center
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            color: textColor,
            offsetY: 10,
            fontSize: "2em",
            fontWeight: "600",
          },
        },
      }
    },
    fill: {
      colors: [color, bgColor],
    },
    labels: ["Utilization"],
    stroke: {
      lineCap: 'round'
    },
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
