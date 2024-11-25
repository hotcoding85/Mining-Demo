import React, { useCallback, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import AlertsSection from "./AlertsSection";
import {DatePicker} from "antd";
import SearchDropdown from "./../TruckLoadOptimisation/components/SearchDropdown";
import OilAnalysisTable from "./OilAnalysisTable";
import { Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { ArrowUp, ArrowDown } from 'lucide-react'
import MessagesPanel from "./MessagePanel";
import dayjs from "dayjs";
const OilAnalysis = (props: any) => {
  document.title = "Oil Analysis | FMS Live";
  const [startDate, setStartDate] = React.useState<any>(new Date());
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
  const [selectedData, setSelectedData] = useState<any>(null);
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Fleet Maintenance" breadcrumbItem="Oil Analysis" />
          <Row className="justify-content-end mb-2">
            <Col md={4} xs={12} lg={3} className="d-flex" style={{alignItems: 'center', justifyContent: 'flex-end'}}>
              <DatePicker allowClear={false} value={dayjs(startDate)} style={{ width: "100%", minWidth: '150px' }}  onChange={(value: any) => setStartDate(value.$d)} />
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
          <Row>
            <Col md={9} sm={8} xs={12}>
              <Row>
                <Card>
                  <Col lg="12" style={{ paddingLeft: "1rem", paddingTop: '1rem' }}>
                    <div className="bg-[#1a2234] p-6 rounded-lg">
                      <h2 className="text-2xl mb-4">Summary</h2>
                      <Row>
                        <Col md={4}>
                          <Card className="bg-[#232b3e] border-0">
                            <CardBody className="p-4 oil-analysis-summary-item">
                              <div className="text-gray-400 mb-2 title">Total Machines</div>
                              <div className="flex items-center justify-between report">
                                <span className="text-[#4caf50] text-4xl font-bold up">50</span>
                                <div className="d-flex items-center text-[#4caf50] progress up">
                                  <ArrowUp className="w-4 h-4 up" />
                                  <span className="ml-1">0.85%</span>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                        <Col md={4}>
                          <Card className="bg-[#232b3e] border-0">
                            <CardBody className="p-4 oil-analysis-summary-item">
                              <div className="text-gray-400 mb-2 title">Critical Machines</div>
                              <div className="flex items-center justify-between report ">
                                <span className="text-[#f44336] text-4xl font-bold below">5</span>
                                <div className="d-flex items-center text-[#f44336] progress below">
                                  <ArrowDown className="w-4 h-4 below" />
                                  <span className="ml-1">2.15%</span>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                        <Col md={4}>
                          <Card className="bg-[#232b3e] border-0">
                            <CardBody className="p-4 oil-analysis-summary-item">
                              <div className="text-gray-400 mb-2 title">Scheduled Maintenance</div>
                              <div className="flex items-center justify-between report">
                                <span className="text-[#4caf50] text-4xl font-bold up">15</span>
                                <div className="d-flex items-center text-[#4caf50] progress up">
                                  <ArrowUp className="w-2 h-2 up" />
                                  <span className="ml-1">3.45%</span>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Card>
              </Row>
              <OilAnalysisTable startDate={startDate} selectedData={selectedData} setSelectedData={setSelectedData} />
            </Col>
            <Col md={3} sm={4} xs={12}>
              <MessagesPanel />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default OilAnalysis;
