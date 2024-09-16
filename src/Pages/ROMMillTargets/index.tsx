import React from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { DatePicker, Select, Button } from "antd";
import { round2Two, roundOff } from "utils/common";
import "./style.scss";
import LoadTarget from "./components/LoadTarget";

const ROMMillTargets = (props: any) => {
  document.title = "Pre Starts | FMS Live";

  const targetTypes = [
    { value: "SHIFT", label: "SHIFT" },
    { value: "DAILY", label: "DAILY" },
    { value: "WEEKLY", label: "WEEKLY" },
    { value: "MONTHLY", label: "MONTHLY" },
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Dynamic Dispatch"
            breadcrumbItem="ROM/Mill Targets"
          />
          <Row className="rommil-targets">
            <Col xs={6} className="d-flex">
              <Col xxl={3} lg={3}>
                <Select
                  className="basic-single"
                  id="Plan By"
                  showSearch
                  allowClear
                  placeholder="Plan By"
                  style={{ width: "94%", color: "#ffff" }}
                />
              </Col>
              <Col xxl={3} lg={3}>
                <DatePicker allowClear={false} style={{ width: "100%" }} />
              </Col>
            </Col>

            <Col xs={6} className="d-flex justify-content-end gap-3">
              <Col xxl={4} lg={4}>
                <Select
                  className="basic-single"
                  id="Select Loading Sequence"
                  showSearch
                  placeholder="Select Loading Sequence"
                  style={{ width: "100%" }}
                  options={targetTypes}
                />
              </Col>
              <Col xxl={3} lg={3}>
                <Button className="schedule-btn w-100">
                  Publish to Production
                </Button>
              </Col>
            </Col>
          </Row>

          <Row className="mb-4 rommil-contents">
            <Col xs={2}>
              <Card className="h-100">
                <CardBody>
                  <Row className="justify-content-between align-content-between h-100">
                    <h4 style={{ color: "#9CA3B1" }} className="coolContainer">
                      Target Tonnes for Shift
                    </h4>
                    <h3 className="mb-0 h-auto" style={{ color: "#389E0D" }}>
                      {`${round2Two(Math.random() * 1000)} t` || 0}
                    </h3>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col xs={2}>
              <Card className="h-100">
                <CardBody>
                  <Row className="justify-content-between align-content-between h-100">
                    <h4 style={{ color: "#9CA3B1" }}>Loads Per Hour</h4>
                    <h3 className="mb-0" style={{ color: "#389E0D" }}>
                      {`${roundOff(Math.random() * 1000)}` || 0}
                    </h3>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col xs={2}>
              <Card className="h-100">
                <CardBody>
                  <Row className="justify-content-between align-content-between h-100">
                    <h4 style={{ color: "#9CA3B1" }}>Grade Control Per Hour</h4>
                    <h3 className="mb-0" style={{ color: "#389E0D" }}>
                      {`${round2Two(Math.random() * 1000)} g/t` || 0}
                    </h3>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col xs={2}>
              <Card className="h-100">
                <CardBody>
                  <Row className="justify-content-between align-content-between h-100">
                    <h4 style={{ color: "#9CA3B1" }}>
                      Average tonnes Per Hour
                    </h4>
                    <h3 className="mb-0" style={{ color: "#389E0D" }}>
                      {`${roundOff(Math.random() * 1000)} t` || 0}
                    </h3>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col xs={2}>
              <Card className="h-100">
                <CardBody>
                  <Row className="justify-content-between align-content-between h-100">
                    <h4 style={{ color: "#9CA3B1" }}>Grade Loading</h4>
                    <h3 className="mb-0" style={{ color: "#389E0D" }}>
                      {`${"GH01 + HG03"}` || 0}
                    </h3>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col xs={2}>
              <Card className="h-100">
                <CardBody>
                  <Row className="justify-content-between align-content-between h-100">
                    <h4 style={{ color: "#9CA3B1" }}>
                      Average Tonnes Per Hour
                    </h4>
                    <h3 className="mb-0" style={{ color: "#389E0D" }}>
                      {`${roundOff(Math.random() * 1000)} t` || 0}
                    </h3>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row className="mt-3 rommil-load-targets">
            <Col lg="12">
              <LoadTarget />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ROMMillTargets;
