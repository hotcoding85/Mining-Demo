import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";

import Breadcrumb from 'Components/Common/Breadcrumb';
import RomStatus from "./romStatus";
import RomGraph from "./romGraph";
import PitStatus from "./pitStatus";
import { DatePicker, Radio, Segmented, Space } from "antd";
import { shiftTimings } from "utils/common";

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
        } else {
            let prevShiftInfo = shiftTimings(shiftInfo.start.subtract(2, 'hours'));
            setShiftInfo((prevState) => {
                return {
                    ...prevState,
                    ...prevShiftInfo
                }
            })
        }
    }, [timeRange]);

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Ore Tracker" breadcrumbItem="Material Inventory" />
                    <Row className="mb-3">
                        <Col className='d-flex flex-row-reverse'>
                            <Space>
                                {
                                    timeRange == 'CUSTOM' && <RangePicker />
                                }
                                <Segmented className="customSegmentLabel customSegmentBackground" value={timeRange} onChange={(e) => setTimeRange(e)} options={[{ value: 'PREVIOUS_SHIFT', label: 'Previous Shift' }, { value: 'CURRENT_SHIFT', label: 'Current Shift' }]} />
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