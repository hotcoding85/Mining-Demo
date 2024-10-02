import React, { useEffect, useMemo, useState } from "react";
import { Typography, Input, Row, Col, Select, Button } from "antd";
import { Container } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { SearchOutlined } from "@ant-design/icons";
import "./index.css";
import { useDispatch } from "react-redux";
import {
  addVehicleStateReasons,
  getVehicleStateReasons,
  removeVehicleStateReason,
} from "slices/stateReasons/thunk";
import { useSelector } from "react-redux";
import DeleteButton from "Components/Common/DeleteButton";
import { StateReasonsSelector } from "selectors";

const { Title } = Typography;
const { Option } = Select;

interface Row {
  id?: string;
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

  const dispatch: any = useDispatch();

  const { reasons } = useSelector(StateReasonsSelector);

  const [standbyRows, setStandbyRows] = useState<Row[]>([
    { code: "", description: "", vehicleType: "" },
  ]);
  const [delayRows, setDelayRows] = useState<Row[]>([
    { code: "", description: "", vehicleType: "" },
  ]);
  const [downRows, setDownRows] = useState<Row[]>([
    { code: "", description: "", vehicleType: "" },
  ]);

  useEffect(() => {
    if (dispatch) {
      dispatch(getVehicleStateReasons());
    }
  }, []);

  useEffect(() => {
    if (reasons.length > 0) {
      setStandbyRows([
        ...reasons.filter(
          (item: any) => item.category === "STANDBY"
        ),
        ...standbyRows.filter((item) => !item?.id),
      ]);
      setDelayRows([
        ...reasons.filter((item: any) => item.category === "DELAY"),
        ...delayRows.filter((item) => !item?.id),
      ]);
      setDownRows([
        ...reasons.filter((item: any) => item.category === "DOWN"),
        ...downRows.filter((item) => !item?.id),
      ]);
    }
  }, [reasons]);

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
    let updatedRows = [...rows];
    const updatedRow = { ...updatedRows[index], [field]: value };
    updatedRows[index] = updatedRow;

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

  const normalizeDataToPublish = (rows, category) => {
    return rows.map((item) => ({
      id: item.id || undefined,
      code: item.code,
      description: item.description,
      vehicleType: item.vehicleType,
      category,
      status: item.status || "ACTIVE",
    }));
  };

  const handleDeleteRow = (id: string) => {
    if (id) {
      dispatch(removeVehicleStateReason(id?.toString()));
    }
  };

  const handlePublish = () => {
    console.log("Attempting to publish...");

    const filteredStandbyRows = removeEmptyRows(standbyRows);
    const filteredDelayRows = removeEmptyRows(delayRows);
    const filteredDownRows = removeEmptyRows(downRows);

    if (!validateRows(filteredStandbyRows, setStandbyErrors)) {
      console.log("Standby validation failed!");
      console.log(filteredStandbyRows);
      return;
    }

    if (!validateRows(filteredDelayRows, setDelayErrors)) {
      console.log("Delay validation failed!");
      console.log(filteredDelayRows);
      return;
    }

    if (!validateRows(filteredDownRows, setDownErrors)) {
      console.log("Down validation failed!");
      console.log(filteredDownRows);
      return;
    }

    setStandbyRows((prev) => [
      ...prev.filter((item) => !!item.id),
      { code: "", description: "", vehicleType: "" },
    ]);
    setDelayRows((prev) => [
      ...prev.filter((item) => !!item.id),
      { code: "", description: "", vehicleType: "" },
    ]);
    setDownRows((prev) => [
      ...prev.filter((item) => !!item.id),
      { code: "", description: "", vehicleType: "" },
    ]);

    dispatch(
      addVehicleStateReasons([
        ...normalizeDataToPublish(filteredStandbyRows, "STANDBY"),
        ...normalizeDataToPublish(filteredDelayRows, "DELAY"),
        ...normalizeDataToPublish(filteredDownRows, "DOWN"),
      ])
    );
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
          handleDeleteRow={handleDeleteRow}
        />

        {/* Delay Reasons Section */}
        <ReasonSection
          title="DELAY REASONS"
          rows={delayRows}
          setRows={setDelayRows}
          errors={delayErrors}
          setErrors={setDelayErrors}
          handleInputChange={handleInputChange}
          handleDeleteRow={handleDeleteRow}
        />

        {/* Down Reasons Section */}
        <ReasonSection
          title="DOWN REASONS"
          rows={downRows}
          setRows={setDownRows}
          errors={downErrors}
          setErrors={setDownErrors}
          handleInputChange={handleInputChange}
          handleDeleteRow={handleDeleteRow}
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
  handleDeleteRow,
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
  handleDeleteRow: (id: string) => void;
}) => {
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (item) =>
          !searchKeyword ||
          item.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          item.description.toLowerCase().includes(searchKeyword.toLowerCase())
      ),
    [rows, searchKeyword]
  );

  return (
    <div
      style={{
        marginBottom: "24px",
      }}
    >
      <Row
        style={{
          padding: "8px 16px",
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
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </Col>
      </Row>

      {/* Header row for Code, Description, and Vehicle Type */}

      <div
        style={{
          padding: "8px 16px",
        }}
      >
        <Row className="align-items-center justify-content-between border-bottom py-2 mb-2">
          <Col span={4} className="custom-label text-left">
            <strong>Code</strong>
          </Col>
          <Col span={12} className="custom-label text-left">
            <strong>Description</strong>
          </Col>
          <Col span={3} className="custom-label text-right">
            <strong>Vehicle Type</strong>
          </Col>
        </Row>
        {/* Rendering rows */}
        {filteredRows.map((row, index) => (
          <Row
            key={index}
            gutter={[8, 8]}
            className="custom-section py-2 align-items-center justify-content-between"
            style={{ background: "transparent" }}
          >
            <Col span={6}>
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
                {errors[index]?.code &&
                  (row.code.length > 0 ? (
                    <span className="error-text-inline">
                      This code is already existed!
                    </span>
                  ) : (
                    <span className="error-text-inline">Code is required</span>
                  ))}
              </div>
            </Col>
            <Col span={12}>
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
            <Col span={3}>
              <Row className="input-container align-items-center justify-content-end">
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
                  <Option value="">Select Vehicle Type</Option>
                  <Option value="EXCAVATOR">Excavator</Option>
                  <Option value="DUMP_TRUCK">Truck</Option>
                  <Option value="LOADER">Loader</Option>
                </Select>
                {errors[index]?.vehicleType && (
                  <span
                    className="error-text-inline"
                    style={{ right: "0px", bottom: "-16px" }}
                  >
                    Vehicle Type is required
                  </span>
                )}
              </Row>
            </Col>
            <Col span={1}>
              {row.id && (
                <DeleteButton
                  item={row.code}
                  onDelete={async () => {
                    if (row?.id) {
                      await handleDeleteRow(row?.id);
                    } else {
                      setRows(rows.filter((item) => item.code !== row.code));
                    }
                  }}
                />
              )}
            </Col>
          </Row>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
