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

    const groupedTrucks = props.trucks.reduce((acc: { [key: string]: any[] }, truck: any) => {
        if (!acc[truck.id]) {
            acc[truck.id] = [];
        }
        acc[truck.id].push(truck);
        return acc;
    }, {});

    return (
        <Row style={{marginLeft: 0, marginRight: 0}}>
            <Card className="p-4">
                <Col lg="12">
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
                        <div className="d-flex">
                            {/* <Segmented
                                className="customSegmentLabel customSegmentBackground"
                                value={displayType}
                                style={{marginLeft: '1rem'}}
                                onChange={onDisplayTypeChange}
                                options={[
                                { value: "HD785", label: "HD785" },
                                { value: "HD1500", label: "HD1500" },
                                ]}
                            /> */}
                            <TripFilter />
                        </div>
                    </div>
                    <Row style={{marginTop: '2rem'}}>
                        {
                            [...new Map(props.trucks.filter(truck => truck.excavator === props.excavator.value).map(truck => [truck.id, truck])).values()]
                                .map((truck: any) => {
                                    return (
                                        <Col md={6} xs={12} key={truck.id}>
                                            <LineChart truck={truck} />
                                        </Col>
                                    );
                                })
                        }

                    </Row>
                </Col>
            </Card>
        </Row>
    )
}

export default Reports;