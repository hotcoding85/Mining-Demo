import React, { useState } from "react";
import { Col, Container, Row } from "reactstrap";

import Breadcrumb from 'Components/Common/Breadcrumb';
import RomStatus from "./romStatus";
import RomGraph from "./romGraph";
import PitStatus from "./pitStatus";
import { DatePicker, Radio, Segmented, Space } from "antd";

const { RangePicker } = DatePicker;

const MaterialInventory = (props: any) => {
    document.title = "Material Inventory | FMS Live";

    const [timeRange, setTimeRange] = useState('CURRENT_SHIFT');

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
                                <Segmented className="customSegmentLabel customSegmentBackground" value={timeRange} onChange={(e) => setTimeRange(e)} options={[{ value: 'CUSTOM', label: 'Custom' }, { value: 'PREVIOUS_SHIFT', label: 'Previous Shift' }, { value: 'CURRENT_SHIFT', label: 'Current Shift' }]}/>
                            </Space>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <RomGraph graphType={'line'} />
                        </Col>
                        <Col md={6}>
                            <RomGraph graphType={'bar'} />
                        </Col>
                        <Col md={12}>
                            <RomStatus />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <PitStatus />
                        </Col>
                    </Row>

                </Container>
            </div>
        </React.Fragment>
    )
}
export default MaterialInventory;