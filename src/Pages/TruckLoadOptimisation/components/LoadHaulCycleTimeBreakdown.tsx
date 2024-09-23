import React, { useEffect, useMemo, useState } from "react";
import {
  Card, CardBody, Col, Row, Button,
} from "reactstrap";
import { Input } from "antd";
import { SearchOutlined, UploadOutlined } from "@ant-design/icons";
import TableContainer from "Components/Common/TableContainer";
import { getRandomInt } from "utils/random";
import { minutesToHhMm } from "utils/common";
import { LoadHaulCycleTimeBreakdownData, LoadHaulCycleTimeBreakdownReport } from "../interfaces";
import { SearchDropdown } from "Components/Common/Dropdown";
import "../styles/loadTruckCycle.scss";
import { loadHaulCycleTimeBreakdownReport } from "../data/sampleData";

const LoadHaulCycleTimeBreakdown = (props: any) => {
  const [totalData, setTotalData] = useState<any>({});

  const [loadCycleList, setLoadCycleList] = useState<LoadHaulCycleTimeBreakdownData[]>([]);

  const [loadCycleRows, setLoadCycleRows] = useState<LoadHaulCycleTimeBreakdownReport[]>([]);

  const [globalFilter, setGlobalFilter] = useState<string>("");

  const getDifference = (min, max) => {
    let value = getRandomInt(min, max);
    const time = minutesToHhMm(Math.round(value));
    return time;
  }

  const getDeviationVaulue = (actualTime: string, mineIdeal: string) => {
    const [startHours, startMinutes] = actualTime.split(':').map(Number);
    const [endHours, endMinutes] = mineIdeal.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    let differenceInMinutes = startTotalMinutes - endTotalMinutes;

    const absoluteDifference = Math.abs(differenceInMinutes);
    const hours = Math.floor(absoluteDifference / 60);
    const minutes = absoluteDifference % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');

    return differenceInMinutes < 0
      ? `- ${formattedHours}:${formattedMinutes}`
      : `${formattedHours}:${formattedMinutes}`;
  };

  const convertToSeconds = (timeString) => {
    const parts = timeString.split(':').map(Number);
    return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0];
  }

  const handleConvertSeconds = (timeString) => {
    const isNegative = timeString.trim().startsWith('-');
    const timeInSeconds = convertToSeconds(timeString.replace('-', '').trim());

    return isNegative ? -timeInSeconds : timeInSeconds;
  }

  const convertToTimeString = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  const calculateTotals = (data) => {
    let totalActualSiteAverage = 0;
    let totalMineIdeal = 0;
    let totalDeviation = 0;

    data.forEach(item => {
      totalActualSiteAverage += handleConvertSeconds(item.actualSiteAverage);
      totalMineIdeal += handleConvertSeconds(item.mineIdeal);
      totalDeviation += handleConvertSeconds(item.deviation);
    });

    return {
      totalCycleActivities: "Total",
      totalActualSiteAverage: convertToTimeString(totalActualSiteAverage),
      totalMineIdeal: convertToTimeString(totalMineIdeal),
      totalDeviation: convertToTimeString(totalDeviation),
    };
  }


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
    let totalsOfRow = calculateTotals(loadCycleData);
    setTotalData(totalsOfRow);
  };
  const columns: any[] = useMemo(
    () => [
      {
        header: "Cycle Activities",
        accessorKey: "cycleActivities",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Actual Site Average",
        accessorKey: "actualSiteAverage",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Mine ideal",
        accessorKey: "mineIdeal",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Deviation",
        accessorKey: "deviation",
        enableColumnFilter: false,
        enableSorting: true,
      },
    ], [totalData])

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
  }, [loadCycleList, loadHaulCycleTimeBreakdownReport])
  return (
    <React.Fragment>
      <Row className="haul-timebreakdown">
        <Col lg="12">
          <Card>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div className="haulroad-summary-title">Load Haul Cycle Time Breakdown</div>
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
              <TableContainer
                columns={columns}
                data={loadCycleRows || []}
                isImportButton={false}
                isFooter={true}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>)
}

export default LoadHaulCycleTimeBreakdown;