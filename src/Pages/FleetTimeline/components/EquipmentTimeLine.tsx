import React, { Fragment, useState } from "react";
import { Row, Col } from "reactstrap";
import TimelineGraph from "Components/Common/TimelineGraph";
import { generateTasks } from "Components/Common/TimelineGraph/sample";
import { DataGroup, DataItem } from "vis-timeline/standalone";
import { Slider } from 'antd'; 
import { Vehicle } from "slices/fleet/reducer";

interface EquipmentTimeLineProps {
  vehicles: Vehicle[];
}

const EquipmentTimeLine: React.FC<EquipmentTimeLineProps> = ({ vehicles }) => {
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
      <Row className="mb-3 mt-5">
      <Col className="d-flex justify-content-end">
        <div style={{ width: '30%' }}>
          <Slider
            marks={marks}
            step={null}  // Allow only the marks (5, 15, 30, 60)
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
      <Row className="mt-3">
        <Col>
          <TimelineGraph
            groupsData={groupsData}
            tasksData={tasksData}
            selectedInterval={String(selectedInterval)}  // Pass the selected interval as a string
          />
        </Col>
      </Row>

      {/* Render vehicles data */}
      <Row className="mt-3">
        {vehicles.map((vehicle) => (
          <Col xs={12} key={vehicle.id}>
            <div>
              <strong>{vehicle.name}</strong>: {vehicle?.status}
            </div>
          </Col>
        ))}
      </Row>
    </Fragment>
  );
};

export default EquipmentTimeLine;
