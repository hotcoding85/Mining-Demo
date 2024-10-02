import { ApexOptions } from "apexcharts";
import {
  FLEET_TIME_STATE_COLOR,
  LAYOUT_MODE_TYPES,
} from "Components/constants/layout";
import React, { useState } from "react";
import Chart from "react-apexcharts";
import { useSelector } from "react-redux";
import { LayoutSelector } from "selectors";

const GanttChart: React.FC = () => {
  const { layoutModeType } = useSelector(LayoutSelector);

  const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;

  const chartOptions: ApexOptions = {
    chart: {
      type: "rangeBar",
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "50%",
        rangeBarGroupRows: true,
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        show: true,
        format: "mm:ss",
        style: {
          colors: [isLight ? "#828282" : "#fff"],
        },
      },
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
    },
    grid: {
      show: false, // Remove grid lines
    },
    tooltip: {
      custom: function (opts) {
        const from = new Date(opts.y1).toLocaleString();
        const to = new Date(opts.y2).toLocaleString();
        return `<div>From: ${from} <br> To: ${to}</div>`;
      },
    },
    fill: {
      type: "solid",
    },
    colors: Object.values(FLEET_TIME_STATE_COLOR),
    legend: {
      show: false, // Hide legend
    },
  };

  const [chartSeries, setChartSeries] = useState([
    {
      name: "Task 1",
      data: [
        {
          x: "1",
          y: [
            new Date("2022-09-01T06:10:00").getTime(),
            new Date("2022-09-01T07:00:00").getTime(),
          ],
        },
        {
          x: "2",
          y: [
            new Date("2022-09-01T06:05:00").getTime(),
            new Date("2022-09-01T06:18:00").getTime(),
          ],
        },
        {
          x: "2",
          y: [
            new Date("2022-09-01T06:20:00").getTime(),
            new Date("2022-09-01T06:58:00").getTime(),
          ],
        },
        {
          x: "2",
          y: [
            new Date("2022-09-01T07:00:00").getTime(),
            new Date("2022-09-01T07:03:00").getTime(),
          ],
        },
        {
          x: "2",
          y: [
            new Date("2022-09-01T07:05:00").getTime(),
            new Date("2022-09-01T07:09:30").getTime(),
          ],
        },
        {
          x: "3",
          y: [
            new Date("2022-09-01T06:25:00").getTime(),
            new Date("2022-09-01T07:00:30").getTime(),
          ],
        },
        {
          x: "3",
          y: [
            new Date("2022-09-01T07:05:00").getTime(),
            new Date("2022-09-01T07:10:00").getTime(),
          ],
        },
        {
          x: "4",
          y: [
            new Date("2022-09-01T06:08:00").getTime(),
            new Date("2022-09-01T06:18:00").getTime(),
          ],
        },
        {
          x: "4",
          y: [
            new Date("2022-09-01T06:22:00").getTime(),
            new Date("2022-09-01T06:52:00").getTime(),
          ],
        },
        {
          x: "4",
          y: [
            new Date("2022-09-01T06:55:00").getTime(),
            new Date("2022-09-01T07:10:00").getTime(),
          ],
        },
        {
          x: "5",
          y: [
            new Date("2022-09-01T06:03:00").getTime(),
            new Date("2022-09-01T06:58:00").getTime(),
          ],
        },
        {
          x: "5",
          y: [
            new Date("2022-09-01T07:05:00").getTime(),
            new Date("2022-09-01T07:10:00").getTime(),
          ],
        },
      ],
    },
    {
      name: "Task 2",
      data: [
        {
          x: "1",
          y: [
            new Date("2022-09-01T06:00:00").getTime(),
            new Date("2022-09-01T06:08:00").getTime(),
          ],
        },
        {
          x: "2",
          y: [
            new Date("2022-09-01T06:58:00").getTime(),
            new Date("2022-09-01T07:00:00").getTime(),
          ],
        },
        {
          x: "3",
          y: [
            new Date("2022-09-01T06:00:00").getTime(),
            new Date("2022-09-01T06:25:00").getTime(),
          ],
        },
        {
          x: "4",
          y: [
            new Date("2022-09-01T06:00:00").getTime(),
            new Date("2022-09-01T06:08:00").getTime(),
          ],
        },
      ],
    },
    {
      name: "Task 3",
      data: [
        {
          x: "3",
          y: [
            new Date("2022-09-01T06:10:00").getTime(),
            new Date("2022-09-01T06:25:00").getTime(),
          ],
        },
        {
          x: "3",
          y: [
            new Date("2022-09-01T06:35:00").getTime(),
            new Date("2022-09-01T06:45:00").getTime(),
          ],
        },
      ],
    },
    {
      name: "Task 4",
      data: [
        {
          x: "4",
          y: [
            new Date("2022-09-01T06:05:00").getTime(),
            new Date("2022-09-01T06:10:00").getTime(),
          ],
        },
        {
          x: "4",
          y: [
            new Date("2022-09-01T06:25:00").getTime(),
            new Date("2022-09-01T06:35:00").getTime(),
          ],
        },
      ],
    },
    {
      name: "Task 5",
      data: [
        {
          x: "5",
          y: [
            new Date("2022-09-01T06:15:00").getTime(),
            new Date("2022-09-01T06:30:00").getTime(),
          ],
        },
        {
          x: "5",
          y: [
            new Date("2022-09-01T06:55:00").getTime(),
            new Date("2022-09-01T07:05:00").getTime(),
          ],
        },
      ],
    },
    {
      name: "Task 6",
      data: [
        {
          x: "6",
          y: [
            new Date("2022-09-01T06:20:00").getTime(),
            new Date("2022-09-01T06:40:00").getTime(),
          ],
        },
        {
          x: "6",
          y: [
            new Date("2022-09-01T06:55:00").getTime(),
            new Date("2022-09-01T07:00:00").getTime(),
          ],
        },
      ],
    },
    {
      name: "Task 7",
      data: [
        {
          x: "7",
          y: [
            new Date("2022-09-01T06:05:00").getTime(),
            new Date("2022-09-01T06:15:00").getTime(),
          ],
        },
        {
          x: "7",
          y: [
            new Date("2022-09-01T06:35:00").getTime(),
            new Date("2022-09-01T07:00:00").getTime(),
          ],
        },
      ],
    },
  ]);

  return (
    <div>
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="rangeBar"
        height={400}
      />
    </div>
  );
};

export default GanttChart;
