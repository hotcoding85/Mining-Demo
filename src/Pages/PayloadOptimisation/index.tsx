import React, { useState } from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { DatePicker, DatePickerProps, Segmented, Tabs, TabsProps } from "antd";
import Reports from "./components/Reports";
import Visual from "./components/Visual";
import { Dropdown, DropdownType, SearchDropdown } from "Components/Common/Dropdown";
import { UploadOutlined } from "@ant-design/icons";
import './index.scss'
import dayjs from "dayjs";
const PayloadOptimsation
 = (props: any) => {
    document.title = "Payload Optimsation | FMS Live";

    const tabItems: TabsProps["items"] = [
        {
          key: "reports",
          label: "Reports",
        },
        {
          key: "visual",
          label: "Visual Analytics",
        }
    ];
    const [displayType, setDisplayType] = useState("reports");
    const onTabChange = (key: string) => {
        if (key === "reports") {
          setDisplayType("reports");
        } else if (key === "visual") {
          setDisplayType("visual");
        }
    };

    const [viewType, setViewType] = useState('2DView');
    const onViewTypeChange = (info: string) => {
        setViewType(info)
    }
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
    const [startDate, setStartDate] = useState(new Date());
    const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
        if (date) {
            setStartDate(date.toDate());
        }
    };


    const locationItems = [
        {
            label: "Haul Route 1",
            value: "haul_route_1",
        },
        {
            label: "Haul Truck",
            value: "HAUL_TRUCK",
        },
        {
            label: "Waste Dump",
            value: "waste_dump",
        },
    ]
    const [locations, setLocaltions] = useState<DropdownType>({
        label: "",
    });
    return (
        <React.Fragment>
            <div className="page-content" style={{paddingBottom: '0px'}}>
                <Container fluid>
                    <Breadcrumb title="Mine Dynamics" breadcrumbItem="Payload Optimsation" />
                    <Row>
                        <Col lg="6" md="6" sx="12">
                            <Tabs
                                className="truck-optimisation-tabs"
                                defaultActiveKey="1"
                                items={tabItems}
                                onChange={onTabChange}
                            />
                        </Col>
                        <Col lg="6" md="6" sx="12" className="top-menu">
                            {displayType === "reports" ? 
                                <>
                                    <DatePicker allowClear={false} value={dayjs(startDate)} onChange={onDateChange} />
                                    <SearchDropdown
                                        itemsGroup={filters}
                                        disableTitle={false}
                                        disableDivider={false}
                                    />

                                    <div className="export-csv">
                                        <Button style={{height: '32px', padding: '5px 20px'}}>
                                            Export CSV
                                            <UploadOutlined />
                                        </Button>
                                    </div>
                                </> : 
                                <>
                                    <Segmented
                                        className="customSegmentLabel customSegmentBackground"
                                        style={{marginRight: '1rem'}}
                                        value={viewType}
                                        onChange={onViewTypeChange}
                                        options={[
                                        { value: "2DView", label: "2DView" },
                                        { value: "3DView", label: "3DView" },
                                        ]}
                                    />
                                    <Dropdown
                                        label="Choose Replay"
                                        items={locationItems}
                                        value={locations}
                                        onChange={setLocaltions}
                                        />
                                </>
                            }
                        </Col>
                        <Col lg="12">
                            {displayType === "reports" ?
                                <Reports />  : <Visual />
                            }
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    )
}

export default PayloadOptimsation;