import { max } from 'lodash';
import React from 'react';
import Chart from 'react-apexcharts';

const LineChart = (props) => {
    const chartOptions: any = {
        chart: {
            type: 'line',
            toolbar: { show: false },
            background: 'transparent', // Set background color to transparent
        },
        grid: {
            borderColor: 'grey',
            xaxis: {
                lines: { show: true }
            },
            yaxis: {
                lines: { show: true }
            },
        },
        xaxis: {
            categories: ['Pass 1', 'Pass 2', 'Pass 3', 'Pass 4', 'Pass 5', 'Pass 6', 'Pass 7', 'Pass 8', 'Pass 9'],
            min: 1,
            tickAmount: 9,
            max: 9, // Represents 05:30 in seconds (5 * 60 + 30)
            
            labels: {
                style: {
                    colors: '#FFFFFF', // Optional: Customize label color for better visibility
                }
            },
        },
        yaxis: {
            opposite: true, // Position the axis on the right side
            labels: {
                formatter: (value: number) => {
                    const minutes = Math.floor(value / 60);
                    const seconds = value % 60;
                    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
            },
            min: 0,
            tickAmount: 11,
            max: 330, // Represents 05:30 in seconds (5 * 60 + 30)
        },
        markers: {
            size: 3,
            hover: {
                size: 4
            }
        },
        stroke: {
            width: 2
        },
        tooltip: {
            theme: 'light',
            x: { show: true,
                formatter: (value: number) => {
                    return `Pass ${value} - ${props.truck.id}`;
                }
            },
            y: {
                formatter: (value: number) => {
                    const minutes = Math.floor(value / 60);
                    const seconds = value % 60;
                    return `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        colors: ['#f0ad4e', '#4caf50', '#e74c3c'], // Colors for different series
    };

    const series = [
        {
            name: 'Trip 1',
            data: [60, 80, 100, 120, 140, 160, 180] // Time in seconds
        },
        {
            name: 'Trip 2',
            data: [50, 70, 90, 110, 130] // Another set of data for comparison
        },
        {
            name: 'Trip 3',
            data: [15, 32, 56, 89, 110, 126] // Another set of data for comparison
        }
    ];

    return (
        <div style={{ padding: '20px',  borderRadius: '8px' }}>
            <h3>{props.truck.id + `(${props.truck.model})`}</h3>
            <Chart options={chartOptions} series={series} type="line" height={320} />
        </div>
    );
};

export default LineChart;
