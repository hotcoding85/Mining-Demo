import React, { useEffect, useState } from "react";
import { Card, CardBody, Col, Row, Button } from "reactstrap";
import { Input } from "antd";
import { SearchOutlined, UploadOutlined } from "@ant-design/icons";
import { getRandomInt } from "utils/random";
import { minutesToHhMm } from "utils/common";
import {
  LoadHaulCycleTimeBreakdownData,
  LoadHaulCycleTimeBreakdownReport,
} from "../interfaces";
import { SearchDropdown } from "Components/Common/Dropdown";
import "../styles/loadTruckCycle.scss";
import { loadHaulCycleTimeBreakdownReport } from "../data/sampleData";
import Table from "Components/Common/Table";

const LoadHaulCycleTimeBreakdown = (props: any) => {
  const [loadCycleList, setLoadCycleList] = useState<
    LoadHaulCycleTimeBreakdownData[]
  >([]);

  const [loadCycleRows, setLoadCycleRows] = useState<
    LoadHaulCycleTimeBreakdownReport[]
  >([]);

  const [globalFilter, setGlobalFilter] = useState<string>("");

  const getDifference = (min, max) => {
    let value = getRandomInt(min, max);
    const time = minutesToHhMm(Math.round(value));
    return time;
  };

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

  const columns = [
    {
      title: "Fleet",
      dataIndex: "fleet",
      key: "fleet",
      dataType: "string",
    },
    {
      title: "Cycle Activities",
      dataIndex: "cycleActivities",
      key: "cycleActivities",
      dataType: "string",
    },
    {
      title: "Target",
      dataIndex: "target",
      key: "target",
      dataType: "string",
    },
    {
      title: "Actual Site Average",
      dataIndex: "actualSiteAverage",
      key: "actualSiteAverage",
      dataType: "string",
    },
    {
      title: "Mine Ideal",
      dataIndex: "mineIdeal",
      key: "mineIdeal",
      dataType: "string",
    },
    {
      title: "Deviation",
      dataIndex: "deviation",
      key: "deviation",
      dataType: "string",
    },
  ];

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
        value: "TD001",
      },
      {
        label: "Fleet2",
        value: "TD002",
      },
      {
        label: "Fleet3",
        value: "TD003",
      },
    ],
  };

  useEffect(() => {
    setLoadCycleList(loadHaulCycleTimeBreakdownReport);
  }, []);

  useEffect(() => {
    getHaulRoadReport();
  }, [loadCycleList, loadHaulCycleTimeBreakdownReport]);
  return (
    <React.Fragment>
      <Row className="haul-timebreakdown">
        <Col lg="12">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div className="haulroad-summary-title">
                  Load Haul Cycle Time Breakdown
                </div>
                <div className="d-flex justify-content-end align-items-center gap-3">
                  <SearchDropdown itemsGroup={filters} />
                  <Button className="digging-csv-btn">
                    Export
                    <UploadOutlined />
                  </Button>
                  <Input
                    prefix={<SearchOutlined />}
                    value={globalFilter}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="trucking-summary-search"
                    placeholder="Search"
                  />
                </div>
              </div>
              <div className="mt-3">
                <Table
                  columns={columns}
                  data={loadCycleRows}
                  paginationPageSize={5}
                />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default LoadHaulCycleTimeBreakdown;
