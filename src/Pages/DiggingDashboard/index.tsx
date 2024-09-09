import React, { useMemo, useState } from "react";
import { Table, Input, DropdownToggle, Dropdown, DropdownItem, Progress, Card, CardBody, Col, Container, Row, DropdownMenu } from "reactstrap";
import Chart from "react-apexcharts";
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import { ApexOptions } from "apexcharts";
import DatePicker from 'react-datepicker';
import 'Pages/DiggingDashboard/style.css';
import { FaCalendarAlt } from 'react-icons/fa';
import 'react-datepicker/dist/react-datepicker.css';
import { MdArrowBackIos } from "react-icons/md";
import { MdArrowForwardIos } from "react-icons/md";
import { FaRegCalendarAlt } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";



const chartOptions = (series: number, label: string, color: string = '#fff'): ApexOptions => ({
  series: [series],
  chart: {
    height: 180,
    type: 'radialBar',
  },
  plotOptions: {
    radialBar: {
      hollow: {
        size: '60%',
      },
      dataLabels: {
        show: true,
        name: {
          offsetY: -10,
          show: false,  // Hides the name inside the chart
        },
        value: {
          fontSize: "22px",
          show: true,
          color: "#fff",  // Percentage color
          offsetY: 10,  // Controls vertical position inside the chart
        },
      },
      track: {
        background: '#fff',
        strokeWidth: '100%',
        margin: 5,  // margin between chart and track
        dropShadow: {
          enabled: true,
          top: 2,
          left: 0,
          color: '#000',
          opacity: 0.15,
          blur: 5
        }
      }
    },
  },
  colors: [color],
  labels: [label],
});

const chartOption = (series: number, color: string): ApexOptions => ({
  series: [series],
  chart: {
    height: 200,
    type: 'radialBar',
  },
  plotOptions: {
    radialBar: {
      hollow: {
        size: '60%',
      },
      dataLabels: {
        show: true,
        name: {
          show: false,
        },
        value: {
          fontSize: "22px",
          show: true,
          color: "#fff",
          offsetY: 10,
        },
      },
      track: {
        background: '#f0f0f0',
        strokeWidth: '97%',
        margin: 5,
        dropShadow: {
          enabled: true,
          top: 2,
          left: 0,
          color: '#000',
          opacity: 0.15,
          blur: 2
        }
      }
    },
  },
  colors: [color],
  labels: [''],
});




