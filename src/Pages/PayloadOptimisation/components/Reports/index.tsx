import React, { useState } from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { Segmented, TabsProps } from "antd";
import './index.scss'
import { Dropdown, DropdownType } from "Components/Common/Dropdown";
import LineChart from "./LineChart";
import TripFilter from "./TripFilter";
const Reports
 = (props: any) => {
    const [displayType, setDisplayType] = useState('HD785');
    
    const onDisplayTypeChange = (displayInfo: string) => {
        setDisplayType(displayInfo);
    };

    const excavator = [
        {
            label: "EX201 (EMU_S04_465_004)",
            value: "EX201",
        },
        {
            label: "EX202 (EMU_S04_465_004)",
            value: "EX202",
        },
        {
            label: "EX203 (EMU_S04_465_004)",
            value: "EX203",
        },
        {
            label: "EX204 (EMU_S04_465_004)",
            value: "EX204",
        },
        {
            label: "EX205 (EMU_S04_465_004)",
            value: "EX205",
        },
    ]
    const [excavators, setExcavator] = useState<DropdownType>({
        label: "",
    });
    const [currentDigger, setCurrentDigger] = useState('')

    const data = [
        { label: 'Best Load', time: '01:35', value: '149t', color: 'green' },
        { label: 'Worst Load', time: '03:35', value: '78t', color: 'red' },
        { label: 'Avg Tonnes', value: '83.4t' },
        { label: 'Total Tonnes', value: '156.43t' },
        { label: 'Avg Time', value: '01:44' },
        { label: 'Total Time', value: '2:34' },
    ];

    const legendData = [
        {
          label: "Swinging",
          color: "#FFFFFF",
        },
        {
          label: "Loading",
          color: "#FAAD14",
        },
    ];

    const Trucks = [
        {
            name : 'DT101',
            type : 'HD785'
        },
        {
            name : 'DT102',
            type : 'HD785'
        },
        {
            name : 'DT103',
            type : 'HD785'
        },
        {
            name : 'DT104',
            type : 'HD785'
        },
        {
            name : 'DT201',
            type : 'HD1500'
        },
        {
            name : 'DT202',
            type : 'HD1500'
        },
        {
            name : 'DT203',
            type : 'HD1500'
        },
        {
            name : 'DT204',
            type : 'HD1500'
        },
    ]

    const tripOptions = ["Trip 1", "Trip 2", "Trip 3", "Trip 4", "Trip 5"];

    return (
        <Row>
            <Card className="p-4">
                <Col lg="12">
                        <div className="payload-optimization-reports"> 
                            <Dropdown
                                label="Choose Excavator"
                                items={excavator}
                                value={excavators}
                                onChange={setExcavator}
                                />
                            <Segmented
                                className="customSegmentLabel customSegmentBackground"
                                value={displayType}
                                onChange={onDisplayTypeChange}
                                options={[
                                { value: "HD785", label: "HD785" },
                                { value: "HD1500", label: "HD1500" },
                                ]}
                            />
                        </div>
                </Col>
                <Col lg="12">
                    <div className="reports-summary-container">
                        <h2>Summary</h2>
                        <Row gutter={[16, 16]} justify="space-between" style={{padding: '0px'}}>
                            {data.map((item, index) => (
                                <Col key={index} xs={12} sm={6} md={4} lg={2}>
                                    <Card className="reports-summary-card" bordered={false}>
                                        <div className="reports-summary-label">{item.label}</div>
                                        <div className="d-flex align-center" style={{alignItems: 'center', justifyContent: 'space-between'}}>
                                            <div className="reports-summary-time" style={{ color: item.color }}>
                                                {item.time && <span>{item.time}</span>}
                                            </div>
                                            <div className="reports-summary-value" style={{ color: item.color, paddingLeft: item.time ? '1rem' : '0' }}>
                                                {item.value}
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </Col>
                <Col lg="12" style={{marginTop: '2rem'}}>
                    <div className="d-flex" style={{justifyContent: 'space-between'}}>
                        <div className="visual-legend-container d-flex">
                            {legendData &&
                            legendData.map((item, index) => (
                                <div
                                key={index}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "left",
                                }}
                                >
                                <span
                                    style={{
                                    height: "8px",
                                    width: "8px",
                                    color: "transparent",
                                    backgroundColor: item.color,
                                    borderRadius: "50%",
                                    fontSize: "1px",
                                    }}
                                ></span>
                                <span className="text-center px-2 legend-label">
                                    {item.label}
                                </span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <TripFilter />
                        </div>
                    </div>
                    <Row style={{marginTop: '2rem'}}>
                        {
                            Trucks.filter(truck => truck.type === displayType).map(truck => {
                                return <Col md={6} xs={12}>
                                            <LineChart truck={truck} />
                                        </Col>
                            })
                        }
                    </Row>
                </Col>
            </Card>
        </Row>
    )
}

export default Reports;