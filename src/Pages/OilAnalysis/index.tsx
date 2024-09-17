import React from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import AlertsSection from "./AlertsSection";
import DatePicker from "react-datepicker";

import OilAnalysisTable from "./OilAnalysisTable";

const OilAnalysis = (props: any) => {
  document.title = "Oil Analysis | FMS Live";
  const [startDate, setStartDate] = React.useState(new Date());
  const [endDate, setEndDate] = React.useState(new Date());

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Maintenance" breadcrumbItem="Oil Analysis" />
          <Row className="justify-content-end">
            <Col lg="2" md="3" className="mb-3">
              <div className="date-picker-wrapper">
                <label className="date-label">Select Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date as Date)}
                  className="date-picker-input"
                  dateFormat="dd/MM/yy"
                />
                <span className="calendar-icon">&#128197;</span>
              </div>
            </Col>
            <Col lg="2" md="3" className="mb-3">
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
            </Col>
          </Row>
          <Row>
            <Col lg="12">
              <h2 className="text-center mb-4 summary-heading">Summary</h2>
              <Row className="justify-content-center">
                <Col lg="4" md="6" className="mb-4">
                  <Card className="text-center">
                    <CardBody>
                      <h5>Total Machines</h5>
                      <h2>50</h2>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="4" md="6" className="mb-4">
                  <Card className="text-center">
                    <CardBody>
                      <h5>Critical Machines</h5>
                      <h2>5</h2>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="4" md="6" className="mb-4">
                  <Card className="text-center">
                    <CardBody>
                      <h5>Scheduled Maintenance</h5>
                      <h2>15</h2>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
        <AlertsSection/>
        <OilAnalysisTable />
      </div>
    </React.Fragment>
  );
};

export default OilAnalysis;
