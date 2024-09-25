import React, { useState } from "react";
import { Typography, Input, Row, Col, Select, Button } from "antd";
import { Container } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { SearchOutlined } from "@ant-design/icons";
import "./index.css";

const { Title } = Typography;
const { Option } = Select;

interface Row {
  code: string;
  description: string;
  vehicleType: string;
}

interface RowErrors {
  code?: boolean;
  description?: boolean;
  vehicleType?: boolean;
}

const AdminSettings = (props: any) => {
  document.title = "Admin Settings | FMS Live";

  const [standbyRows, setStandbyRows] = useState<Row[]>([
    { code: "", description: "", vehicleType: "" },
  ]);
  const [delayRows, setDelayRows] = useState<Row[]>([
    { code: "", description: "", vehicleType: "" },
  ]);
  const [downRows, setDownRows] = useState<Row[]>([
    { code: "", description: "", vehicleType: "" },
  ]);

  const [standbyErrors, setStandbyErrors] = useState<{
    [key: number]: RowErrors;
  }>({});
  const [delayErrors, setDelayErrors] = useState<{ [key: number]: RowErrors }>(
    {}
  );
  const [downErrors, setDownErrors] = useState<{ [key: number]: RowErrors }>(
    {}
  );

  const handleInputChange = (
    rows: Row[],
    setRows: React.Dispatch<React.SetStateAction<Row[]>>,
    errors: { [key: number]: RowErrors },
    setErrors: React.Dispatch<
      React.SetStateAction<{ [key: number]: RowErrors }>
    >,
    index: number,
    field: keyof Row,
    value: string
  ) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);

    validateField(updatedRows, errors, setErrors, index, field, value);

    if (
      index === rows.length - 1 &&
      updatedRows[index].code &&
      updatedRows[index].description &&
      updatedRows[index].vehicleType
    ) {
      setRows([...updatedRows, { code: "", description: "", vehicleType: "" }]);
    }
  };

  const validateField = (
    rows: Row[],
    errors: { [key: number]: RowErrors },
    setErrors: React.Dispatch<
      React.SetStateAction<{ [key: number]: RowErrors }>
    >,
    index: number,
    field: keyof Row,
    value: string
  ) => {
    const updatedErrors = { ...errors };

    if (!updatedErrors[index]) {
      updatedErrors[index] = {};
    }

    if (!value) {
      updatedErrors[index][field] = true;
    } else {
      updatedErrors[index][field] = false;
    }

    if (
      updatedErrors[index] &&
      !Object.values(updatedErrors[index]).some((error) => error)
    ) {
      delete updatedErrors[index];
    }

    setErrors(updatedErrors);
  };

  const removeEmptyRows = (rows: Row[]) => {
    return rows.filter((row) => row.code || row.description || row.vehicleType);
  };

  const validateRows = (
    rows: Row[],
    setErrors: React.Dispatch<
      React.SetStateAction<{ [key: number]: RowErrors }>
    >
  ) => {
    let isValid = true;
    const newErrors: { [key: number]: RowErrors } = {};

    rows.forEach((row, index) => {
      const { code, description, vehicleType } = row;
      const rowErrors: RowErrors = {};

      if (!code) {
        rowErrors.code = true;
        isValid = false;
      }

      if (!description) {
        rowErrors.description = true;
        isValid = false;
      }

      if (!vehicleType) {
        rowErrors.vehicleType = true;
        isValid = false;
      }

      if (Object.keys(rowErrors).length > 0) {
        newErrors[index] = rowErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handlePublish = () => {
    console.log("Attempting to publish...");

    const filteredStandbyRows = removeEmptyRows(standbyRows);
    const filteredDelayRows = removeEmptyRows(delayRows);
    const filteredDownRows = removeEmptyRows(downRows);

    if (!validateRows(filteredStandbyRows, setStandbyErrors)) {
      return;
    }

    if (!validateRows(filteredDelayRows, setDelayErrors)) {
      return;
    }

    if (!validateRows(filteredDownRows, setDownErrors)) {
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

        <Row
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
          }}
        >
          {/* Left Aligned: State Reasons */}
          <Col>
            <Title
              level={4}
              style={{ color: "white", marginBottom: 0 }}
              className="state-reason-title"
            >
              State Reasons
            </Title>
            <div
              style={{
                borderBottom: "2px solid white",
                width: "130px",
                margin: "8px 0",
              }}
            />
          </Col>

          {/* Right Aligned: Publish Button */}
          <Col>
            <Button type="primary" onClick={handlePublish}>
              Publish
            </Button>
          </Col>
        </Row>

        {/* Standby Reasons Section */}
        <ReasonSection
          title="STANDBY REASONS"
          rows={standbyRows}
          setRows={setStandbyRows}
          errors={standbyErrors}
          setErrors={setStandbyErrors}
          handleInputChange={handleInputChange}
        />

        {/* Delay Reasons Section */}
        <ReasonSection
          title="DELAY REASONS"
          rows={delayRows}
          setRows={setDelayRows}
          errors={delayErrors}
          setErrors={setDelayErrors}
          handleInputChange={handleInputChange}
        />

        {/* Down Reasons Section */}
        <ReasonSection
          title="DOWN REASONS"
          rows={downRows}
          setRows={setDownRows}
          errors={downErrors}
          setErrors={setDownErrors}
          handleInputChange={handleInputChange}
        />
      </div>
    </React.Fragment>
  );
};

// Component for each reason section
const ReasonSection = ({
  title,
  rows,
  setRows,
  handleInputChange,
  errors,
  setErrors,
}: {
  title: string;
  rows: Row[];
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
  handleInputChange: (
    rows: Row[],
    setRows: React.Dispatch<React.SetStateAction<Row[]>>,
    errors: { [key: number]: RowErrors },
    setErrors: React.Dispatch<
      React.SetStateAction<{ [key: number]: RowErrors }>
    >,
    index: number,
    field: keyof Row,
    value: string
  ) => void;
  errors: { [key: number]: RowErrors };
  setErrors: React.Dispatch<React.SetStateAction<{ [key: number]: RowErrors }>>;
}) => (
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
      <Row
        key={index}
        className="custom-section mt-4"
        style={{ background: "transparent" }}
      >
        <Col span={24}>
          <Row className="align-items-center justify-content-between my-4 border-bottom pb-2">
            <Col lg="6">
              <div className="input-container">
                <Input
                  placeholder="Enter Code"
                  value={row.code}
                  onChange={(e) =>
                    handleInputChange(
                      rows,
                      setRows,
                      errors,
                      setErrors,
                      index,
                      "code",
                      e.target.value
                    )
                  }
                  className={`standby-input ${
                    errors[index]?.code ? "input-error" : ""
                  }`}
                />
                {errors[index]?.code && (
                  <span className="error-text-inline">Code is required</span>
                )}
              </div>
            </Col>
            <Col lg="6">
              <div className="input-container">
                <Input
                  placeholder="Enter Description"
                  value={row.description}
                  onChange={(e) =>
                    handleInputChange(
                      rows,
                      setRows,
                      errors,
                      setErrors,
                      index,
                      "description",
                      e.target.value
                    )
                  }
                  className={`standby-input ${
                    errors[index]?.description ? "input-error" : ""
                  }`}
                />
                {errors[index]?.description && (
                  <span className="error-text-inline">
                    Description is required
                  </span>
                )}
              </div>
            </Col>
            <Col lg="2">
              <div className="input-container">
                <Select
                  value={row.vehicleType}
                  onChange={(value) =>
                    handleInputChange(
                      rows,
                      setRows,
                      errors,
                      setErrors,
                      index,
                      "vehicleType",
                      value
                    )
                  }
                  style={{ background: "#1c263c" }}
                  className={`custom-select ${
                    errors[index]?.vehicleType ? "input-error" : ""
                  }`}
                >
                  <Option value="Excavator">Excavator</Option>
                  <Option value="Truck">Truck</Option>
                  <Option value="Loader">Loader</Option>
                </Select>
                {errors[index]?.vehicleType && (
                  <span className="error-text-inline" style={{ left: "-30px" }}>
                    Vehicle Type is required
                  </span>
                )}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    ))}
  </>
);

export default AdminSettings;
