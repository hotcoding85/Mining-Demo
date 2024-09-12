import React, { Fragment, useEffect, useRef, useState } from "react";
import { Container, Row, Col, Button } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { DataSet, Timeline as VisTimeline, TimelineWindow } from "vis-timeline/standalone";
import CustomDropdown, { DropdownType } from "Components/Common/Dropdown/Dropdown";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import 'Pages/Reports/TimelineReport/index.css';
import { generateTasks } from "./sample";

const TimelineReport = () => {
    document.title = "Reports | Timeline Report";

    const timelineRef = useRef<HTMLDivElement | null>(null);
    const timelineInstance = useRef<VisTimeline | null>(null);
    const [selectedInterval, setSelectedInterval] = useState<DropdownType>({ label: "Timeline Interval", value: "60" });

    const timeIntervals: DropdownType[] = [
        { label: "5 Min", value: "60" },
        { label: "15 Min", value: "120" },
        { label: "30 Min", value: "180" },
        { label: "1 Hour", value: "380" },
    ];



    let groupsData: DataSet = []
    let tasksData: DataSet = []

    for (let i = 0; i < 9; i++) {
        groupsData.push({ id: i, content: "DT10" + (i + 1) })
        const tasks = generateTasks(i)
        tasksData.push(...tasks)
    }

    const groups = new DataSet(groupsData);
    const items = new DataSet(tasksData);

    useEffect(() => {
        if (timelineRef.current && !timelineInstance.current) {
            const options = {
                stack: false,
                start: new Date(2024, 8, 12, 6, 0),
                end: new Date(2024, 8, 13, 6, 0),
                min: new Date(2024, 8, 12, 6, 0),
                max: new Date(2024, 8, 13, 6, 0),
                editable: false,
                zoomable: false,
                horizontalScroll: true,
                verticalScroll: true
            };

            timelineInstance.current = new VisTimeline(timelineRef.current, items, groups, options);
            setTimeInterval(selectedInterval)
        }
    }, [groups, items]);

    useEffect(() => {
        setTimeInterval(selectedInterval)
    }, [selectedInterval])

    const setTimeInterval = (interval: DropdownType) => {
        const intervalInMinutes = parseInt(interval.value || "5", 10);
        const intervalInMilliseconds = intervalInMinutes * 60 * 1000;
        if (timelineInstance.current) {
            const currentTime = new Date();
            const start = new Date(currentTime.getTime() - intervalInMilliseconds / 2);
            const end = new Date(currentTime.getTime() + intervalInMilliseconds / 2);

            timelineInstance.current.setWindow(start, end);
        }
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
                                onChange={(value) => setSelectedInterval(value)}
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