const DiggingDashboard = () => {
  const data = useMemo(
    () => [
      { name: 'EX201', completed: '9/35', actual: 228129, planned: 500000, load: 250, tonnes: 50, avgLoadTime: 14, plannedLoadTime: 15, avgCycleTime: 20, plannedCycleTime: 25 },
      { name: 'EX202', completed: '10/35', actual: 228129, planned: 500000, load: 250, tonnes: 50, avgLoadTime: 14, plannedLoadTime: 15, avgCycleTime: 20, plannedCycleTime: 25 },
      { name: 'EX203', completed: '12/35', actual: 228129, planned: 500000, load: 250, tonnes: 50, avgLoadTime: 14, plannedLoadTime: 15, avgCycleTime: 20, plannedCycleTime: 25 },
      { name: 'EX204', completed: '17/35', actual: 228129, planned: 500000, load: 250, tonnes: 50, avgLoadTime: 14, plannedLoadTime: 15, avgCycleTime: 20, plannedCycleTime: 25 },

    ],
    []
  );

  // Define columns for react-table
  const columns = useMemo(
    () => [
      { Header: 'Equipment Name', accessor: 'name' },
      { Header: 'Completed', accessor: 'completed' },
      { Header: 'Actual (Tonnes)', accessor: 'actual' },
      { Header: 'Planned (Tonnes)', accessor: 'planned' },
      { Header: 'Avg Load per Hour', accessor: 'load' },
      { Header: 'Tonnes per Hour', accessor: 'tonnes' },
      { Header: 'Avg Load Time', accessor: 'avgLoadTime' },
      { Header: 'Planned Load Time', accessor: 'plannedLoadTime' },
      { Header: 'Avg Cycle Time', accessor: 'avgCycleTime' },
      { Header: 'Planned Cycle Time', accessor: 'plannedCycleTime' },
    ],
    []
  );

  // React-table hook to manage table instance
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    setGlobalFilter,
    state: { pageIndex, globalFilter },
  } = useTable({ columns, data, initialState: { pageIndex: 0 } }, useGlobalFilter, usePagination);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date());

  // Toggle dropdown for columns
  const toggle = () => setDropdownOpen((prevState) => !prevState);

  const numbersArray = [1, '...', 5, 6, 7, '...', 10];
  const itemsPerPageOptions = [10, 20, 30, 50];

  const updateDatePickerDisplay = () => {
    const element = document.getElementById('date-picker');
    if (element) {
      element.style.display = 'block';
    }
  }



  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col lg="12">
              <Card>
                <CardBody className="text-center chart-card-body">
                  <h5 className="mb-4">Digger Chart</h5>
                  <Row className="justify-content-center">
                    <Col md="2" className="chart-wrapper">
                      <Chart options={chartOptions(72, 'Active', '#00FF00')} series={[72]} type="radialBar" height={220} />
                      <p className="chart-label">Active</p>
                      <p className="chart-time">00:24:52</p>
                    </Col>
                    <Col md="2" className="chart-wrapper">
                      <Chart options={chartOptions(64, 'Standby', '#FFA500')} series={[64]} type="radialBar" height={220} />
                      <p className="chart-label">Standby</p>
                      <p className="chart-time">00:24:52</p>
                    </Col>
                    <Col md="2" className="chart-wrapper">
                      <Chart options={chartOptions(58, 'Down', '#FF0000')} series={[58]} type="radialBar" height={220} />
                      <p className="chart-label">Down</p>
                      <p className="chart-time">00:24:52</p>
                    </Col>
                    <Col md="2" className="chart-wrapper">
                      <Chart options={chartOptions(58, 'Idle', '#FFFFFF')} series={[58]} type="radialBar" height={220} />
                      <p className="chart-label">Idle</p>
                      <p className="chart-time">00:24:52</p>
                    </Col>
                    <Col md="2" className="chart-wrapper">
                      <Chart options={chartOptions(65, 'Delay', '#800080')} series={[65]} type="radialBar" height={220} />
                      <p className="chart-label">Delay</p>
                      <p className="chart-time">00:24:52</p>
                    </Col>
                  </Row>
                </CardBody>


              </Card>
            </Col>
          </Row>
        </Container>
        <Container fluid>
          <Row>
            {/* First Card: Overall Load Target */}
            <Col lg="4">
              <Card>
                <CardBody className="text-center">
                  <h6 className="mb-4">Overall Load Target</h6>
                  <Chart options={chartOption(79, '#00FF00')} series={[79]} type="radialBar" height={200} />
                  <div className="d-flex justify-content-between mt-3 chart-label-wrapper">
                    <p className="mb-0 completed-label" >COMPLETED</p>
                    <p className="mb-0 status-label">280 of 600</p>
                  </div>
                </CardBody>
              </Card>
            </Col>

            {/* Second Card: Tonnes Extraction */}
            <Col lg="4">
              <Card>
                <CardBody className="text-center">
                  <h6 className="mb-4">Tonnes Extraction</h6>
                  <Chart options={chartOption(21, '#FFA500')} series={[21]} type="radialBar" height={200} />
                  <div className="d-flex justify-content-between mt-3 chart-label-wrapper">
                    <p className="mb-0 completed-label" style={{ fontWeight: "bold" }}>COMPLETED</p>
                    <p className="mb-0 status-label">28K of 60K</p>
                  </div>
                </CardBody>
              </Card>
            </Col>

            {/* Third Card: Hours Planned */}
            <Col lg="4">
              <Card>
                <CardBody className="text-center">
                  <h6 className="mb-4">Hours Planned</h6>
                  <Chart options={chartOption(30, '#FFA500')} series={[30]} type="radialBar" height={200} />
                  <div className="d-flex justify-content-between mt-3 chart-label-wrapper">
                    <p className="mb-0 completed-label" style={{ fontWeight: "bold" }}>DELIVERED</p>
                    <p className="mb-0 status-label">3 of 10</p>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
        <Container fluid>
          <Row className="justify-content-center">
            <Col md="12" className="text-center">
              <h6 className="efficiency-title">Efficiency Rating</h6>
              <div className="efficiency-rating">
                {/* Progress Bar */}
                <div className="progress-bar-container mb-4">
                  <div className="progress-bar" style={{ width: "40%", backgroundColor: "#FFA500" }}></div>
                  <div className="progress-marker" style={{ left: "40%" }}>
                    <span className="label">Poor</span>
                  </div>
                  <div className="progress-marker" style={{ left: "60%" }}>
                    <span className="label">Good</span>
                  </div>
                  <div className="progress-marker" style={{ left: "80%" }}>
                    <span className="label">Fair</span>
                  </div>
                  <div className="progress-marker" style={{ left: "10%" }}>
                    <span className="label">Excellent</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>

        <Container fluid>
          {/* Header Section */}
          <div>
            <Row>
              <Col md="12">
                <Card className="table-card">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center justify-content-between">
                      <div className="left-side-container">
                        <h5 className="table-title">Digging Summary</h5>
                      </div>
                      <div className="right-side-container d-flex align-items-center">
                        <span style={{ marginRight: "10px" }} className="d-flex align-items-center">
                          <FaRegCalendarAlt style={{ marginRight: "5px" }} onClick={updateDatePickerDisplay} />Date
                        </span>
                        <span style={{ display: "none" }} id="date-picker">
                          <DatePicker
                            selected={startDate}
                            onChange={(date: Date) => setStartDate(date)}
                            className="date-picker"
                          />
                        </span>

                        <span style={{ marginRight: "10px" }} className="d-flex align-items-center">
                          <MdFilterList style={{ marginRight: "5px" }} />Filter
                        </span>

                        {/* Dropdown for column selection */}
                        <Dropdown isOpen={dropdownOpen} toggle={toggle} className="table-dropdown">
                          <DropdownToggle caret className="dropdown-toggle-custom">Show/Hide Columns</DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem>Column 1</DropdownItem>
                            <DropdownItem>Column 2</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                        {/* Search field */}
                        <Input
                          type="text"
                          value={globalFilter || ''}
                          onChange={(e) => setGlobalFilter(e.target.value)}
                          placeholder="Quick Search"
                          className="search-input"
                        />
                      </div>
                      {/* Date Picker */}
                    </div>

                    <Table   {...getTableProps()} className="table-custom mt-4">
                      <thead>
                        {headerGroups.map((headerGroup) => (
                          <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                              <th id="table-head" {...column.getHeaderProps()}>{column.render('Header')}</th>
                            ))}
                          </tr>
                        ))}
                      </thead>
                      <tbody {...getTableBodyProps()}>
                        {page.map((row) => {
                          prepareRow(row);
                          return (
                            <tr {...row.getRowProps()}>
                              {row.cells.map((cell) => (
                                <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                    <Col md="6" className="d-flex align-items-center">
                      <h6 style={{ color: 'green', fontWeight: 'bold' }}>Total: 127/350</h6>
                    </Col>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: "25%" }}
                        aria-valuenow={25}
                        aria-valuemin={0}
                        aria-valuemax={100}>
                      </div>
                    </div>

                  </CardBody>
                </Card>
              </Col>
            </Row>


            {/* Table Section */}
          </div>
          {/* Pagination */}
          <Col md="12" className="d-flex justify-content-end align-items-end mb-4">
            <div style={{ marginBottom: "5px" }}>
              <MdArrowBackIos />
            </div>
            <ul className="pagination-numbers d-flex align-items-center justify-content-center">
              {numbersArray.map((item, index) => (
                <li key={index} className="pagination-item">
                  {item}
                </li>
              ))}
            </ul>
            <div style={{ marginBottom: "5px" }}>
              <MdArrowForwardIos />
            </div>

            <div className="items-per-page-dropdown">
              <Dropdown>
                <DropdownToggle caret>
                  10 / page
                </DropdownToggle>
                <DropdownMenu>
                  {itemsPerPageOptions.map((option, index) => (
                    <DropdownItem key={index}>{option} / page</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>

            {/* Go To Page Input */}
            <div className="go-to-page d-flex align-items-center">
              <span>Go to</span>
              <Input type="text" className="go-to-input" min="1" />
              <span>page</span>
            </div>
          </Col>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default DiggingDashboard;