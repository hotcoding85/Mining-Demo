import React, { Fragment, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import TimelineGraph from "Components/Common/TimelineGraph";
import { generateTasks } from "Components/Common/TimelineGraph/sample";
import { DataGroup, DataItem } from "vis-timeline/standalone"; 
import { Slider } from 'antd';

const EquipmentGantt = () => {
  document.title = "Reports | Equipment Gantt";

  const [selectedInterval, setSelectedInterval] = useState<number>(15);
  const marks = {
    5: '5 Min',
    15: '15 Min',
    30: '30 Min',
    60: '60 Min'
  };

  let groupsData: DataGroup[] = [];
  let tasksData: DataItem[] = [];

  for (let i = 0; i < 9; i++) {
    groupsData.push({ id: i, content: `DT10${i + 1}` });

    const tasks: DataItem[] = generateTasks(i); 
    tasksData.push(...tasks);
  }

  return (
    <Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Reports" breadcrumbItem="Equipment Gantt" />
          <Row className="mb-3">
          <Col className="d-flex justify-content-end">
            <div style={{ width: '30%' }}>
              <Slider
                marks={marks}
                step={null}  
                defaultValue={15}
                value={selectedInterval}
                onChange={setSelectedInterval}
                min={5}
                max={60}
                tooltipVisible  
              />
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <TimelineGraph
                groupsData={groupsData}
                tasksData={tasksData}
                selectedInterval={String(selectedInterval)}  
              />
            </Col>
          </Row>
        </Container>
      </div>
    </Fragment>
  );
};

export default EquipmentGantt;
