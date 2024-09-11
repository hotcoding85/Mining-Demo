import React, { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from 'apexcharts';
import { Card, CardBody, CardTitle } from "reactstrap";
import { getMaterialMoved } from "Helpers/api_materials_helper";
import { chain, groupBy, round } from "lodash";
import { shiftTimingsByDateandShift } from "utils/common";

const RomGraph = ({ graphType, shiftDate, shift, title, yaxisTitle, graphData }) => {

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
                    columnWidth: "100%",
                    endingShape: "rounded",
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 2
            },
            colors: ['#FFB629', '#D99A21', '#B07C18', '#936714', '#7C5710', '#62440C', '#62660C', 'gray'],
            xaxis: {
                categories: hours.map((hour: any) => hour.minute.toString()),
                labels: { show: false }
            },
            yaxis: {
                title: {
                    text: yaxisTitle,
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
                        return val + " " + yaxisTitle;
                    },
                }
            }
        }
    }, [hours])

    useEffect(() => {
        // getMaterialMoved(`${shiftDate}:${shift}`)
        //     // getMaterialMoved("2024-08-05:NS")
        //     .then((response) => {
        //         response.data = [{
        //             hour: 20,
        //             name: "HG01",
        //             payload: 80.31
        //         }, {
        //             hour: 23,
        //             name: "HG02",
        //             payload: 60.31
        //         }]
        formatGraphData(graphData);
        // })
        // .catch((error) => {
        //     console.error(error);
        // })
    }, [shiftDate, shift]);


    const formatGraphData = (data) => {
        let hours: any = [];
        let { start, end } = shiftTimingsByDateandShift(shiftDate, shift);
        while (start.isBefore(end) || start.isSame(end)) {
            hours.push({
                date: new Date(start.year(), start.month(), start.date(), start.hour(), start.minute(), start.second()).getTime(),
                minute: `${start.hour() < 10 ? '0' + start.hour() : start.hour()}:${start.minute() < 10 ? '0' + start.minute() : start.minute()}`
            })
            start = start.add(1, 'minute');
        }

        let graphData: any = [];
        let names = chain(data).map((item) => item.name).uniq().sortBy((x) => x.toLowerCase()).value();
        let groupData = groupBy(data, 'name');
        for (let name of names) {
            let groupHourData = groupBy(groupData[name], 'hour');
            let hourData: any = [];
            for (let hour of hours) {
                hourData.push(groupHourData[hour.minute] ? round(groupHourData[hour.minute][0].payload, 2) : 0);
            }

            graphData.push({
                name: name,
                data: hourData
            })
        }

        setHours(hours);
        setData(graphData);
    }


    return (
        <React.Fragment>
            <Card style={{ minHeight: '511px' }}>
                <CardBody>
                    <CardTitle className="h4">{title ? title : 'Tonnes moved per hour'}</CardTitle>
                    {
                        graphType == 'bar' ? <Chart
                            options={options}
                            series={data}
                            type="bar"
                        /> : <Chart
                            options={options}
                            series={data}
                        />
                    }

                </CardBody>
            </Card>
        </React.Fragment>
    )
}

export default RomGraph;