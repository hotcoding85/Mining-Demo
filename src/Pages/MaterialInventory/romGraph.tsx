import React, { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Card, CardBody, CardTitle } from "reactstrap";
import { getMaterialMoved } from "Helpers/api_materials_helper";
import { chain, groupBy, round } from "lodash";
import { shiftTimingsByDateandShift } from "utils/common";

const RomGraph = ({ graphType, shiftDate, shift }) => {
  const [data, setData] = useState([]);
  const [hours, setHours] = useState([]);

  const options: ApexOptions = useMemo(() => {
    return {
      chart: {
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "45%",
          endingShape: "rounded",
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
      },
      colors: [
        "#FFB629",
        "#936714",
        "#D99A21",
        "#B07C18",
        "#7C5710",
        "#62440C",
        "#62660C",
        "gray",
      ],
      xaxis: {
        categories: hours.map((hour: any) => hour.hour.toString()),
      },
      yaxis: {
        title: {
          text: "(tonnes)",
        },
      },
      grid: {
        borderColor: "#f1f1f1",
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val + " tonne";
          },
        },
      },
    };
  }, [hours]);

  useEffect(() => {
    // getMaterialMoved(`${shiftDate}:${shift}`)
    //   // getMaterialMoved("2024-08-05:NS")
    //   .then((response) => {
    //     formatGraphData(response.data);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });

    const exampleData = [
      { materialName: "Material A", hour: 6, payload: 20.5 },
      { materialName: "Material A", hour: 7, payload: 25.0 },
      { materialName: "Material A", hour: 8, payload: 18.5 },
      { materialName: "Material A", hour: 9, payload: 22.0 },
      { materialName: "Material A", hour: 10, payload: 24.5 },
      { materialName: "Material A", hour: 11, payload: 19.0 },

      { materialName: "Material B", hour: 6, payload: 15.0 },
      { materialName: "Material B", hour: 7, payload: 18.0 },
      { materialName: "Material B", hour: 8, payload: 20.5 },
      { materialName: "Material B", hour: 9, payload: 21.0 },
      { materialName: "Material B", hour: 10, payload: 17.5 },
      { materialName: "Material B", hour: 11, payload: 19.0 },
    ];

    formatGraphData(exampleData);
  }, [shiftDate, shift]);

  const formatGraphData = (data) => {
    let hours: any = [];
    let { start, end } = shiftTimingsByDateandShift(shiftDate, shift);
    while (start.isBefore(end) || start.isSame(end)) {
      hours.push({
        date: new Date(
          start.year(),
          start.month(),
          start.date(),
          start.hour(),
          start.minute(),
          start.second()
        ).getTime(),
        hour: start.hour(),
      });
      start = start.add(1, "hour");
    }

    let graphData: any = [];
    let materialNames = chain(data)
      .map((item) => item.materialName)
      .uniq()
      .sortBy((x) => x.toLowerCase())
      .value();
    let groupData = groupBy(data, "materialName");
    for (let materialName of materialNames) {
      let groupHourData = groupBy(groupData[materialName], "hour");
      let hourData: any = [];
      for (let hour of hours) {
        hourData.push(
          groupHourData[hour.hour]
            ? round(groupHourData[hour.hour][0].payload, 2)
            : 0
        );
      }

      graphData.push({
        name: materialName,
        data: hourData,
      });
    }

    setHours(hours);
    setData(graphData);
  };

  return (
    <React.Fragment>
      <Card style={{ minHeight: "511px" }}>
        <CardBody>
          <CardTitle className="h4">Tonnes moved per hour</CardTitle>
          {graphType == "bar" ? (
            <Chart options={options} series={data} type="bar" />
          ) : (
            <Chart options={options} series={data} type="line" />
          )}
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default RomGraph;
