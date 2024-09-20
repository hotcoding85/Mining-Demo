import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import TableContainer from "Components/Common/TableContainer";
import { HaulRoadData, IntelligenceReport } from "./interfaces";
import { haulRoadReport } from "./sampleData";
import { Segmented, Space } from "antd";
import { getRandomInt } from "utils/random";
import { minutesToHhMm } from "utils/common";
import "./style.scss";

const HaulRoadIntelligence = (props: any) => {
    document.title = "Haul Road Intelligence | FMS Live";

    const [loadCycleList, setLoadCycleList] = useState<HaulRoadData[]>([]);
    const [loadCycleRows, setLoadCycleRows] = useState<IntelligenceReport[]>([]);
    const [totalData, setTotalData] = useState<any>({});
    const [filter, setFilter] = useState<string>("HD785-7");

    const getTimeDifference = (actualTime: string, mineIdeal: string) =>  {
        const [startHours, startMinutes] = actualTime.split(':').map(Number);
        const [endHours, endMinutes] = mineIdeal.split(':').map(Number);

        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;

        let differenceInMinutes = startTotalMinutes - endTotalMinutes;

        return differenceInMinutes;
    }

    const getHaulRoadReport = () => {
       let loadCycleData =  loadCycleList?.map((haulRoadData) => {

        let actualSiteAverage =  "";

        if(haulRoadData.cycleActivities === "Spotting at Loading"){
            actualSiteAverage = getDifference(50, 75);
        }

        if(haulRoadData.cycleActivities === "Loading"){
            actualSiteAverage = getDifference(250, 350);
        }

        if(haulRoadData.cycleActivities === "Hauling Full"){
            actualSiteAverage = getDifference(530, 720);
        }

        if(haulRoadData.cycleActivities === "Tipping"){
            actualSiteAverage = getDifference(85, 150);
        }

        if(haulRoadData.cycleActivities === "Travel Empty"){
            actualSiteAverage = getDifference(380, 540);
        }

        if(haulRoadData.cycleActivities === "Queuing"){
            actualSiteAverage = getDifference(0, 120);
        }

        let deviation = getTimeDifference(
            actualSiteAverage,
            haulRoadData.mineIdeal
          );

        return { ...haulRoadData, actualSiteAverage, deviation:minutesToHhMm(deviation) };
      });

      setLoadCycleRows(loadCycleData);
     let totalsOfRow = calculateTotals(loadCycleData);
     setTotalData(totalsOfRow);
    };

    const convertToSeconds = (timeString) => {
        const parts = timeString.split(':').map(Number);
        return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0];
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
            totalActualSiteAverage += convertToSeconds(item.actualSiteAverage);
            totalMineIdeal += convertToSeconds(item.mineIdeal);
            totalDeviation += convertToSeconds(item.deviation);
        });
    
        return {
            totalCycleActivities: "Total",
            totalActualSiteAverage: convertToTimeString(totalActualSiteAverage),
            totalMineIdeal: convertToTimeString(totalMineIdeal),
            totalDeviation: convertToTimeString(totalDeviation),
        };
    }
    
    const getDifference = (min, max) => {
        let value = getRandomInt(min, max);
        const time = minutesToHhMm(Math.round(value));
        return time;
    }

    const columns: any[] = useMemo(
        () => [
          {
            header: "Cycle Activities",
            accessorKey: "cycleActivities",
            enableColumnFilter: false,
            enableSorting: true,
            footer: "Total"
          },
          {
            header: "Actual Site Average",
            accessorKey: "actualSiteAverage",
            enableColumnFilter: false,
            enableSorting: true,
             footer: totalData['totalActualSiteAverage']
          },
          {
            header: "Mine ideal",
            accessorKey: "mineIdeal",
            enableColumnFilter: false,
            enableSorting: true,
             footer: totalData['totalMineIdeal']
          },
          {
            header: "Deviation",
            accessorKey: "deviation",
            enableColumnFilter: false,
            enableSorting: true,
            footer: totalData['totalDeviation']
          },
        ], [totalData])

    useEffect(() => {
        setLoadCycleList(haulRoadReport);
    },[]);

    useEffect(() => {
        getHaulRoadReport();
    },[loadCycleList, haulRoadReport, filter])

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid className="haul-road-wrapper">
                    <Breadcrumb title="Mine Dynamics" breadcrumbItem="Haul Road Intelligence" />
                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="haulroad-summary-title">Haul Road Intelligence</div>
                                        <div className="d-flex justify-content-end align-items-center gap-3">
                                            <Row>
                                                <Col md="12" className='mb-4 d-flex flex-row-reverse'>
                                                    <Space>
                                                        <Segmented className="customSegmentLabel customSegmentBackground" value={filter} onChange={(e) => setFilter(e)} options={["HD785-7", { label: 'HD1500-7', value: 'HD1500-7' }, { label: 'HD1500-8', value: 'HD1500-8' }]} />
                                                    </Space>
                                                </Col>
                                            </Row>
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
                </Container>
            </div>
        </React.Fragment >
    )
}

export default HaulRoadIntelligence;