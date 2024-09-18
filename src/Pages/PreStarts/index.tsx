import React, { useState } from "react";
import { Card, CardBody, Col, Container, Row, Input } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { useNavigate } from "react-router-dom";
import 'Pages/PreStarts/style.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PreStarts = (props: any) => {
  document.title = "Pre Starts | FMS Live";
  const navigate = useNavigate();

  const [preStartsData] = useState([
    { id: 1, name: "Andreson", date: "2024-08-22T08:30:00", equipmentType: "Haul Truck", passCount: 10, failCount: 2, naCount: 2, inspectionRequired: 1, skippedCount: 1 },
    { id: 2, name: "Andreson", date: "2024-08-22T12:15:00", equipmentType: "Haul Truck", passCount: 3, failCount: 8, naCount: 1, inspectionRequired: 2, skippedCount: 2 },
    { id: 3, name: "Andreson", date: "2024-08-22T10:45:00", equipmentType: "Haul Truck", passCount: 10, failCount: 2, naCount: 3, inspectionRequired: 2, skippedCount: 2 },
    { id: 4, name: "Andreson", date: "2024-08-22T10:45:00", equipmentType: "Haul Truck", passCount: 7, failCount: 2, naCount: 1, inspectionRequired: 2, skippedCount: 0 },
    { id: 5, name: "Andreson", date: "2024-08-22T10:45:00", equipmentType: "Haul Truck", passCount: 8, failCount: 2, naCount: 3, inspectionRequired: 1, skippedCount: 1 },
    { id: 6, name: "Andreson", date: "2024-08-22T10:45:00", equipmentType: "Haul Truck", passCount: 9, failCount: 1, naCount: 4, inspectionRequired: 1, skippedCount: 1 },
    { id: 7, name: "Andreson", date: "2024-08-22T10:45:00", equipmentType: "Haul Truck", passCount: 7, failCount: 3, naCount: 3, inspectionRequired: 1, skippedCount: 1 },
    { id: 8, name: "Andreson", date: "2024-08-22T10:45:00", equipmentType: "Haul Truck", passCount: 10, failCount: 2, naCount: 2, inspectionRequired: 1, skippedCount: 1 },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleSearch = (e: any) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleRowClick = (id: number) => {
    navigate(`/prestarts/id`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString("en-GB", options);
  };

  const filteredData = preStartsData.filter((data) => {
    return (
      data.name.toLowerCase().includes(searchTerm) ||
      formatDate(data.date).includes(searchTerm) ||
      data.equipmentType.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Maintenance" breadcrumbItem="Pre Starts" />

          {/* Top-right Date Pickers */}
          <div className="date-picker-container d-flex justify-content-end " style={{ position: 'relative', top: '-50px' }}>
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
                  <div className="d-flex justify-content-between">
                    <h4 className="card-title">Prestarts List</h4>
                    <Input
                      type="text"
                      placeholder="Quick Search"
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-25"
                    />
                  </div>

                  <div className="table-responsive mt-3">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Date</th>
                          <th>Equipment Type</th>
                          <th>Pass Count</th>
                          <th>Fail Count</th>
                          <th>N/A Count</th>
                          <th>Inspection Required</th>
                          <th>Skipped Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length > 0 ? (
                          filteredData.map((data) => (
                            <tr
                              key={data.id}
                              onClick={() => handleRowClick(data.id)}
                              style={{ cursor: "pointer" }}
                            >
                              <td>{data.name}</td>
                              <td>{formatDate(data.date)}</td>
                              <td>{data.equipmentType}</td>
                              <td>{data.passCount}</td>
                              <td>{data.failCount}</td>
                              <td>{data.naCount}</td>
                              <td>{data.inspectionRequired}</td>
                              <td>{data.skippedCount}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="text-center">
                              No results found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

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
