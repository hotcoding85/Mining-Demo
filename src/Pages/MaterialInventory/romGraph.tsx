import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from 'apexcharts';
import { Card, CardBody, CardTitle } from "reactstrap";

const RomGraph = (props: any) => {

    const series = [
        {
            name: "HG01",
            data: [3174, 8259, 4671, 9420, 1487, 7245, 5912, 1036, 6734, 8820, 2156, 9538],
        },
        {
            name: "HG02",
            data: [5682, 3941, 7593, 8402, 1125, 6354, 9928, 2730, 4773, 6861, 8207, 4901],
        },
        {
            name: "HG03",
            data: [4321, 8476, 2594, 9810, 6742, 1135, 7889, 3940, 5607, 9023, 1428, 7135],
        },
        {
            name: "MG01",
            data: [4982, 7031, 8327, 1204, 9674, 3410, 7543, 5962, 2743, 8810, 4109, 6602]
            ,
        },
        {
            name: "MG02",
            data: [1362, 7298, 9821, 4123, 5834, 9902, 2457, 6700, 8025, 1614, 7940, 3348]
            ,
        },
        {
            name: "LG01",
            data: [5639, 2745, 7210, 9143, 1489, 7894, 9357, 4012, 2691, 8564, 3790, 9501]
            ,
        },
        {
            name: "LG02",
            data: [2205, 8129, 4760, 2934, 7596, 1398, 6142, 9457, 3601, 8321, 4986, 2770]
            ,
        },
        {
            name: "Waste",
            data: [3547, 6149, 7995, 1243, 9102, 5284, 6712, 8438, 3290, 4613, 7250, 8201]
            ,
        },
    ];

    function randomInRange(min: number, max: number): number {
        if (min > max) {
            throw new Error("Minimum value cannot be greater than maximum value.");
        }
        return Math.floor(randomInRange(1000, 10000) * (max - min + 1)) + min;
    }

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
            // colors: ["transparent"],
        },

        colors: ['#FFB629', '#D99A21', '#B07C18', '#936714', '#7C5710', '#62440C', '#62660C', 'gray'],
        xaxis: {
            categories: [
                '06',
                '07',
                '08',
                '09',
                '10',
                '11',
                '12',
                '13',
                '14',
                '15'
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
                    <CardTitle className="h4">Tonnes moved per hour</CardTitle>
                    {
                        props.graphType == 'bar' ? <Chart
                        options={options}
                        series={series}
                        type="bar"
                    /> : <Chart
                    options={options}
                    series={series}
                />
                    }
                    
                </CardBody>
            </Card>
        </React.Fragment>
    )
}

export default RomGraph;