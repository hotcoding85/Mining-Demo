import React, { useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { useNavigate } from "react-router-dom";
import "Pages/PreStarts/style.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input, Space } from "antd";
import Table from "Components/Common/Table";

interface DataType {
  key: string;
  name: string;
  date: string;
  check?: string;
  equipmentType: string;
  passCount: number;
  failCount: number;
  naCount: number;
  inspectionRequired: boolean;
  skippedCount: number;
}

const PreStarts = (props: any) => {
  document.title = "Pre Starts | FMS Live";
  const navigate = useNavigate();

  const [preStartsData] = useState([
    {
      id: 1,
      name: "Andreson",
      date: "2024-08-22T08:30:00",
      equipmentType: "Haul Truck",
      passCount: 10,
      failCount: 2,
      naCount: 2,
      inspectionRequired: 1,
      skippedCount: 1,
    },
    {
      id: 2,
      name: "Andreson",
      date: "2024-08-22T12:15:00",
      equipmentType: "Haul Truck",
      passCount: 3,
      failCount: 8,
      naCount: 1,
      inspectionRequired: 2,
      skippedCount: 2,
    },
    {
      id: 3,
      name: "Andreson",
      date: "2024-08-22T10:45:00",
      equipmentType: "Haul Truck",
      passCount: 10,
      failCount: 2,
      naCount: 3,
      inspectionRequired: 2,
      skippedCount: 2,
    },
    {
      id: 4,
      name: "Andreson",
      date: "2024-08-22T10:45:00",
      equipmentType: "Haul Truck",
      passCount: 7,
      failCount: 2,
      naCount: 1,
      inspectionRequired: 2,
      skippedCount: 0,
    },
    {
      id: 5,
      name: "Andreson",
      date: "2024-08-22T10:45:00",
      equipmentType: "Haul Truck",
      passCount: 8,
      failCount: 2,
      naCount: 3,
      inspectionRequired: 1,
      skippedCount: 1,
    },
    {
      id: 6,
      name: "Andreson",
      date: "2024-08-22T10:45:00",
      equipmentType: "Haul Truck",
      passCount: 9,
      failCount: 1,
      naCount: 4,
      inspectionRequired: 1,
      skippedCount: 1,
    },
    {
      id: 7,
      name: "Andreson",
      date: "2024-08-22T10:45:00",
      equipmentType: "Haul Truck",
      passCount: 7,
      failCount: 3,
      naCount: 3,
      inspectionRequired: 1,
      skippedCount: 1,
    },
    {
      id: 8,
      name: "Andreson",
      date: "2024-08-22T10:45:00",
      equipmentType: "Haul Truck",
      passCount: 10,
      failCount: 2,
      naCount: 2,
      inspectionRequired: 1,
      skippedCount: 1,
    },
  ]);

  const columns = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        dataType: "string",
        align: "center",
        render: (text, record) => (
          <p
            className="m-0 text-primary"
            onClick={() => handleRowClick(parseInt(record.key))}
          >
            {text}
          </p>
        ),
      },
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        dataType: "date",
        align: "center",
        render: (text) => formatDate(text),
      },
      {
        title: "Equipment Type",
        dataIndex: "equipmentType",
        key: "equipmentType",
        align: "center",
        dataType: "string",
      },
      {
        title: "Pass Count",
        dataIndex: "passCount",
        align: "center",
        key: "passCount",
        dataType: "number",
      },
      {
        title: "Fail Count",
        dataIndex: "failCount",
        align: "center",
        key: "failCount",
        dataType: "number",
      },
      {
        title: "N/A Count",
        dataIndex: "naCount",
        align: "center",
        key: "naCount",
        dataType: "number",
      },
      {
        title: "Inspection Required",
        dataIndex: "inspectionRequired",
        key: "inspectionRequired",
        align: "center",
        dataType: "boolean",
        render: (text) => (text ? "Yes" : "No"),
      },
      {
        title: "Skipped Count",
        dataIndex: "skippedCount",
        align: "center",
        key: "skippedCount",
        dataType: "number",
      },
      {
        title: "Action",
        align: "center",
        key: "action",
        render: (_, record) => (
          <Space size="middle">
            <a>Invite {record.name}</a>
            <a>Delete</a>
          </Space>
        ),
      },
    ],
    []
  );

  const data: DataType[] = preStartsData.map((item) => ({
    key: String(item.id),
    name: item.name,
    date: item.date,
    equipmentType: item.equipmentType,
    passCount: item.passCount,
    failCount: item.failCount,
    naCount: item.naCount,
    inspectionRequired: item.inspectionRequired === 1,
    skippedCount: item.skippedCount,
  }));

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleRowClick = (id: number) => {
    navigate(`/pre-starts/${id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-GB", options);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      columns.some((col) =>
        String(item[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, columns]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Maintenance" breadcrumbItem="Pre Starts" />

          {/* Top-right Date Pickers */}
          <div
            className="date-picker-container d-flex justify-content-end "
            style={{ position: "relative", top: "-50px" }}
          >
            <div className="date-picker-wrapper mr-3">
              <label>Select Start Date:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="dd/MM/yy"
                className="form-control custom-date-picker"
                placeholderText="DD/MM/YY"
              />
            </div>
            <div className="date-picker-wrapper">
              <label>Select End Date:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="dd/MM/yy"
                className="form-control custom-date-picker"
                placeholderText="DD/MM/YY"
              />
            </div>
          </div>

          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <Row>
                    <Col sm={4}>
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginBottom: 16 }}
                        allowClear
                      />
                    </Col>
                  </Row>
                  <Table
                    columns={columns}
                    data={filteredData || []}
                    paginationPageSize={5}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PreStarts;
