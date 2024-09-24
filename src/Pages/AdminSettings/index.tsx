import React, { useState } from "react";
import { Typography, Input, Row, Col, Select, Button } from "antd";
import { Container } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { SearchOutlined } from "@ant-design/icons";
import "./index.css";

const { Title } = Typography;
const { Option } = Select;

const AdminSettings = (props: any) => {
  document.title = "Admin Settings | FMS Live";

  const [standbyRows, setStandbyRows] = useState([{ code: "", description: "", vehicleType: "" }]);
  const [delayRows, setDelayRows] = useState([{ code: "", description: "", vehicleType: "" }]);
  const [downRows, setDownRows] = useState([{ code: "", description: "", vehicleType: "" }]);

  const handleInputChange = (rows, setRows, index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);

    if (index === rows.length - 1 && rows[index].code && rows[index].description && rows[index].vehicleType) {
      setRows([...rows, { code: "", description: "", vehicleType: "" }]);
    }
  };

  const removeEmptyRows = (rows) => {
    return rows.filter(row => row.code || row.description || row.vehicleType);
  };

  const validateRows = (rows) => {
    for (const row of rows) {
      const { code, description, vehicleType } = row;
      if ((code && (!description || !vehicleType)) ||
          (description && (!code || !vehicleType)) ||
          (vehicleType && (!code || !description))) {
        return false;
      }
    }
    return true;
  };

  const handlePublish = () => {
    console.log("Attempting to publish...");

    const filteredStandbyRows = removeEmptyRows(standbyRows);
    const filteredDelayRows = removeEmptyRows(delayRows);
    const filteredDownRows = removeEmptyRows(downRows);

    console.log("Filtered Standby Rows:", filteredStandbyRows);
    console.log("Filtered Delay Rows:", filteredDelayRows);
    console.log("Filtered Down Rows:", filteredDownRows);

    if (!validateRows(filteredStandbyRows)) {
      console.log("Validation failed for Standby Reasons. Please fill all columns for any entered row.");
      return;
    }

    if (!validateRows(filteredDelayRows)) {
      console.log("Validation failed for Delay Reasons. Please fill all columns for any entered row.");
      return;
    }

    if (!validateRows(filteredDownRows)) {
      console.log("Validation failed for Down Reasons. Please fill all columns for any entered row.");
      return;
    }

    console.log("Publishing Standby Reasons Data:", filteredStandbyRows);
    console.log("Publishing Delay Reasons Data:", filteredDelayRows);
    console.log("Publishing Down Reasons Data:", filteredDownRows);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Admin Settings" breadcrumbItem="Admin Settings" />
        </Container>

        <Row>
          <Col span={24}>
            <div style={{ padding: "16px" }}>
              <Title level={4} style={{ color: "white", marginBottom: 0 }} className="state-reason-title">
                State Reasons
              </Title>
              <div
                style={{
                  borderBottom: "2px solid white",
                  width: "130px",
                  margin: "8px 0",
                }}
              />
              {/* Publish Button */}
              <Button type="primary" onClick={handlePublish}>
                Publish
              </Button>
            </div>
          </Col>
        </Row>

        {/* Standby Reasons Section */}
        <ReasonSection
          title="STANDBY REASONS"
          rows={standbyRows}
          setRows={setStandbyRows}
          handleInputChange={handleInputChange}
        />

        {/* Delay Reasons Section */}
        <ReasonSection
          title="DELAY REASONS"
          rows={delayRows}
          setRows={setDelayRows}
          handleInputChange={handleInputChange}
        />

        {/* Down Reasons Section */}
        <ReasonSection
          title="DOWN REASONS"
          rows={downRows}
          setRows={setDownRows}
          handleInputChange={handleInputChange}
        />
      </div>
    </React.Fragment>
  );
};

// Component for each reason section
const ReasonSection = ({ title, rows, setRows, handleInputChange }) => (
  <>
    <Row
      style={{
        padding: "10px 20px",
        marginTop: "16px",
        backgroundColor: "#283655",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Col lg="6" style={{ display: "flex", justifyContent: "flex-start" }}>
        <Title level={5} style={{ color: "white", marginBottom: 0 }}>
          {title}
        </Title>
      </Col>
      <Col lg="6" style={{ display: "flex", justifyContent: "flex-end" }}>
        <Input
          prefix={<SearchOutlined />}
          className="trucking-summary-search"
          placeholder="Search"
          style={{ width: 200 }}
        />
      </Col>
    </Row>

    {/* Header row for Code, Description, and Vehicle Type */}
    <Row className="align-items-center justify-content-between my-4 border-bottom pb-2">
      <Col lg="6" className="custom-label text-center">
        <strong>Code</strong>
      </Col>
      <Col lg="6" className="custom-label text-center">
        <strong>Description</strong>
      </Col>
      <Col lg="2" className="custom-label text-right">
        <strong>Vehicle Type</strong>
      </Col>
    </Row>

    {/* Rendering rows */}
    {rows.map((row, index) => (
      <Row key={index} className="custom-section mt-4" style={{ background: "transparent" }}>
        <Col span={24}>
          <Row className="align-items-center justify-content-between my-4 border-bottom pb-2">
            <Col lg="6">
              <Input
                placeholder="Enter Code"
                value={row.code}
                onChange={(e) =>
                  handleInputChange(rows, setRows, index, "code", e.target.value)
                }
                className="standby-input"
              />
            </Col>
            <Col lg="6">
              <Input
                placeholder="Enter Description"
                value={row.description}
                onChange={(e) =>
                  handleInputChange(rows, setRows, index, "description", e.target.value)
                }
                className="standby-input"
              />
            </Col>
            <Col lg="2">
              <Select
                value={row.vehicleType}
                onChange={(value) => handleInputChange(rows, setRows, index, "vehicleType", value)}
                style={{ background: "#1c263c" }}
                className="custom-select"
              >
                <Option value="Excavator">Excavator</Option>
                <Option value="Truck">Truck</Option>
                <Option value="Loader">Loader</Option>
              </Select>
            </Col>
          </Row>
        </Col>
      </Row>
    ))}
  </>
);

export default AdminSettings;
