import React, { Fragment, useEffect, useRef, useState } from "react";
import { Container, Row, Col, Button } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { DataSet, Timeline as VisTimeline, TimelineWindow } from "vis-timeline/standalone";
import CustomDropdown, { DropdownType } from "Components/Common/Dropdown/Dropdown";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import 'Pages/Reports/TimelineReport/index.css';

const TimelineReport = () => {
    document.title = "Reports | Timeline Report";

    const timelineRef = useRef<HTMLDivElement | null>(null);
    const timelineInstance = useRef<VisTimeline | null>(null);
    const [selectedInterval, setSelectedInterval] = useState<DropdownType>({ label: "Timeline Interval", value: "" });

    const timeIntervals: DropdownType[] = [
        { label: "5 Min", value: "5" },
        { label: "15 Min", value: "15" },
        { label: "30 Min", value: "30" },
        { label: "1 Hour", value: "60" },
    ];

    const groups = new DataSet([
        { id: 0, content: "Truck 0" },
        { id: 1, content: "Truck 1" },
        { id: 2, content: "Truck 2" },
        { id: 3, content: "Truck 3" },
        { id: 4, content: "Truck 4" },
    ]);

    const items = new DataSet([
        { id: 1, group: 0, content: "Order 0", start: "2024-09-11T15:00" },
        { id: 2, group: 0, content: "Order 1", start: "2024-09-11T17:00", end: "2024-09-11T19:00" },
        { id: 3, group: 1, content: "Order 2", start: "2024-09-11T22:00", end: "2024-09-12T00:00" },
        { id: 4, group: 2, content: "Order 3", start: "2024-09-12T05:00", end: "2024-09-12T07:00" },
        { id: 5, group: 3, content: "Order 4", start: "2024-09-12T09:00", end: "2024-09-12T10:00" },
        { id: 6, group: 4, content: "Order 5", start: "2024-09-12T11:00", end: "2024-09-12T13:00" },
        { id: 7, group: 4, content: "Order 6", start: "2024-09-12T14:00" },
    ]);

    useEffect(() => {
        if (timelineRef.current && !timelineInstance.current) {
            const options = {
                stack: false,
                start: new Date(2024, 8, 11, 15, 0),
                end: new Date(2024, 8, 12, 15, 0),
                editable: true,
                zoomMin: 1000 * 60 * 5,
                zoomMax: 1000 * 60 * 60 * 24 * 7,
            };

            timelineInstance.current = new VisTimeline(timelineRef.current, items, groups, options);
        }
    }, [groups, items]);

    const setTimeInterval = (interval: DropdownType) => {
        const intervalInMinutes = parseInt(interval.value || "5", 10);
        const intervalInMilliseconds = intervalInMinutes * 60 * 1000;
        if (timelineInstance.current) {
            const currentTime = new Date();
            const start = new Date(currentTime.getTime() - intervalInMilliseconds / 2);
            const end = new Date(currentTime.getTime() + intervalInMilliseconds / 2);

            timelineInstance.current.setWindow(start, end);
        }

        setSelectedInterval(interval);
    };
    return (
        <Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Reports" breadcrumbItem="Timeline Report" />

                    <Row className="mb-3">
                        <Col className="d-flex justify-content-between align-items-center">

                            <CustomDropdown
                                items={timeIntervals}
                                value={selectedInterval}
                                onChange={setTimeInterval}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <div ref={timelineRef} className="timeline-container"></div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </Fragment>
    );
};

export default TimelineReport;
