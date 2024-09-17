import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import {Input} from 'antd';
import Breadcrumb from "Components/Common/Breadcrumb";
import { DatePicker, Select, Button } from "antd";
import { round2Two, roundOff } from "utils/common";
import "./style.scss";
import LoadTarget from "./components/LoadTarget";
import _, { round } from "lodash";

const ROMMillTargets = (props: any) => {
  document.title = "ROM Mill Targets | FMS Live";

  const [data, setData] = useState<any>([]);
  const [targetTonnes, setTargetTonnes] = useState<number>(258.4);
  const [loadsPerHour, setLoadsPerHour] = useState<number>(3.16);
  const [gradePerHour, setGradePerHour] = useState<number>(43.06);
  const [avgTonnesPerHour, setAvgTonnesPerHour] = useState<number>(21.53);

  useEffect(() => {
    setData(generateData())
  }, [])

  const generateData = () => {
    return [{
      equipmentName: "WA600",
      plannedLoads: 38,
      averageLoadTonnes: 6.8,
      plannedShiftTonnesToMill: 258.4,
      gramsPerTonne: 2.1,
      averageTripTime: 0,
      standbyHours: 0,
      hour1PlannedTonnes: 0,
      hour2PlannedTonnes: 0,
      hour3PlannedTonnes: 0,
      hour4PlannedTonnes: 0,
      hour5PlannedTonnes: 0,
      hour6PlannedTonnes: 0,
      hour7PlannedTonnes: 0,
      hour8PlannedTonnes: 0,
      hour9PlannedTonnes: 0,
      hour10PlannedTonnes: 0,
      hour11PlannedTonnes: 0,
      hour12PlannedTonnes: 0,
      availabilityHours: 0,
      utilisationHours: 0,
    }]
  }

  const onFieldChange = (row, columnId, value) => {

    const rowIndex = row.index;
    const rowData = row.original;
    
    setData((prevState) => {
      
      const newData = _.cloneDeep(prevState);
      newData[rowIndex][columnId] = value;

      let plannedLoads = newData[rowIndex]['plannedLoads'];
      let avgLoadTonnes = newData[rowIndex]['averageLoadTonnes']
      let gramsPerTonne = newData[rowIndex]['gramsPerTonne']
      let plannedShiftTonnes = plannedLoads * avgLoadTonnes
      let tonnesPerHour = (plannedShiftTonnes / 12)
      let gradePerHour = tonnesPerHour * gramsPerTonne

      newData[rowIndex]['plannedShiftTonnesToMill'] = plannedShiftTonnes

      let loadsPerHour = plannedLoads / 12
      setLoadsPerHour(loadsPerHour)
      setTargetTonnes(plannedShiftTonnes)
      setGradePerHour(gradePerHour)
      setAvgTonnesPerHour(tonnesPerHour)
      return newData;
    })
  }
  const tableColumns = [
    {
      header: "Equipment Name",
      accessorKey: "equipmentName",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ row, getValue }) => {
        return <>{getValue()}</>;
      },
    },
    {
      header: "Planned Loads",
      accessorKey: "plannedLoads",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          min={1}
          step={1}
          onWheel={(event) => event.currentTarget.blur()}
          onChange={(event) => onFieldChange(row, column.id, event.target.value)}
          value={getValue()}
        />
      ),
    },
    {
      header: "Average Load Tonnes",
      accessorKey: "averageLoadTonnes",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          min={1}
          step={0.1}
          onChange={(event) => onFieldChange(row, column.id, event.target.value)}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    {
      header: "Planned Shift Tonnes to Mill",
      accessorKey: "plannedShiftTonnesToMill",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          disabled
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={round2Two(getValue())}
        />
      ),
    },
    {
      header: "Grams per Tonne",
      accessorKey: "gramsPerTonne",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          min={1}
          step={0.01}
          style={{ textAlign: "center" }}
          onChange={(event) => onFieldChange(row, column.id, event.target.value)}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    {
      header: "Average Trip Time",
      accessorKey: "averageTripTime",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    {
      header: "Standby (Hours)",
      accessorKey: "standbyHours",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    {
      header: "Hour 1 Planned Tonnes",
      accessorKey: "hour1PlannedTonnes",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    {
      header: "Hour 2 Planned Tonnes",
      accessorKey: "hour2PlannedTonnes",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    {
      header: "Hour 3 Planned Tonnes",
      accessorKey: "hour3PlannedTonnes",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    {
      header: "Hour 4 Planned Tonnes",
      accessorKey: "hour4PlannedTonnes",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    {
      header: "Hour 5 Planned Tonnes",
      accessorKey: "hour5PlannedTonnes",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    {
      header: "Hour 6 Planned Tonnes",
      accessorKey: "hour6PlannedTonnes",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    {
      header: "Hour 7 Planned Tonnes",
      accessorKey: "hour7PlannedTonnes",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    {
      header: "Hour 8 Planned Tonnes",
      accessorKey: "hour8PlannedTonnes",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    {
      header: "Hour 9 Planned Tonnes",
      accessorKey: "hour9PlannedTonnes",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    {
      header: "Hour 10 Planned Tonnes",
      accessorKey: "hour10PlannedTonnes",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    {
      header: "Hour 11 Planned Tonnes",
      accessorKey: "hour11PlannedTonnes",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    {
      header: "Hour 12 Planned Tonnes",
      accessorKey: "hour12PlannedTonnes",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    // Continue with other columns for hours 4 through 12
    {
      header: "Availability (Hours)",
      accessorKey: "availabilityHours",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
    {
      header: "Utilisation (Hours)",
      accessorKey: "utilisationHours",
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ getValue, row, column }) => (
        <Input
          type="number"
          style={{ textAlign: "center" }}
          onWheel={(event) => event.currentTarget.blur()}
          value={getValue()}
        />
      ),
    },
  ];

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

          <Row className="mb-4 rommil-contents" style={{justifyContent:'space-evenly'}}>
            <Col xs={2}>
              <Card className="h-100">
                <CardBody>
                  <Row className="justify-content-between align-content-between h-100">
                    <h4 style={{ color: "#9CA3B1" }} className="coolContainer">
                      Target Tonnes for Shift
                    </h4>
                    <h3 className="mb-0 h-auto" style={{ color: "#389E0D" }}>
                      {`${round2Two(targetTonnes)} t` || 0}
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
                      {`${round(loadsPerHour)}` || 0}
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
                      {`${round2Two(gradePerHour)} g/t` || 0}
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
                      {`${round2Two(avgTonnesPerHour)} t` || 0}
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
            {/* <Col xs={2}>
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
            </Col> */}
          </Row>

          <Row className="mt-3 rommil-load-targets">
            <Col lg="12">
              <LoadTarget tableColumns={tableColumns} data={data}/>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ROMMillTargets;
