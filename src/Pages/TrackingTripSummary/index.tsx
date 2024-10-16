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
import Breadcrumb from 'Components/Common/Breadcrumb';
import "./style.css";
import { TripProgressBar } from "./components/TripProgressBar";
import { BarGraph } from "../../Components/Charts/BarChart";
import { PieChart } from "../../Components/Charts/PieChart";
import { TextColor } from "../../Components/Charts/interfaces/general";
import PerformanceHeader from "./components/PerformanceHeader";
import { Card, CardTitle, Col, Container, Row } from "reactstrap";
import React, { useCallback, useEffect, useState } from "react";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { TruckFilled } from "@ant-design/icons";
import { TotalplanVSActualplan, TripSummary, TruckingExecutionPlan } from './components'
import ReactApexChart from "react-apexcharts";
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

    const [currentDate, setCurrentData]  = useState<Dayjs>(dayjs(new Date()))
    const [formattedDate, setFormattedDate] = useState<string>('')

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
                        <Col md={4} xs={12} className="d-flex" style={{justifyContent: 'flex-end'}}>
                            <DatePicker allowClear={false} value={currentDate} onChange={onCurrentDateChange} />
                        </Col>
                    </Row>
                    <Row style={{marginTop: '1rem'}}>
                        <Col md={6} xs={12}>
                            <Card className="trucking-trip-summary-cards d-flex waste-material-movement">
                                <h6>Waste Material Movement</h6>
                                <span>
                                    <span className="font-color-green">91%</span>
                                    <span>Completion Rate</span>
                                </span>
                                <TruckFilled className="truck-icon-green" size={24} color="green" />
                                <GaugeChart 
                                    total={150000}
                                    value={135855}
                                    color="#389E0D"
                                    bgColor="grey"
                                    />
                                <span className="gaugechart-subtext">out of 150,000t</span>
                            </Card>
                        </Col>
                        <Col md={6} xs={12}>
                            <Card className="trucking-trip-summary-cards d-flex total-rom-ore">
                                <h6>Total ROM Ore</h6>
                                <span>
                                    <span className="font-color-red">10%</span>
                                    <span>Completion Rate</span>
                                </span>
                                <TruckFilled className="truck-icon-red" size={24} color="red" />
                                <GaugeChart 
                                    total={150000}
                                    value={135855}
                                    color="#ff3f3f"
                                    bgColor="grey"
                                    />
                                <span className="gaugechart-subtext">out of 150,000t</span>
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
