import React from "react";
import { Col, Container, Row } from "reactstrap";
import "react-datepicker/dist/react-datepicker.css";
import './index.scss';

const AlertsSection = () => {


  return (
    <Container fluid>

      <Row>
        <Col lg="12">
          <h2 className="mb-4">Alerts</h2>
          <Row>
            {["Critical Condition", "Caution", "Critical Condition", "Critical Condition"].map((condition, index) => (
              <Col lg="3" md="6" key={index} className="mb-4 text-center">
                <div className="alert-section-wrapper">
                  <h5>DT101</h5>
                  <p>{condition}</p>
                  <p>Latest analysis Date</p>
                </div>
              </Col>
            ))}
          </Row>

        </Col>
      </Row>
    </Container>
  );
};

export default AlertsSection;
