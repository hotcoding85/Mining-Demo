import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from 'apexcharts';
import { Card, CardBody, CardTitle } from "reactstrap";

const BarGraph = (props: any) => {

    const series = [
        {
            name: "Actual",
            data: [46, 57, 59, 54, 62, 58, 64, 60, 66, 64, 60, 66],
        },
        {
            name: "Planned",
            data: [74, 83, 102, 97, 86, 106, 93, 114, 94, 64, 60, 66],
        }
    ];
    const options = {
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
            colors: ["transparent"],
        },

        colors: ['#ff0000', '#0ff000', '#0ff000', '#ff8300'],
        xaxis: {
            categories: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
            ],
        },
        yaxis: {
            title: {
                text: "",
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
                    return "$ " + val + " thousands";
                },
            },
        },
    };

    return (
            <Card style={{minHeight: '200px'}}>
                <CardBody>
                    <Chart
                        options={options}
                        series={series}
                        type="bar"
                    />
                </CardBody>
            </Card>
    )
}

export default BarGraph;