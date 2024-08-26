import React, { useEffect } from "react"
import Chart from "react-apexcharts";
import { ApexOptions } from 'apexcharts';
import { Card, CardBody, CardTitle } from "reactstrap";
import dayjs from "dayjs";
import { groupBy, round } from "lodash";
import { getTonnesMoved } from 'slices/thunk';
import { format } from 'date-fns';
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import _ from "lodash";
import { shifts } from "utils/common";


const data = [
    {
        "hour": 13,
        "payload": 484.91
    },
    {
        "hour": 12,
        "payload": 164.19
    }
]

const TonnesGraph = () => {

    const dispatch: any = useDispatch();

    const options: ApexOptions = {
        dataLabels: { enabled: !1 },
        stroke: { width: 2 },
        markers: { size: 1 },
        xaxis: {
            type: "datetime",
        },
        tooltip: { x: { format: "hh" } },
        colors: ['#F4FF36'],
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.6,
                opacityTo: 0.05,
                stops: [42, 100, 100, 100],
            },
        },
    }

    const tonnesMovedProperties = createSelector(
        (state: any) => state.Fleet,
        (fleetState) => ({
            tonnesMoved: fleetState.data
        })
    );

    const { tonnesMoved } = useSelector(tonnesMovedProperties);

    useEffect(() => {
        let { shift, shiftDate } = getShiftTimings();
        dispatch(getTonnesMoved(shiftDate + ':' + shift)); // ShiftRosters action to fetch data on component mount
    }, [dispatch]);

    const getData = () => {
        let data = _.filter(tonnesMoved, (data) => { return data.payload != null });
        return data;
    }

    const getShiftTimings = () => {
        let currentTime = dayjs();
        let previousDay = dayjs().subtract(1, 'day');
        let shifTimings;
        for (let i = 0; i < shifts.length; i++) {
            let shift = shifts[i];
            let startTime = shift.startTime.split(":");
            let start = dayjs().set('hour', parseInt(startTime[0])).set('minute', parseInt(startTime[1]));
            let startPrev = previousDay.set('hour', parseInt(startTime[0])).set('minute', parseInt(startTime[1]));

            let endTime = shift.endTime.split(":");
            let end = dayjs().add(shift.startTime > shift.endTime ? 1 : 0, 'day').set('hour', parseInt(endTime[0])).set('minute', parseInt(endTime[1]));
            let endPrev = previousDay.add(shift.startTime > shift.endTime ? 1 : 0, 'day').set('hour', parseInt(endTime[0])).set('minute', parseInt(endTime[1]));

            if ((currentTime.isSame(start) || currentTime.isAfter(start)) && (currentTime.isBefore(end) || currentTime.isSame(end))) {
                shifTimings = { start, end, shift: shift.value, shiftDate: start.format('YYYY-MM-DD') };
                break;
            }
            if ((currentTime.isSame(startPrev) || currentTime.isAfter(startPrev)) && (currentTime.isBefore(endPrev) || currentTime.isSame(endPrev))) {
                shifTimings = { start: startPrev, end: endPrev, shift: shift.value, shiftDate: startPrev.format('YYYY-MM-DD') };
                break;
            }
        }

        return shifTimings;
    }

    const getGraphData = () => {
        const graphData: any = [];
        const groupData = groupBy(getData(), 'hour');
        let cummulative = 0;
        let { start, end } = getShiftTimings();
        while (start.isBefore(end) || start.isSame(end)) {
            if (groupData[start.hour()]) {
                cummulative = round(cummulative + groupData[start.hour()][0].payload, 2);
                graphData.push([new Date(start.year(), start.month(), start.date(), start.hour(), start.minute(), start.second()).getTime(), cummulative]);
            } else {
                graphData.push([new Date(start.year(), start.month(), start.date(), start.hour(), start.minute(), start.second()).getTime(), cummulative]);
            }

            start = start.add(1, 'hour');
        }

        return graphData;
    }

    const series: any = [
        {
            name: "Payload",
            data: getGraphData()
        }
    ];

    return (
        <React.Fragment>
            <Card style={{ minHeight: '520px' }}>
                <CardBody>
                    <CardTitle tag="h4" className="mb-3">Tonnes moved</CardTitle>
                    <Chart
                        options={options}
                        series={series}
                        type="area"
                    />
                </CardBody>
            </Card>
        </React.Fragment>
    )
}
export default TonnesGraph