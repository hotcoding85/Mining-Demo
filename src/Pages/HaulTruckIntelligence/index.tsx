import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { HaulRoadData, IntelligenceReport } from "./interfaces";
import { haulRoadReport } from "./sampleData";
import { Segmented, Space, Table as AntTable } from "antd";
import { getRandomInt } from "utils/random";
import { minutesToHhMm } from "utils/common";
import "./style.scss";
import Table from "Components/Common/Table";

const HaulTruckIntelligence = (props: any) => {
  document.title = "Haul Truck Intelligence | FMS Live";

  const [loadCycleList, setLoadCycleList] = useState<HaulRoadData[]>([]);
  const [loadCycleRows, setLoadCycleRows] = useState<IntelligenceReport[]>([]);
  const [filter, setFilter] = useState<string>("HD785-7");

  const getDeviationVaulue = (actualTime: string, mineIdeal: string) => {
    const [startHours, startMinutes] = actualTime.split(":").map(Number);
    const [endHours, endMinutes] = mineIdeal.split(":").map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    let differenceInMinutes = startTotalMinutes - endTotalMinutes;

    const absoluteDifference = Math.abs(differenceInMinutes);
    const hours = Math.floor(absoluteDifference / 60);
    const minutes = absoluteDifference % 60;

    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");

    return differenceInMinutes < 0
      ? `- ${formattedHours}:${formattedMinutes}`
      : `${formattedHours}:${formattedMinutes}`;
  };

  const getHaulRoadReport = () => {
    let loadCycleData = loadCycleList?.map((haulRoadData) => {
      let actualSiteAverage = "";

      if (haulRoadData.cycleActivities === "Spotting at Loading") {
        actualSiteAverage = getDifference(50, 75);
      }

      if (haulRoadData.cycleActivities === "Loading") {
        actualSiteAverage = getDifference(250, 350);
      }

      if (haulRoadData.cycleActivities === "Hauling Full") {
        actualSiteAverage = getDifference(530, 720);
      }

      if (haulRoadData.cycleActivities === "Tipping") {
        actualSiteAverage = getDifference(85, 150);
      }

      if (haulRoadData.cycleActivities === "Travel Empty") {
        actualSiteAverage = getDifference(380, 540);
      }

      if (haulRoadData.cycleActivities === "Queuing") {
        actualSiteAverage = getDifference(0, 120);
      }

      let deviation = getDeviationVaulue(
        actualSiteAverage,
        haulRoadData.mineIdeal
      );

      return { ...haulRoadData, actualSiteAverage, deviation };
    });

    setLoadCycleRows(loadCycleData);
  };

  const convertToSeconds = (timeString) => {
    const parts = timeString.split(":").map(Number);
    return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0];
  };

  const convertToTimeString = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const calculateTotals = (data) => {
    let totalActualSiteAverage = 0;
    let totalMineIdeal = 0;
    let totalDeviation = 0;

    data.forEach((item) => {
      totalActualSiteAverage += handleConvertSeconds(item.actualSiteAverage);
      totalMineIdeal += handleConvertSeconds(item.mineIdeal);
      totalDeviation += handleConvertSeconds(item.deviation);
    });

    return (
      <AntTable.Summary.Row style={{ textAlign: "center" }}>
        <AntTable.Summary.Cell index={0}>Total</AntTable.Summary.Cell>
        <AntTable.Summary.Cell index={1}>
          {convertToTimeString(totalActualSiteAverage)}
        </AntTable.Summary.Cell>
        <AntTable.Summary.Cell index={2}>
          {convertToTimeString(totalMineIdeal)}
        </AntTable.Summary.Cell>
        <AntTable.Summary.Cell index={2}>
          {convertToTimeString(totalDeviation)}
        </AntTable.Summary.Cell>
      </AntTable.Summary.Row>
    );
  };

  const handleConvertSeconds = (timeString) => {
    const isNegative = timeString.trim().startsWith("-");
    const timeInSeconds = convertToSeconds(timeString.replace("-", "").trim());

    return isNegative ? -timeInSeconds : timeInSeconds;
  };

  const getDifference = (min, max) => {
    let value = getRandomInt(min, max);
    const time = minutesToHhMm(Math.round(value));
    return time;
  };

  const columns = useMemo(
    () => [
      {
        title: "Cycle Activities",
        key: "cycleActivities",
        dataIndex: "cycleActivities",
        dataType: "string",
        align: "center",
      },
      {
        title: "Actual Site Average",
        key: "actualSiteAverage",
        dataIndex: "actualSiteAverage",
        dataType: "string",
        align: "center",
      },
      {
        title: "Mine ideal",
        key: "mineIdeal",
        dataIndex: "mineIdeal",
        dataType: "string",
        align: "center",
      },
      {
        title: "Deviation",
        key: "deviation",
        dataIndex: "deviation",
        dataType: "string",
        align: "center",
      },
    ],
    []
  );

  useEffect(() => {
    setLoadCycleList(haulRoadReport);
  }, []);

  useEffect(() => {
    getHaulRoadReport();
  }, [loadCycleList, haulRoadReport, filter]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid className="haul-road-wrapper">
          <Breadcrumb
            title="Mine Dynamics"
            breadcrumbItem="Haul Truck Intelligence"
          />
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="haulroad-summary-title">
                      Haul Truck Intelligence
                    </div>
                    <div className="d-flex justify-content-end align-items-center gap-3">
                      <Row>
                        <Col md="12" className="mb-4 d-flex flex-row-reverse">
                          <Space>
                            <Segmented
                              className="customSegmentLabel customSegmentBackground"
                              value={filter}
                              onChange={(e) => setFilter(e)}
                              options={[
                                "HD785-7",
                                { label: "HD1500-7", value: "HD1500-7" },
                                { label: "HD1500-8", value: "HD1500-8" },
                              ]}
                            />
                          </Space>
                        </Col>
                      </Row>
                    </div>
                  </div>
                  <Table
                    columns={columns}
                    data={loadCycleRows}
                    summary={calculateTotals}
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

export default HaulTruckIntelligence;
