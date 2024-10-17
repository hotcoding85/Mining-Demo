import { Card, CardBody } from "reactstrap"
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

    return (
        <Card className="">
            <CardBody>
                <TripProgressBar
                    completed={420}
                    forecast={570}
                    planned={420}
                    total={580}
                    useCustomLabels={false}
                    type={"Trucking"}
                    subHeader={`${420} out of ${580} Tripts Completed`}
                    header={"Total Planned Trips vs Actual Trips"}
                    widthVal='95%'
                    />
            </CardBody>
        </Card>
    )
}