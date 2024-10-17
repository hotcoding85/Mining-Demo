import ChartDataLabels from "chartjs-plugin-datalabels";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import "./style.css";
import { Card, Col, Container, Row } from "reactstrap";
import React, { useCallback, useEffect, useState } from "react";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { TruckFilled } from "@ant-design/icons";
import { TotalplanVSActualplan, TripSummary, TruckingExecutionPlan } from './components'
import GaugeChart from "./components/GaugeChart";
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels,
    ArcElement
);

const TruckingTripSummary = () => {
    document.title = "Trucking Trip Summary | FMS Live";

    const [currentDate, setCurrentData] = useState<Dayjs>(dayjs(new Date()))
    const [formattedDate, setFormattedDate] = useState<string>('')
    const [totalWaste, setTotalWaste] = useState(65000)
    const [currentWaste, setCurrentWaste] = useState(35345)
    const [totalOre, setTotalOre] = useState(5000)
    const [currentOre, setCurrentOre] = useState(3643)

    useEffect(() => {
        const dateObj = new Date(currentDate.toString());  // Create Date object from string

        // Format the date to "October 16, 2024"
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        setFormattedDate(dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))
    }, [currentDate])

    const onCurrentDateChange = useCallback((date: Dayjs) => {
        setCurrentData(date)
    }, [currentDate])

    return (
        <React.Fragment>
            <div className="page-content roster-scheduler">
                <Container fluid>
                    {/* <Breadcrumb title="Production" breadcrumbItem="Trucking Truck Summary" />   */}
                    <Row>
                        <Col md={8} xs={12}>
                            <h3>
                                Trucking Performance for {formattedDate}
                            </h3>
                        </Col>
                        <Col md={4} xs={12} className="d-flex" style={{ justifyContent: 'flex-end' }}>
                            <DatePicker allowClear={false} value={currentDate} onChange={onCurrentDateChange} />
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '1rem' }}>
                        <Col md={6} xs={12}>
                            <Card className="trucking-trip-summary-cards d-flex waste-material-movement">
                                <div className="trucking-trip-material-title">Waste Material Movement</div>
                                <span className="trucking-trip-material-info">
                                    <span className="font-color-green">{Math.round(currentWaste/totalWaste * 100)}%</span>
                                    <span className="ms-1">Completion Rate</span>
                                </span>
                                <div className="d-flex flex-column align-items-center mt-3">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M29.9 17.7C29.9 17.6 29.9 17.6 29.9 17.7C29.8 17.6 29.8 17.5 29.8 17.5L25.8 11.5C25.6 11.2 25.3 11 25 11H21V9.8L26.2 9C26.6 8.9 27 8.5 27 8V6C27 5.4 26.6 5 26 5H17C16.6 5 16.3 5.2 16.1 5.6L13.4 11H3C2.4 11 2 11.4 2 12V17C2 17.3 2.1 17.5 2.3 17.7L5 20.4C3.2 21.2 2 23 2 25C2 27.8 4.2 30 7 30C9.8 30 12 27.8 12 25C12 24.7 12 24.3 11.9 24H16.1C16 24.3 16 24.7 16 25C16 27.8 18.2 30 21 30C23.8 30 26 27.8 26 25H29C29.6 25 30 24.6 30 24V18C30 17.9 30 17.8 29.9 17.7ZM21 13H24.5L27.2 17H26.3C25.3 17 24.4 16.4 24 15.6C23.7 15.2 23.4 15 23 15H21V13ZM7 28C5.3 28 4 26.7 4 25C4 23.3 5.3 22 7 22C8.7 22 10 23.3 10 25C10 26.7 8.7 28 7 28ZM17 18H7C6.4 18 6 17.6 6 17C6 16.4 6.4 16 7 16H17C17.6 16 18 16.4 18 17C18 17.6 17.6 18 17 18ZM21 28C19.3 28 18 26.7 18 25C18 23.3 19.3 22 21 22C22.7 22 24 23.3 24 25C24 26.7 22.7 28 21 28Z" fill="#73d13d" />
                                    </svg>

                                    <GaugeChart
                                        total={totalWaste}
                                        value={currentWaste}
                                        color="#389E0D"
                                        bgColor="grey"
                                    />
                                    <span className="gaugechart-subtext">out of {totalWaste}t</span>
                                </div>

                            </Card>
                        </Col>
                        <Col md={6} xs={12}>
                            <Card className="trucking-trip-summary-cards d-flex total-rom-ore">
                                <div className="trucking-trip-material-title">ORE Material Movement</div>
                                <span className="trucking-trip-material-info">
                                    <span className="font-color-red">{Math.round(currentOre/totalOre * 100)}%</span>
                                    <span className="ms-1">Completion Rate</span>
                                </span>
                                <div className="d-flex flex-column align-items-center mt-3">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M29.9 17.7C29.9 17.6 29.9 17.6 29.9 17.7C29.8 17.6 29.8 17.5 29.8 17.5L25.8 11.5C25.6 11.2 25.3 11 25 11H21V9.8L26.2 9C26.6 8.9 27 8.5 27 8V6C27 5.4 26.6 5 26 5H17C16.6 5 16.3 5.2 16.1 5.6L13.4 11H3C2.4 11 2 11.4 2 12V17C2 17.3 2.1 17.5 2.3 17.7L5 20.4C3.2 21.2 2 23 2 25C2 27.8 4.2 30 7 30C9.8 30 12 27.8 12 25C12 24.7 12 24.3 11.9 24H16.1C16 24.3 16 24.7 16 25C16 27.8 18.2 30 21 30C23.8 30 26 27.8 26 25H29C29.6 25 30 24.6 30 24V18C30 17.9 30 17.8 29.9 17.7ZM21 13H24.5L27.2 17H26.3C25.3 17 24.4 16.4 24 15.6C23.7 15.2 23.4 15 23 15H21V13ZM7 28C5.3 28 4 26.7 4 25C4 23.3 5.3 22 7 22C8.7 22 10 23.3 10 25C10 26.7 8.7 28 7 28ZM17 18H7C6.4 18 6 17.6 6 17C6 16.4 6.4 16 7 16H17C17.6 16 18 16.4 18 17C18 17.6 17.6 18 17 18ZM21 28C19.3 28 18 26.7 18 25C18 23.3 19.3 22 21 22C22.7 22 24 23.3 24 25C24 26.7 22.7 28 21 28Z" fill="#FF4D4F" />
                                    </svg>
                                    <GaugeChart
                                        total={totalOre}
                                        value={currentOre}
                                        color="#ff3f3f"
                                        bgColor="grey"
                                    />
                                    <span className="gaugechart-subtext">out of {totalOre}t</span>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Col md={12}>
                        <TotalplanVSActualplan />
                    </Col>

                    <Col md={12}>
                        <TripSummary />
                    </Col>

                    <Col md={12}>
                        <TruckingExecutionPlan />
                    </Col>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default TruckingTripSummary;
