import React from "react";
import Chart from "react-apexcharts";
import { Card, CardBody } from "reactstrap";

const TonnesBarGraph = (props) => {

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

        colors: ['#808080', '#ff0000'],
        xaxis: {
            categories: [
                'WASTE',
                'ROM ORE'
            ],
            labels: {
                offsetY: 50, // Add this line
            },
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
                formatter: function (val) {
                    return val + " tonnes";
                },
            },
        },
    };

    return (
            <Card>
                <CardBody>
                    <Chart
                        options={options}
                        series={props.series}
                        type="bar"
                    />
                </CardBody>
            </Card>
    )
}

export default TonnesBarGraph;
