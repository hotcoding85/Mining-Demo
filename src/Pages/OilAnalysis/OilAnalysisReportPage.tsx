import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, Card, CardBody, Col, Container, Row, Table } from "reactstrap";
import {  Segmented, Space, Select, Button } from "antd";
import "react-datepicker/dist/react-datepicker.css";
import './index.scss';
import {DatePicker} from "antd";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Breadcrumb from "Components/Common/Breadcrumb";
import SearchDropdown from "./../TruckLoadOptimisation/components/SearchDropdown";
import { BackwardOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import OilAnalysisData from "./OilAnalysisData";
import EventDetail from "./EventDetail";

const OilAnalysisReportPage = (props: any) => {
  document.title = "Oil Analysis Report | FMS Live";
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [startDate, setStartDate] = React.useState<any>('');

  function generateRandomElement() {
    // Randomly return either a number, "<1", or "<0.1"
    const rand = Math.random();
    if (rand < 0.3) return "<1";
    if (rand < 0.6) return "<0.1";
    return Math.floor(Math.random() * 100); // Random number from 0 to 99
  }
  
  function generateEvaluation(status: string): string {
    switch (status) {
      case "Normal":
        return "All tests on this sample appear acceptable, keep sampling to further monitor.";
      case "Query":
        return "Viscosity appears high for stated oil type. All other test results appear acceptable, further monitor next sample.";
      case "Caution":
        return "Viscosity increased and appears high for oil type stated. Wear results appear acceptable at this stage, further monitor results next sample.";
      case "Action":
        return "Please check and confirm oil type, make, and grade being used for future reference.";
      case "Critical":
        return "Immediate action required. Confirm oil type, make, and grade. Investigate equipment condition.";
      default:
        return "Evaluation not available.";
    }
  }
  
  function generateRecommendation(status: string): string {
    switch (status) {
      case "Normal":
        return "Continue monitoring as usual.";
      case "Query":
        return "Check oil type, make, and grade. Review KAL Job details.";
      case "Caution":
        return "Investigate viscosity increase and confirm oil type. Monitor for wear trends.";
      case "Action":
        return "Take corrective action to address abnormalities.";
      case "Critical":
        return "Stop operation and inspect equipment immediately.";
      default:
        return "Recommendation not available.";
    }
  }
  
  function generateDataRow(status: string, dateOffset: number): Record<string, any> {
    const elements = Array.from({ length: 27 }, (_, i) =>
      i === 21 ? "<0.1" : generateRandomElement()
    );
  
    // Calculate the date
    const date = new Date();
    date.setDate(date.getDate() - dateOffset);
    const formattedDate = date.toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
  
    return {
      date: formattedDate,
      unit: Math.floor(1000 + Math.random() * 9000), // Random 4-digit number
      comp: Math.floor(1000 + Math.random() * 9000), // Random 4-digit number
      oil: Math.floor(200 + Math.random() * 100), // Oil value: 200-300
      changed: Math.random() > 0.5 ? "Y" : "N", // Randomly "Y" or "N"
      status, // Passed status
      elements, // Generated elements
      evaluation: generateEvaluation(status), // Evaluation string
      recommendation: generateRecommendation(status), // Recommendation string
    };
  }
  
  const status = [
    'Normal',
    'Query',
    'Caution',
    'Action',
    'Critical'
  ]

  const [data, setData] = useState<any[]>([])

  const statusColors: { [key: string]: string } = {
    Normal: "success",
    Query: "info",
    Caution: "warning",
    Action: "secondary",
    Critical: "danger",
  };
  const navigate = useNavigate();
  const location = useLocation();
  const rowData = location.state?.rowData; // Access the state passed via navigate.
  const { machineId, filterDate } = useParams();
  const [filtered, setFiltered] = useState<any>(null)
  const selectedData = useMemo(() => {
    let _rowData
    const defaultMachineId = machineId
      ? machineId.startsWith("DT10") // Check if it starts with DT101, DT102, etc.
        ? "HD765"
        : machineId.startsWith("DT12") // Check if it starts with DT121, DT122, etc.
        ? "HD1500"
        : machineId // Use the original value if it doesn't match the conditions
      : "HD765"; // Default to HD765 if `machineId` is undefined or empty
    if (!rowData || rowData === undefined) {
      const date = new Date();
      const formattedDate = date.toLocaleDateString("en-GB");
      _rowData = {
        "key": machineId,
        "machineId": machineId,
        "viscosity": "Low",
        "wearMetals": formattedDate,
        "waterContent": "Optimal",
        "status": "Normal",
        "defaultMachineId": defaultMachineId
    }
    }
    else{
      _rowData = rowData
    }
    _rowData.defaultMachineId = defaultMachineId

    const data = status.map((status, index) => generateDataRow(status, index));
    setData(data)
    setFiltered(null)
    return _rowData
  }, [rowData])

  useEffect(() => {
    if (!startDate || startDate === '') {
      setFiltered(null)
      navigate(`/oil-analysis/${selectedData.machineId}`, {state: {selectedData}});
      return
    }
    navigate(`/oil-analysis/${selectedData.machineId}/${dayjs(startDate).format('YYYY-MM-DD')}`, {state: {selectedData}});
    // Parse `startDate` into a Date object
    const convertToISOFormat = (dateString: string): string => {
      const [day, month, year] = dateString.split("/").map(Number);
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    };
    // Filter the data
    const filteredData = data.filter((row) => {
      const rowDate = dayjs(row.date, "DD/MM/YYYY"); // Parse row date in the given format
      return rowDate.isSame(startDate, "day"); // Compare only the day
    });
    setFiltered(filteredData.length > 0 ? filteredData[0] : null);
  }, [startDate, data])

  const filters = {
    model: [
      {
        label: "HD1500",
        value: "HD1500",
      },
      {
        label: "HD785",
        value: "HD785",
      },
    ],
    fleet: [
      {
        label: "Fleet1",
        value: "EX201",
      },
      {
        label: "Fleet2",
        value: "EX202",
      },
      {
        label: "Fleet3",
        value: "EX205",
      },
    ],
  };

  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: string[];
  }>({ "model": ['HD1500', 'HD785'] });
  const onApply = useCallback(() => {
    if (Object.keys(selectedValues).length === 0) return
  }, [selectedValues])

  const [displayType, setDisplayType] = useState<string>("oil");
  const onDisplayTypeChange = (displayInfo: string) => {
    setDisplayType(displayInfo);
  };

  const handleClick = (id) => {
    const filteredData = data.filter((row, index) => {
      return index === id
    });
    if (filteredData.length > 0) {
      console.log(filteredData[0].date)
      setStartDate(dayjs(filteredData[0].date, 'DD/MM/YYYY').format('YYYY-MM-DD'))

    }
    setFiltered(filteredData.length > 0 ? filteredData[0] : null);
  }
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb onClick={() => setFiltered(null)} title="Fleet Maintenance / Oil Analysis" link={`../oil-analysis`} breadcrumbItem="Report" />
          <Row className="justify-content-end mb-2">
            <Col md={4} xs={12} lg={3} className="d-flex" style={{alignItems: 'center', justifyContent: 'flex-end'}}>
              {/* <DatePicker allowClear={true} value={startDate} style={{ width: "100%", minWidth: '150px' }} onChange={(value) => setStartDate(value)} /> */}
              <SearchDropdown
                itemsGroup={filters}
                disableTitle={false}
                disableDivider={false}
                onApply={onApply}
                selectedValues={selectedValues}
                setSelectedValues={setSelectedValues}
              />
              <div className="export" style={{marginLeft: '1rem'}}>
                <Button>
                  Export
                  <UploadOutlined />
                </Button>
              </div>
              </Col>
          </Row>
          <Card>
            <Row className="mt-2 report-dashboard" style={{fontSize: '14px', paddingLeft: '1rem', paddingRight: '1rem'}}>
                {/* Machine Info Header */}
                <Col md={4}>
                  <div className="d-flex justify-between mt-4 mb-4">
                    <span className="text-gray-400">Machine ID</span>
                    <div className="title">{selectedData.machineId || 'DT101'}</div>
                  </div>
                  <div className="d-flex justify-between mt-4 mb-4">
                    <span className="text-gray-400">Model Number</span>
                    <div className="title">{selectedData.defaultMachineId}</div>
                  </div>
                  <div className="d-flex justify-between mt-4 mb-4">
                    <span className="text-gray-400">Compartment</span>
                    <div className="title">Differential Front</div>
                  </div>
                </Col>
                
                <Col md={4}>
                  <div className="d-flex justify-between mt-4 mb-4">
                    <span className="text-gray-400">Operator Name</span>
                    <div className="title">{Math.random() < 0.5 ? 'J. Thompson' : 'T. Smith'}</div>
                  </div>
                  <div className="d-flex justify-between mt-4 mb-4">
                    <span className="text-gray-400">Serial Number</span>
                    <div className="title">12345678</div>
                  </div>
                  <div className="d-flex justify-between mt-4 mb-4">
                    <span className="text-gray-400">Registration</span>
                    <div className="title">7659903322</div>
                  </div>
                </Col>
                
                <Col md={4}>
                  <div className="d-flex justify-between mt-4 mb-4">
                    <span className="text-gray-400">Site</span>
                    <div className="title">WASTE DUMP</div>
                  </div>
                  <div className="d-flex justify-between mt-4 mb-4">
                    <span className="text-gray-400">Unit Hrs</span>
                    <div className="title">78690</div>
                  </div>
                  <div className="d-flex justify-between mt-4 mb-4">
                    <span className="text-gray-400">Operating Hrs</span>
                    <div className="title">9:00 - 17:00</div>
                  </div>
                </Col>
              </Row>
              <Row className="mt-4">
                {/* Measurements Table */}
                <div className="hierarchy-table-container card">
                  <table className="">
                        <thead>
                          <tr>
                            <th className="no-background" style={{width: '8%'}} rowSpan={2}>
                              {
                                filtered && <Button size="small" onClick={() => {setFiltered(null); setStartDate('')}}>
                                  Go to list
                                  <BackwardOutlined />
                                </Button>
                              }
                            </th>
                            <th className="no-background" colSpan={13}>Elements - Parts Per Million (ppm)</th>
                            <th className="no-background" colSpan={3}>Particles</th>
                            <th className="no-background" colSpan={5}>Physicals</th>
                            <th className="no-background" colSpan={2}>Consumption</th>
                          </tr>
                          </thead>
                  </table>

                  {!filtered && data.map((item: any, index) => (
                    <div key={index} className="hierarchy-table" onClick={() => handleClick(index)}>
                      <table className="main-table">
                        <thead>
                        </thead>
                        <tbody>
                          <tr>
                            <td rowSpan={2} colSpan={2}>
                              <div className="d-flex" style={{flexDirection: 'column', border: '1px solid grey'}}>
                                <div style={{background: '#535E77'}}>Date</div>
                                <div>{item.date}</div>
                              </div>
                              <div>Hours</div>
                            </td>
                            <td>Fe</td>
                            <td>Pb</td>
                            <td>Cu</td>
                            <td>Cr</td>
                            <td>Al</td>
                            <td>Si</td>
                            <td>Na</td>
                            <td>K</td>
                            <td>Mo</td>
                            <td>Mg</td>
                            <td>Zn</td>
                            <td>P</td>
                            <td>Ca</td>
                            <td>B</td>
                            <td>ISO</td>
                            <td>PQ</td>
                            <td>Soot</td>
                            <td>Oxi</td>
                            <td>Nit</td>
                            <td>Sul</td>
                            <td>VI100</td>
                            <td>Water</td>
                            <td>KF</td>
                            <td>Fuel</td>
                            <td>TAN</td>
                            <td>TBN</td>
                            <td>Oil</td>
                            <td style={{minWidth: '140px', padding: 0}} rowSpan={6}>
                              <div className={`table-status-panel ${item.status.toLowerCase()}`}>
                                {
                                  status.map(st => {
                                    return <div className={`table-status ${st === item.status ? item.status.toLowerCase() : ''}`}>{st}</div>
                                  })
                                }
                              </div>
                            </td>
                          </tr>
                          <tr>
                            {item.elements.map((val, idx) => (
                              <td key={idx}>{val}</td>
                            ))}
                          </tr>
                          <tr>
                            <td style={{background: '#535E77'}}>Unit</td>
                            <td style={{width: '8%'}}>{item.unit}</td>
                            <td colSpan={11}  style={{width: '35%'}}>Evaluation</td>
                            <td colSpan={4} style={{width: '15%'}}>Oil Information</td>
                            <td colSpan={12} style={{width: '35%'}}>Recommendaton</td>
                          </tr>
                          <tr>
                            <td style={{background: '#535E77'}}>Comp</td>
                            <td>{item.comp}</td>
                            <td colSpan={11} rowSpan={3}><div>{item.evaluation}</div></td>
                            <td colSpan={4}>Make: SINOPEC</td>
                            <td colSpan={12} rowSpan={3}>{item.recommendation}</td>
                          </tr>
                          <tr>
                            <td style={{background: '#535E77'}}>Oil</td>
                            <td>{item.oil}</td>
                            <td colSpan={4}>Type: ?</td>
                          </tr>
                          <tr>
                            <td style={{background: '#535E77'}}>Changed</td>
                            <td>{item.changed}</td>
                            <td colSpan={4}>Grade: 10W30</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))}
                  {
                    filtered && <div key={-1} className="hierarchy-table">
                    <table className="main-table">
                      <thead>
                      </thead>
                      <tbody>
                        <tr>
                          <td rowSpan={2} colSpan={2}>
                            <div className="d-flex" style={{flexDirection: 'column', border: '1px solid grey'}}>
                              <div style={{background: '#535E77'}}>Date</div>
                              <div>{filtered.date}</div>
                            </div>
                            <div>Hours</div>
                          </td>
                          <td>Fe</td>
                          <td>Pb</td>
                          <td>Cu</td>
                          <td>Cr</td>
                          <td>Al</td>
                          <td>Si</td>
                          <td>Na</td>
                          <td>K</td>
                          <td>Mo</td>
                          <td>Mg</td>
                          <td>Zn</td>
                          <td>P</td>
                          <td>Ca</td>
                          <td>B</td>
                          <td>ISO</td>
                          <td>PQ</td>
                          <td>Soot</td>
                          <td>Oxi</td>
                          <td>Nit</td>
                          <td>Sul</td>
                          <td>VI100</td>
                          <td>Water</td>
                          <td>KF</td>
                          <td>Fuel</td>
                          <td>TAN</td>
                          <td>TBN</td>
                          <td>Oil</td>
                          <td style={{minWidth: '140px', padding: 0}} rowSpan={6}>
                            <div className={`table-status-panel ${filtered.status.toLowerCase()}`}>
                              {
                                status.map(st => {
                                  return <div className={`table-status ${st === filtered.status ? filtered.status.toLowerCase() : ''}`}>{st}</div>
                                })
                              }
                            </div>
                          </td>
                        </tr>
                        <tr>
                          {filtered.elements.map((val, idx) => (
                            <td key={idx}>{val}</td>
                          ))}
                        </tr>
                        <tr>
                          <td style={{background: '#535E77'}}>Unit</td>
                          <td>{filtered.unit}</td>
                          <td colSpan={11}>Evaluation</td>
                          <td colSpan={4}>Oil Information</td>
                          <td colSpan={12}>Recommendaton</td>
                        </tr>
                        <tr>
                          <td style={{background: '#535E77'}}>Comp</td>
                          <td>{filtered.comp}</td>
                          <td colSpan={11} rowSpan={3}><div>{filtered.evaluation}</div></td>
                          <td colSpan={4}>Make: SINOPEC</td>
                          <td colSpan={12} rowSpan={3}>{filtered.recommendation}</td>
                        </tr>
                        <tr>
                          <td style={{background: '#535E77'}}>Oil</td>
                          <td>{filtered.oil}</td>
                          <td colSpan={4}>Type: ?</td>
                        </tr>
                        <tr>
                          <td style={{background: '#535E77'}}>Changed</td>
                          <td>{filtered.changed}</td>
                          <td colSpan={4}>Grade: 10W30</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  }
                </div>
            </Row>
          </Card>
          {
            filtered && 
            <>
                <Row className="mb-3">
                  <Col className="d-flex">
                    <Segmented
                      className="customSegmentLabel customSegmentBackground"
                      value={displayType}
                      onChange={onDisplayTypeChange}
                      options={[
                        { value: "oil", label: "Oil Analysis Data" },
                        { value: "event", label: "Event Details" },
                      ]}
                    />
                  </Col>
                </Row>
                <Row className="mt-2">
                  {
                    displayType === 'oil' ?
                    <OilAnalysisData />
                    :
                    <EventDetail />
                  }
                </Row>
            </>
          }
        </Container>

      </div>
    </React.Fragment>
  );
};

export default OilAnalysisReportPage;
