import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";

import Breadcrumb from 'Components/Common/Breadcrumb';
import RomStatus from "./romStatus";
import RomGraph from "./romGraph";
import PitStatus from "./pitStatus";
import { DatePicker, Radio, Segmented, Space } from "antd";
import { shiftTimings, shiftTimingsByDateandShift, shifts, shiftsInFormat } from "utils/common";
import { ShiftTimingsInfo } from "Models/Shift";
import { Dayjs } from "dayjs";
import romTonnesData from './romTonnesData.json';
import { useDispatch } from "react-redux";

const TelemetryDetails = () => {
    document.title = "Telemetry Details | FMS Live";

    const dispatch: any = useDispatch();

    const [timeRange, setTimeRange] = useState('CURRENT_SHIFT');
    const [shiftInfo, setShiftInfo] = useState(shiftTimings());

    const query: any = new URLSearchParams(window.location.search);
    const [data, setData] = useState<any>(JSON.parse(JSON.stringify(romTonnesData).replaceAll('EX201', query.get('id'))));
    console.log(query.get('id'));

    useEffect(() => {
        if (timeRange === 'CURRENT_SHIFT') {
            let currentShiftInfo = shiftTimings();
            setShiftInfo((prevState) => {
                return {
                    ...prevState,
                    ...currentShiftInfo
                }
            })
        } else if (timeRange === 'PREVIOUS_SHIFT') {
            let prevShiftInfo = shiftTimings(shiftInfo.start.subtract(2, 'hours'));
            setShiftInfo((prevState) => {
                return {
                    ...prevState,
                    ...prevShiftInfo
                }
            })
        }
    }, [timeRange]);

    useEffect(() => {
        // const stringData = JSON.parse(JSON.stringify(romTonnesData).replaceAll('EX201', query.get('id')));
        // setData((prevData) => {
        //     return JSON.parse(stringData);
        // });
    }, [dispatch])

    const onShiftDateChange = (date: Dayjs): void => {
        const newShiftTimings: ShiftTimingsInfo = shiftTimingsByDateandShift(date.format('YYYY-MM-DD'), shiftInfo.shift);
        setShiftInfo((prevState: ShiftTimingsInfo) => {
            return {
                ...prevState,
                ...newShiftTimings
            }
        })
    }

    const onShiftChange = (shift: string): void => {
        const newShiftTimings: ShiftTimingsInfo = shiftTimingsByDateandShift(shiftInfo.shiftDate, shift);
        setShiftInfo((prevState: ShiftTimingsInfo) => {
            return {
                ...prevState,
                ...newShiftTimings
            }
        })
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Telemetry Report" breadcrumbItem="Telemetry Details" link="/telemetry-report" />
                    {/* <Row className="mb-3">
                        <Col className='d-flex flex-row-reverse'>
                            <Space>
                                {
                                    timeRange == 'CUSTOM' &&
                                    <>
                                        <DatePicker allowClear={false} value={shiftInfo.start} onChange={onShiftDateChange} />
                                        <Segmented className="customSegmentLabel customSegmentBackground" value={shiftInfo.shift} onChange={onShiftChange} options={shiftsInFormat(shifts)} />
                                    </>
                                }
                                <Segmented className="customSegmentLabel customSegmentBackground" value={timeRange} onChange={(e) => setTimeRange(e)} options={[{ value: 'CUSTOM', label: 'Custom' }, { value: 'PREVIOUS_SHIFT', label: 'Previous Shift' }, { value: 'CURRENT_SHIFT', label: 'Current Shift' }]} />
                            </Space>
                        </Col>
                    </Row> */}
                    <Row>
                        <Col md={6}>
                            <RomGraph
                                graphType={'line'}
                                // shiftDate={"2024-08-05"}
                                // shift={"DS"}
                                shiftDate={shiftInfo.shiftDate}
                                shift={shiftInfo.shift}
                                title={'Payload'}
                                yaxisTitle={'Tonnes'}
                                graphData={data ? data!.romsPayloadData : []}
                            />
                        </Col>
                        <Col md={6}>
                            <RomGraph
                                graphType={'line'}
                                // shiftDate={"2024-08-05"}
                                // shift={"DS"}
                                shiftDate={shiftInfo.shiftDate}
                                shift={shiftInfo.shift}
                                title={'Wheel Speed'}
                                yaxisTitle={'KMPH'}
                                graphData={data ? data!.romsWheelSpeedData : []}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <RomGraph
                                graphType={'line'}
                                // shiftDate={"2024-08-05"}
                                // shift={"DS"}
                                shiftDate={shiftInfo.shiftDate}
                                shift={shiftInfo.shift}
                                title={'Engine RPM'}
                                yaxisTitle={'RPM'}
                                graphData={data ? data!.romsEngineRPMData : []}
                            />
                        </Col>
                        <Col md={6}>
                            <RomGraph
                                graphType={'line'}
                                // shiftDate={"2024-08-05"}
                                // shift={"DS"}
                                shiftDate={shiftInfo.shiftDate}
                                shift={shiftInfo.shift}
                                title={'Engine Hours'}
                                yaxisTitle={'Hours'}
                                graphData={data ? data!.romsEngineHrsData : []}
                            />
                        </Col>
                    </Row>
                    {/* <Row>
                        <Col md={12}>
                            <RomStatus
                                shiftDate={shiftInfo.shiftDate}
                                shift={shiftInfo.shift}
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <PitStatus
                                shiftDate={shiftInfo.shiftDate}
                                shift={shiftInfo.shift}
                            />
                        </Col>
                    </Row> */}

                </Container>
            </div>
        </React.Fragment>
    )
}
export default TelemetryDetails;