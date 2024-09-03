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

const { RangePicker } = DatePicker;

const MaterialInventory = () => {
    document.title = "Material Inventory | FMS Live";

    const [timeRange, setTimeRange] = useState('CURRENT_SHIFT');
    const [shiftInfo, setShiftInfo] = useState(shiftTimings());

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
                    <Breadcrumb title="Ore Tracker" breadcrumbItem="Material Inventory" />
                    <Row className="mb-3">
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
                    </Row>
                    <Row>
                        <Col md={6}>
                            <RomGraph
                                graphType={'line'}
                                // shiftDate={"2024-08-05"}
                                // shift={"DS"}
                                shiftDate={shiftInfo.shiftDate}
                                shift={shiftInfo.shift}
                            />
                        </Col>
                        <Col md={6}>
                            <RomGraph
                                graphType={'bar'}
                                // shiftDate={"2024-08-05"}
                                // shift={"DS"}
                                shiftDate={shiftInfo.shiftDate}
                                shift={shiftInfo.shift}
                            />
                        </Col>
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
                    </Row>

                </Container>
            </div>
        </React.Fragment>
    )
}
export default MaterialInventory;