import React from "react";
import ReactApexChart from "react-apexcharts";
interface GaugeChartProps {
    value: number;
    color: string;
    bgColor: string;
    total: number;
}
const GaugeChart: React.FC<GaugeChartProps> = ({value, color, bgColor, total}) => {
    const series = [Math.ceil(value / total * 100)]; // 90.57% progress (135,855 out of 150,000)
    console.log(series)
    const options: any = {
        chart: {
        type: 'radialBar',
            offsetY: -20, // Adjust for text centering
        },
        plotOptions: {
            radialBar: {
                startAngle: -90,
                endAngle: 90,
                hollow: {
                    margin: 0,
                    size: '60%',
                },
                track: {
                    background: bgColor, // Dark gray background for the progress
                    strokeWidth: '100%',
                    margin: 5, // Spacing between progress and track
                },
                dataLabels: {
                show: true,
                name: {
                    show: false,
                },
                value: {
                    formatter: function () {
                        return '135,855t'; // Fixed value display as per your image
                    },
                    fontSize: '24px', // Matches text size in the image
                    fontWeight: 600,
                    color: color, // Bright green color for the text
                    offsetY: -20,
                },
                total: {
                    show: true,
                    label: series,
                    fontSize: '10px',
                    color: color,
                    fontWeight: 400,
                    offsetY: 10,
                    formatter: function () {
                        return value.toLocaleString() + 't'; // Subtext shown under the main value
                    }
                }
                }
            }
        },
        fill: {
            colors: [color], // Progress arc color
        },
        stroke: {
            lineCap: 'butt', // Flat cap for the progress (not rounded)
        },
        labels: ['Progress']
    };

  return (
    <div style={{height: '150px', maxHeight: '150px'}}>
      <ReactApexChart
        options={options}
        series={series}
        type="radialBar"
        height={250}
      />
    </div>
  );
};

export default GaugeChart;
