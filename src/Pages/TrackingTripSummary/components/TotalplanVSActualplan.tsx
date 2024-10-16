import { Card, CardBody, CardTitle } from "reactstrap"
import Chart from 'react-apexcharts';
import ForecastProgressBar from "Pages/DailyProduction/ForecastProgressBar";
import { useState } from "react";
import { TripProgressBar } from "./TripProgressBar";
export const TotalplanVSActualplan = (props) => {
    let color = '#F44336'
    var options = {
        plotOptions: {
          radialBar: {
            startAngle: 0,
            endAngle: 360,
            dataLabels: {
              name: {
                show: false,
              },
              value: {
                fontSize: '35px',
                color: '#fff',
                formatter: function (val) {
                  return val + "%";
                }
              }
            }
          }
        },
        fill: {
          colors: [color]
        },
        labels: ['Utilization'],
    };

    const [overallLoadTarget, setOverallLoadTarget] = useState({
        options: options,
        series: [62.5],
        value: 340,
        max: 600,
        forecast: 600,
        forecastColor: 'green'
    });

    return (
        <Card className="">
            <CardBody>
                <TripProgressBar
                    completed={300}
                    forecast={600}
                    planned={400}
                    total={600}
                    useCustomLabels={false}
                    type={"Production"}
                    subHeader={`${300} out of ${600} Tripts Completed`}
                    header={"Total Planned Trips vs Actual Trips"}
                    widthVal='95%'
                    />
            </CardBody>
        </Card>
    )
}