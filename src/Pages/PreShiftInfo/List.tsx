import React, { useState } from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import { pc2000, pc1250, hd1500, hd785, wa600, placeHolder } from 'assets/images/equipment';
import { round } from 'lodash';
import './index.scss';
import { Badge, Button, DatePicker, Select, Space } from 'antd';
import { round2Two, roundOff } from 'utils/common';
import dayjs from 'dayjs';

const stateConfig = [
    {
        name: 'Active',
        key: 'ACTIVE',
        color: "#009D10"
    },
    {
        name: 'Standby',
        key: 'STANDBY',
        color: "#F7B31A"
    },
    {
        name: 'Delay',
        key: 'DELAY',
        color: "#9143DE"
    },
    {
        name: 'Down',
        key: 'DOWN',
        color: "#ED3A0F"
    }
]


const List = ({ data = [] }: any) => {

    const [selectedCrew, setSelectedCrew] = useState<string>('');
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | string>('');

    const getStateColor = (state) => {
        switch (state) {
            case "ACTIVE":
                return "#009D10";
            case "STANDBY":
                return "#F7B31A";
            case "DELAY":
                return "#9143DE";
            case "DOWN":
                return "#ED3A0F";
            default:
                return "#F7B31A";
        }
    }

    const activeBtn = (ele: any) => {
        if (ele.closest("button").classList.contains("active")) {
            ele.closest("button").classList.remove("active");
        } else {
            ele.closest("button").classList.add("active");
        }
    }

    function containsCaseInsensitive(str: string, substr: string): boolean {
        return str.toLowerCase().includes(substr.toLowerCase());
    }

    const getImage = (category: string) => {
        if (!category) {
            return placeHolder;
        }

        if (containsCaseInsensitive(category, "hd785")) {
            return hd785;
        } else if (containsCaseInsensitive(category, "hd1500")) {
            return hd1500;
        } else if (containsCaseInsensitive(category, "pc1250")) {
            return pc1250;
        } else if (containsCaseInsensitive(category, "pc2000")) {
            return pc2000;
        } else if (containsCaseInsensitive(category, "wa600")) {
            return wa600;
        } else {
            return placeHolder;
        }
    }

    const imageStyle: React.CSSProperties = {
        'width': '56px',
        'height': '56px',
        'maxHeight': '100%',
        'objectFit': 'cover'
    };

    // function getRandomFloat(min: number, max: number, decimalPlaces: number): number {
    //     const factor = Math.pow(10, decimalPlaces);
    //     return Math.round((Math.random() * (max - min) + min) * factor) / factor;
    // }

    // const getStateValue = (stateInfo, key: string) => {
    //     let info = stateInfo.find((info) => info.state === key);
    //     return info ? info.hours : '00:00'
    // }

    return (
        <React.Fragment>
            <Row className='schedule-filter pe-2'>
                <Col xxl={3} lg={3}>
                    <Select
                        className="basic-single"
                        id="Crew"
                        showSearch
                        allowClear
                        placeholder="Crew"
                        style={{ width: '100%', color: "#ffff" }}
                        // value={selectedCrew}
                        // options={getCrews()}
                        // onChange={onCrewChange}
                    />
                </Col>
                <Col xxl={3} lg={3}>
                    <Select
                        className="basic-single"
                        id="Plan By"
                        showSearch
                        allowClear
                        placeholder="Plan By"
                        style={{ width: '100%', color: "#ffff" }}
                        // value={selectedPlan}
                        // options={getPlans()}
                        // onChange={onPlanChange}
                    />
                </Col>
                <Col xxl={3} lg={3}>
                        <DatePicker allowClear={false}
                            style={{ width: '100%'}}
                            // value={dayjs(selectedDate)}
                            // onChange={onDateChange}
                        />
                </Col>
                <Col xxl={3} lg={3}>
                    <Button className='schedule-btn w-100'>Schedule Shift</Button>
                </Col>
            </Row>


            {data.map((item: any, key: number) => (
                <Row className="row d-flex pre-shift mb-4">
                    <>
                        <Col className="col-lg-3 col-md-6 position-relative pre-shift-lft" key={key}>
                            <Card className="rounded-3 mb-0 h-100">
                                <CardBody className="p-3">
                                    <div className="d-flex align-start gap-3 mb-3">
                                        <div className="text-center">
                                            <img src={getImage(item.model)} alt="" style={imageStyle} />
                                        </div>
                                        <div className="flex-grow-1 card-body__header">
                                            <h4 className='fs-3'>
                                                {item.name}
                                            </h4>
                                            <h6>
                                                {item?.data?.operator || 'No Operator'}
                                            </h6>
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column gap-3 mb-4 w-100">
                                        <p className="d-flex gap-3 justify-content-between mb-0">
                                            <span className="shift-label">Operator</span>
                                            <div className='d-flex flex-column gap-2'>
                                                <span className="shift-value">Unassigned</span>
                                            </div>
                                        </p>
                                        <p className="d-flex gap-3 justify-content-between mb-0">
                                            <span className="shift-label">Trainers</span>
                                            <div className='d-flex flex-column gap-2'>
                                                <span className="shift-value fill">R. Carson</span>
                                                <span className="shift-value">Unassigned</span>
                                            </div>
                                        </p>
                                        <p className="d-flex gap-3 justify-content-between mb-0">
                                            <span className="shift-label">Location</span>
                                            <div className='d-flex flex-column gap-2'>
                                                <span className="shift-value fill">440_BLK1_HG02</span>
                                            </div>
                                        </p>
                                        <p className="d-flex gap-3 justify-content-between mb-0">
                                            <span className="shift-label">ETA Start</span>
                                            <span className="shift-time">00:00</span>
                                        </p>
                                        <p className="d-flex gap-3 justify-content-between mb-0">
                                            <span className="shift-label">ETA End</span>
                                            <span className="shift-time">00:00</span>
                                        </p>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col className="col-lg-9 col-md-6">
                            <div className='position-relative d-flex flex-wrap justify-content-start gap-4 ps-4 w-100 shift-line'>
                                <div className='assign-box assign-arrow p-3 pre-shift-data'>
                                    <Card className="rounded-3 mb-0 h-100">
                                        <CardBody className="p-3">
                                            <div className="d-flex align-start gap-3 mb-3">
                                                <div className="text-center">
                                                    <img src={getImage(item.truckModel)} alt="" style={imageStyle} />
                                                </div>
                                                <div className="flex-grow-1 card-body__header">
                                                    <h4 className='fs-3'>
                                                        {item.assignTruck}
                                                    </h4>
                                                    <h6>
                                                        {item?.data?.operator || 'No Operator'}
                                                    </h6>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column gap-3 mb-4 w-100">
                                                <p className="d-flex gap-3 justify-content-between mb-0">
                                                    <span className="shift-label">Operator</span>
                                                    <div className='d-flex flex-column gap-2'>
                                                        <span className="shift-value">Unassigned</span>
                                                    </div>
                                                </p>
                                                <p className="d-flex gap-3 justify-content-between mb-0">
                                                    <span className="shift-label">Allocation</span>
                                                    <div>EX201</div>
                                                </p>
                                                <p className="d-flex gap-3 justify-content-between mb-0">
                                                    <span className="shift-label">Planned Loads</span>
                                                    <span className="shift-time">0</span>
                                                </p>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>
                                <div className='assign-box assign-arrow p-3'>
                                    + Assign dozer here
                                </div>
                                <div className='assign-box assign-arrow p-3'>
                                    + Assign truck here
                                </div>
                                <div className='assign-box assign-arrow p-3'>
                                    + Assign dozer here
                                </div>
                                <div className='assign-box assign-arrow p-3'>
                                    + Assign truck here
                                </div>
                                <div className='assign-box assign-arrow p-3'>
                                    + Assign dozer here
                                </div>
                            </div>
                        </Col>
                    </>
                </Row>
            ))}
        </React.Fragment>
    );
}

export default List;