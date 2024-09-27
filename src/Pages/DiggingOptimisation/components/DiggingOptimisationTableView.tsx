import { Card, CardBody, Col, Row } from "reactstrap";
import { getContentByState } from "utils/common";
import DiggingOptimisationHeader from "./DiggingOptimisationHeader";
import Table from "Components/Common/Table";

const DiggingOptimisationTableView = () => {
  const columns = [
    {
      title: "Vehicle Name",
      dataIndex: "vehicleName",
      key: "vehicleName",
      dataType: "string",
      align: "center",
    },
    {
      title: "Operator Name",
      dataIndex: "operatorName",
      key: "operatorName",
      dataType: "string",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      dataType: "string",
      align: "center",
      render: (text) => {
        const displayContent = getContentByState(text);
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            }}
          >
            <span
              style={{
                height: "8px",
                width: "8px",
                color: "transparent",
                backgroundColor: displayContent.color,
                borderRadius: "50%",
                fontSize: "1px",
              }}
            ></span>
            <span className="text-center px-2">
              {displayContent.displayState}
            </span>
          </div>
        );
      },
    },
    {
      title: "Passes",
      dataIndex: "passes",
      key: "passes",
      dataType: "number",
      align: "center",
    },
    {
      title: "Current Load",
      dataIndex: "currentLoad",
      key: "currentLoad",
      dataType: "number",
      align: "center",
    },
    {
      title: "Active Hours",
      dataIndex: "activeHours",
      key: "activeHours",
      dataType: "number",
      align: "center",
    },
    {
      title: "Avg Load Time",
      dataIndex: "avgLoadTime",
      key: "avgLoadTime",
      dataType: "number",
      align: "center",
    },
    {
      title: "Truck Waiting Time",
      dataIndex: "truckWaitingTime",
      key: "truckWaitingTime",
      dataType: "number",
      align: "center",
    },
    {
      title: "Avg Load per Hour",
      dataIndex: "avgLoadPerHour",
      key: "avgLoadPerHour",
      dataType: "number",
      align: "center",
    },
    {
      title: "Tonnes per Hour",
      dataIndex: "tonnesLoadPerHour",
      key: "tonnesLoadPerHour",
      dataType: "string",
      align: "center",
    },
  ];

  const tableData = [
    {
      vehicleName: "EX201",
      operatorName: "James Taylor",
      status: "ACTIVE",
      passes: 5,
      currentLoad: "13.1t",
      avgLoadTime: "02:14",
      truckWaitingTime: "04:35",
      activeHours: "06:00",
      avgLoadPerHour: "7",
      tonnesLoadPerHour: "589t",
    },
    {
      vehicleName: "EX202",
      operatorName: "John Shein",
      status: "ACTIVE",
      passes: 3,
      currentLoad: "12.4t",
      avgLoadTime: "03:20",
      truckWaitingTime: "01:09",
      activeHours: "02:29",
      avgLoadPerHour: "9",
      tonnesLoadPerHour: "720t",
    },
    {
      vehicleName: "EX203",
      operatorName: "William",
      status: "DOWN",
      passes: 6,
      currentLoad: "9.6t",
      avgLoadTime: "04:20",
      truckWaitingTime: "01:00",
      activeHours: "03:20",
      avgLoadPerHour: "8",
      tonnesLoadPerHour: "666t",
    },
  ];
  return (
    <>
      <Row>
        <Col lg="12">
          <DiggingOptimisationHeader />
          <Card>
            <CardBody>
              <Table
                columns={columns}
                data={tableData}
                paginationPageSize={5}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default DiggingOptimisationTableView;
