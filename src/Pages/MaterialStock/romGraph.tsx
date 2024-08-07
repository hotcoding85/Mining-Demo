import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from 'apexcharts';
import { Card, CardBody, CardTitle } from "reactstrap";

const RomGraph = (props: any) => {

    const series = [
        {
            name: "HG01",
            data: [46, 57, 59, 54, 62, 58, 64, 60, 66],
        },
        {
            name: "HG02",
            data: [74, 83, 102, 97, 86, 106, 93, 114, 94],
        },
        {
            name: "HG03",
            data: [37, 42, 38, 26, 47, 50, 54, 55, 43],
        },
        {
            name: "MG01",
            data: [0, 42, 38, 26, 47, 50, 54, 55, 43],
        },
        {
            name: "MG02",
            data: [46, 57, 59, 54, 62, 58, 64, 60, 66],
        },
        {
            name: "LG01",
            data: [74, 83, 102, 97, 86, 106, 93, 114, 94],
        },
        {
            name: "LG02",
            data: [37, 42, 38, 26, 47, 50, 54, 55, 43],
        },
        {
            name: "Waste",
            data: [0, 42, 38, 26, 47, 50, 54, 55, 43],
        },
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
                6,
                7,
                8,
                9,
                10,
                11,
                12,
                13,
                14,
                15
            ],
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
                    return "$ " + val + " thousands";
                },
            },
        },
    };

    return (
        <React.Fragment>
            <Card style={{minHeight: '511px'}}>
                <CardBody>
                    <CardTitle className="h4">Tonnes moved by hour</CardTitle>
                    <Chart
                        options={options}
                        series={series}
                        type="bar"
                    />
                </CardBody>
            </Card>
        </React.Fragment>
    )
}

export default RomGraph;