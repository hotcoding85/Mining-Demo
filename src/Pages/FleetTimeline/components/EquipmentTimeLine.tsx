import { Dropdown, DropdownType } from "Components/Common/Dropdown";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { Steps } from "antd";
import { DataSet, Timeline as VisTimeline, TimelineWindow } from "vis-timeline/standalone";
import { generateTasks } from "Pages/Reports/TimelineReport/sample";
import CustomDropdown from "Components/Common/Dropdown/Dropdown";

interface EquipmentTimeLineProps {
  vehicles: any[];
}

const EquipmentTimeLine: React.FC<EquipmentTimeLineProps> = ({ vehicles }) => {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const timelineInstance = useRef<VisTimeline | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<DropdownType>({ "label": "15 Min", "value": "120" });

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
      const currentTime = new Date();
      const intervalInMilliseconds = 120 * 60 * 1000;
      const start = new Date(currentTime.getTime() - intervalInMilliseconds / 2);
      const end = new Date(currentTime.getTime() + intervalInMilliseconds / 2);
      timelineInstance.current.setWindow(start, end);
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
    <Fragment >
      <Row className="mb-3 mt-5">
        <Col className="d-flex justify-content-between align-items-center">
          <CustomDropdown
            items={timeIntervals}
            value={selectedInterval}
            onChange={(value) => setSelectedInterval(value)}
          />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <div ref={timelineRef} className="timeline-container"></div>
        </Col>
      </Row>
    </Fragment>
  );
};

export default EquipmentTimeLine;
