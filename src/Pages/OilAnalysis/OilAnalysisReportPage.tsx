import React, { useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import {  Segmented, Space, Select } from "antd";
import "react-datepicker/dist/react-datepicker.css";
import { FaCogs, FaUser } from "react-icons/fa";
import './index.css';
import AnalysisCard from "Pages/FleetTimeline/components/AnalysisCard";
import DatePicker from "react-datepicker";


import {
  ActiveAnalysis,
  DelayAnalysis,
  DownAnalysis,
  StandByAnalysis,
  oilAnalysisData
} from "./mock";
import {
  FLEET_TIME_STATE_COLOR,
  LAYOUT_MODE_TYPES,
} from "Components/constants/layout";

const OilAnalysisReportPage = (props: any) => {
  document.title = "Oil Analysis Report | FMS Live";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState("Day");
  const [currentShift, setCurrentShift] = useState("Current Shift");

  const [startDate, setStartDate] = React.useState(new Date());
  const [endDate, setEndDate] = React.useState(new Date());
  const [fleetMode, setFleetMode] = useState<string>("CURRENT_SHIFT");

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleShiftChange = (shift: string) => {
    setSelectedShift(shift);
    setDropdownOpen(false);
  };

  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>

          {/* Header Section */}
          <Row className="d-flex justify-content-end align-items-center">
            <Col xs="auto" className="mb-3">
              <Space wrap>
                <Select
                  defaultValue="Day"
                  style={{ width: 120 }}
                  onChange={handleChange}
                  options={[
                    { value: 'Day', label: 'Day' },
                    { value: 'Night', label: 'Night' },
                  ]}
                />
              </Space>
            </Col>
            <Col xs="auto" className="mb-3">
              <Segmented
                className="customSegmentLabel customSegmentBackground"
                value={fleetMode}
                onChange={(e) => setFleetMode(e)}
                options={[
                  { label: "Previous Shift", value: "PREVIOUS_SHIFT" },
                  { label: "Current Shift", value: "CURRENT_SHIFT" },
                ]}
              />
            </Col>
            <Col xs="auto" className="mb-3">
              <div className="d-flex">
                <div className="date-picker-wrapper me-3">
                  <label className="date-label">Select Start Date</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date as Date)}
                    className="date-picker-input"
                    dateFormat="dd/MM/yy"
                  />
                  <span className="calendar-icon">&#128197;</span>
                </div>
                <div className="date-picker-wrapper">
                  <label className="date-label">Select End Date</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date as Date)}
                    className="date-picker-input"
                    dateFormat="dd/MM/yy"
                  />
                  <span className="calendar-icon">&#128197;</span>
                </div>
              </div>
            </Col>
          </Row>

          {/* Machine ID and Operator Name Section */}
          <Row>
            <Col lg="6">
              <div className="machine-info-section">
                <h2 className="section-title">Oil Analysis Report</h2>
                <table className="machine-info-table">
                  <tbody>
                    <tr>
                      <td className="icon-cell">
                        <FaCogs className="info-icon" />
                      </td>
                      <td className="label-cell">
                        <strong>Machine ID</strong>
                      </td>
                      <td className="dashed-line">
                        <span className="dashed-text">nisi consectetur. Arcu pharetra cu</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="icon-cell">
                        <FaUser className="info-icon" />
                      </td>
                      <td className="label-cell">
                        <strong>Operator Name</strong>
                      </td>
                      <td className="dashed-line">
                        <span className="dashed-text">nisi consectetur. Arcu pharetra cu</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Col>
          </Row>

          {/* Main Report Content */}
          <Row>
      <Col lg="12">
        <Card className="oil-analysis-report-card">
          <CardBody>
            <Row>
              <Col lg="12">
                <div className="detailed-analysis-table">
                  <table className="detailed-table">
                    <tbody>
                      {oilAnalysisData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.label}</td>
                          <td>{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </Row>
        </Container>

        <Row className="mt-5">
          <Col xs={6}>
            <AnalysisCard
              title="Detailed Active analysis"
              chartData={ActiveAnalysis}
              color={FLEET_TIME_STATE_COLOR.ACTIVE}
            />
          </Col>
          <Col xs={6}>
            <AnalysisCard
              title="Detailed Active analysis"
              chartData={StandByAnalysis}
              color={FLEET_TIME_STATE_COLOR.STANDBY}
            />
          </Col>
          <Col xs={6}>
            <AnalysisCard
              title="Detailed Active analysis"
              chartData={DownAnalysis}
              color={FLEET_TIME_STATE_COLOR.DOWN}
            />
          </Col>
          <Col xs={6}>
            <AnalysisCard
              title="Detailed Active analysis"
              chartData={DelayAnalysis}
              color={FLEET_TIME_STATE_COLOR.DELAY}
            />
          </Col>
        </Row>
      </div>
    </React.Fragment>
  );
};

export default OilAnalysisReportPage;
