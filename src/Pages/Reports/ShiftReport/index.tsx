import { Fragment, useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Button, DatePicker, Segmented, Space } from "antd";
import dayjs from "dayjs";
import { saveFile, shiftTimings, shiftTimingsByDateandShift, shifts, shiftsInFormat } from "utils/common";
import { ShiftTimingsInfo } from "Models/Shift";
import { getShiftReportData } from "Helpers/api_events_helper";
import MaterialTonnes from "./MaterialTonnes";
import EquipmentReport from "./EquipmentReport";
import { DownloadOutlined } from '@ant-design/icons';
import { downloadShiftReport } from "Helpers/api_reports_helper";
import Notification from "Components/Common/Notification";
import { useSearchParams } from "react-router-dom";
import VehicleReasons from "./VehicleReasons";
import { chain } from "lodash";

const ShiftReport = () => {
    document.title = "Reports | Shift Report";

    const [searchParams, setSearchParams] = useSearchParams();
    const [shiftDetails, setShiftDetails] = useState<ShiftTimingsInfo>(shiftTimings());
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [reportData, setReportData] = useState({
        materialData: [],
        materialCategories: [],
        reportData: [],
        stateReason: []
    });

    useEffect(() => {
        const params: URLSearchParams = new URLSearchParams({ shift: shiftDetails.shift, date: shiftDetails.shiftDate });
        setSearchParams(params);

        getReportData(shiftDetails.shiftDate, shiftDetails.shift);
    }, [shiftDetails.shiftDate, shiftDetails.shift]);

    const getReportData = (shiftDate: string, shift: string) => {
        getShiftReportData(`${shiftDate}:${shift}`, ['DELAY', 'STANDBY'])
            // getShiftReportData("2024-08-05:NS", ['DELAY', 'STANDBY'])
            .then((response) => {
                setReportData(response);
            }).catch((error) => {
                console.error(error);
            })
    }

    const downloadReport = () => {
        downloadShiftReport(`${shiftDetails.shiftDate}:${shiftDetails.shift}`)
            .then((response) => {
                if (response.status === false) {
                    setErrorMessage(response.message);
                } else {
                    saveFile(response, `SHIFT REPORT - ${shiftDetails.shiftDate} - ${shiftDetails.shift}.pdf`)
                }
            }).catch((error) => {
                console.error(error);
            })
    }

    const onShiftDateChange = (date: dayjs.Dayjs): void => {
        const newShiftTimings: ShiftTimingsInfo = shiftTimingsByDateandShift(date.format('YYYY-MM-DD'), shiftDetails.shift);
        setShiftDetails((prevState: ShiftTimingsInfo) => {
            return {
                ...prevState,
                ...newShiftTimings
            }
        })
    }

    const onShiftChange = (shift: string): void => {
        const newShiftTimings: ShiftTimingsInfo = shiftTimingsByDateandShift(shiftDetails.shiftDate, shift);
        setShiftDetails((prevState: ShiftTimingsInfo) => {
            return {
                ...prevState,
                ...newShiftTimings
            }
        })
    }

    const getStateVehicleReasons = (state: string) => {
        if (!reportData.stateReason || reportData.stateReason.length === 0) {
            return [];
        }

        let data = chain(reportData.stateReason).filter((item: any) => item.state === state).orderBy([(x: any) => x.vehicleName.toLowerCase()]).value();
        return data;
    }

    return (
        <Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Reports" breadcrumbItem="Shift Report" />
                    <Row className='mb-3'>
                        <Col className='d-flex flex-row-reverse'>
                            <Space>
                                <DatePicker allowClear={false} value={shiftDetails.start} onChange={onShiftDateChange} />
                                <Segmented className="customSegmentLabel customSegmentBackground" value={shiftDetails.shift} onChange={onShiftChange} options={shiftsInFormat(shifts)} />
                                <Button shape="circle" icon={<DownloadOutlined />} onClick={downloadReport} />
                            </Space>
                        </Col>
                    </Row>
                    <MaterialTonnes
                        materialData={reportData.materialData || []}
                    />
                    <EquipmentReport
                        materialCategories={reportData.materialCategories || []}
                        reportData={reportData.reportData || []}
                    />
                    <VehicleReasons
                        title={'Delay Reasons'}
                        data={getStateVehicleReasons('DELAY')}
                    />
                    <VehicleReasons
                        title={'Standby Reasons'}
                        data={getStateVehicleReasons('STANDBY')}
                    />
                </Container>
                <Notification
                    type={"error"}
                    message={errorMessage}
                    onClose={() => setErrorMessage("")}
                />
            </div>
        </Fragment>
    )
}

export default ShiftReport;