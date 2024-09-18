import React, { useState, useMemo } from "react";
import {
    Card, CardBody, Col, Container, Row, Nav, NavLink, NavItem, Table, Button, Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from "reactstrap";
import { Pagination, PaginationProps, Input, Tooltip } from "antd";
import { SearchOutlined, UploadOutlined } from "@ant-design/icons";
import Breadcrumb from "Components/Common/Breadcrumb";
import { SearchDropdown } from "Components/Common/Dropdown";
import { getRandomInt } from "utils/random";
import './index.css'



interface HaulRoadOptimizationTableRowProps {
    vehicleName: string;
    operatorName: string;
    status: string;
    dumpLocation: number;
    activeHours: string;
    targetHours: string;
    emptyRun: string;
    waitingLoadTime: string;
    loadingTime: string;
    haulingTime: string;
    avgCycleTime: string;
    payload: number;
    materialType: string;
    currentLoad: number;
    maximumLoad: number;
    speed: string;
    engineRPM: number;
    travelTime: string;
    pitch: string;
    alcometerDegrees: number;
    distance: number;
    altitudeChange: number;
    fuelRate: number;
}

const statusColors = {
    Active: "#389E0D",
    Standby: "#FAAD14",
    Delayed: "#722ED1",
    Down: "#CF1322"
};

const HaulRoadOptimizationTableRow: React.FC<HaulRoadOptimizationTableRowProps> = (
    props
) => {
    const getStatusDot = (status: string) => {
        const color = statusColors[status] || "gray";
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <span
                    style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: color,
                        display: 'inline-block',
                        marginRight: 8,
                    }}
                ></span>
                <span>{status}</span>
            </div>
        );
    };

    const truncateLocation = (location: string) => {
        if (location.length > 15) {
            return `${location.substring(0, 15)}...`;
        }
        return location;
    };
    return (
        <tr>
            <td width={104}>
                <div>{props.vehicleName}</div>
            </td>
            <td width={104}>
                <div>{props.operatorName}</div>
            </td>
            <td width={104}>
                <div>{getStatusDot(props.status)}</div>
            </td>
            <td width={104}>
                <div>{props.dumpLocation}</div>
            </td>
            <td width={104}>
                <div>{props.activeHours}</div>
            </td>
            <td width={104}>
                <div>{props.targetHours}</div>
            </td>
            <td width={104}>
                <div>{props.emptyRun}</div>
            </td>
            <td width={104}>
                <div>{props.waitingLoadTime}</div>
            </td>
            <td width={104}>
                <div>{props.loadingTime}</div>
            </td>
            <td width={104}>
                <div>{props.haulingTime}</div>
            </td>
            <td width={104}>
                <div>{props.avgCycleTime}</div>
            </td>
            <td width={104}>
                <div>{props.payload}</div>
            </td>
            <td width={104}>
                <div>{props.materialType}</div>
            </td>
            <td width={104}>
                <div>{props.currentLoad}</div>
            </td>
            <td width={104}>
                <div>{props.maximumLoad}</div>
            </td>
            <td width={104}>
                <div>{props.speed}</div>
            </td>
            <td width={104}>
                <div>{props.engineRPM}</div>
            </td>
            <td width={104}>
                <div>{props.travelTime}</div>
            </td>
            <td width={104}>
                <div>{props.pitch}</div>
            </td>
            <td width={104}>
                <div>{props.alcometerDegrees}</div>
            </td>
            <td width={104}>
                <div>{props.distance}</div>
            </td>
            <td width={104}>
                <div>{props.altitudeChange}</div>
            </td>
            <td width={104}>
                <div>{props.fuelRate}</div>
            </td>
        </tr>
    );
};

interface HaulRoadOptimization { }

const TableHeaders = [
    "Vehicle Name",
    "Operator Name",
    "Status",
    "Dump Location",
    "Active Hours",
    "Target Hours",
    "Empty Run",
    "Waiting Load Time",
    "Loading Time",
    "Hauling Time",
    "Avg Cycle Time",
    "Payload",
    "Material Type",
    "Current Load(Tonnes)",
    "MaximumLoad(Tonnes)",
    "Speed",
    "Engine RPM",
    "Travel Time",
    "Pitch",
    "Alcometer Degrees",
    "Distance",
    "Altitude Change",
    "Fuel Rate"
];




const TruckLoadOptimisation = (props: any) => {
    document.title = "Haul Road Optimisation | FMS Live";
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const statusOptions = ["Active", "Standby", "Delayed", "Down"];
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggle = () => setDropdownOpen((prevState) => !prevState);

    const tableData = useMemo(
        () =>
            [...new Array(5)].map((item, key) => ({
                vehicleName: "DT10" + key,
                operatorName: "James Taylor",
                status: statusOptions[getRandomInt(0, statusOptions.length - 1)],
                dumpLocation: getRandomInt(2500, 3000),
                activeHours: '00:00',  
                targetHours: '00:00',  
                emptyRun: '00:00',  
                waitingLoadTime: '00:00',  
                loadingTime: '00:00',  
                haulingTime: '00:00',  
                avgCycleTime: '00:00',  
                payload: 0,
                materialType: "Ore",
                currentLoad: getRandomInt(64, 80),
                maximumLoad: getRandomInt(80, 100),
                speed: 19.21 + " km/h",
                engineRPM: 1000,
                travelTime: '00:00',
                pitch: '0',
                alcometerDegrees: 0,
                distance: 0,
                altitudeChange: 0,
                fuelRate: 0,
            })),
        []
    );

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

    const onChange: PaginationProps["onChange"] = (pageNumber) => {
        console.log("Page: ", pageNumber);
    };


    return (
        <React.Fragment>
            <div className="page-content col-lg-12">
                <Container fluid>
                    <Breadcrumb title="Mine Dynamics" breadcrumbItem="Truck Load Optimisation" />
                    <Row>
                        <Col lg="12">
                            <Nav>
                                <NavItem>
                                    <NavLink
                                        active
                                        href="#haulroad-summary-tableview"
                                    >
                                        Table View
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink href="#haulroad-summary-mapview">
                                        Map View
                                    </NavLink>
                                </NavItem>
                            </Nav>
                        </Col>
                    </Row>
                </Container>
            
            <Card className="haulroad-summary" id="haulroad-summary-tableview">
                <CardBody>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="haulroad-summary-title">Haul Road Optimization</div>
                        <div className="d-flex justify-content-end align-items-center gap-3">
                            <SearchDropdown itemsGroup={filters} />
                            <div className="export">
                                <Button>
                                    Export
                                    <UploadOutlined />
                                </Button>
                            </div>
                            <Dropdown isOpen={dropdownOpen} toggle={toggle} {...props}>
                                <DropdownToggle caret size="lg">
                                    Show/Hide Columns
                                </DropdownToggle>
                                <DropdownMenu>
                                    <DropdownItem>Day</DropdownItem>
                                    <DropdownItem>Night</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
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
                        <Table borderless responsive className="haulroad-summary-table">
                            <thead>
                                <tr>
                                    {TableHeaders.map((header) => (
                                        <th style={{ justifyContent: 'start', }}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row) => (
                                    <HaulRoadOptimizationTableRow {...row} />
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    <div className="d-flex justify-content-end align-items-center mt-3">
                        <Pagination
                            showQuickJumper
                            defaultCurrent={2}
                            total={500}
                            onChange={onChange}
                        />
                    </div>
                </CardBody>
            </Card>
            </div>
        </React.Fragment >
    )
}

export default TruckLoadOptimisation;