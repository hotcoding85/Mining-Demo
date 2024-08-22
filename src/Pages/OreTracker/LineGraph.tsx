import React from "react";
import Chart from "react-apexcharts";
import { Card, CardBody } from "reactstrap";

const LineBarGraph = (props) => {
    const series = [
        {
            name: "Actual",
            type: "line",
            data: [46, 57, 59, 54, 62, 58, 64, 60, 66, 64, 60, 66],
        },
        {
            name: "Actual",
            type: "bar",
            data: [46, 57, 59, 54, 62, 58, 64, 60, 66, 64, 60, 66],
        },
        {
            name: "Planned",
            type: "line",
            data: [74, 83, 102, 97, 86, 106, 93, 114, 94, 64, 60, 66],
        },
        {
            name: "Planned",
            type: "bar",
            data: [74, 83, 102, 97, 86, 106, 93, 114, 94, 64, 60, 66],
        }
    ];
    const options = {
        chart: {
            toolbar: {
                show: false,
            },
            stacked: true,
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "100%",
                endingShape: "flat",
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 2,
            colors: ["#ffffff"],
        },
        colors: ['#ff0000', '#0ff000', '#ff0000', '#0ff000'],
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
            opacity: 0.5,
        },
        tooltip: {
            y: {
                formatter: function (val) {
                    return "$ " + val + " thousands";
                },
            },
        },
        legend: {
            showForSingleSeries: true,
            show: true,
            showForNullSeries: true,
            showForZeroSeries: true,
            customLegendItems: ['Actual', 'Planned'],
            labels: {
                colors: ['#ff0000', '#0ff000'],
            },
        },
    };

    return (
        <Card style={{minHeight: '200px'}}>
            <CardBody>
                <Chart
                    options={options}
                    series={series}
                    type="line"
                />
            </CardBody>
        </Card>
    )
}

export default LineBarGraph;
