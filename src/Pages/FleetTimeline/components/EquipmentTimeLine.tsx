import { Dropdown, DropdownType } from "Components/Common/Dropdown";
import React, { useState } from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { Steps } from "antd";
import TimeLineChart from "Components/Charts/TimeLineChart";

interface EquipmentTimeLineProps {
  vehicles: any[];
}

const EquipmentTimeLine: React.FC<EquipmentTimeLineProps> = ({ vehicles }) => {
  const [equipmentId, setEqupmentId] = useState<DropdownType>({
    label: vehicles[0].name,
  });
  const [currentStep, setCurrentStep] = useState<number>(0);

  return (
    <Card
      className="text-center"
      style={{ height: "auto", marginTop: "100px" }}
    >
      <CardBody>
        <Row>
          <Col
            lg={2}
            className="d-flex align-items-start justify-content-start mt-5"
          >
            <Dropdown
              label="Equipment ID's"
              items={vehicles.map((item) => ({
                label: item.name,
                value: item.name,
              }))}
              value={equipmentId}
              onChange={setEqupmentId}
            />
          </Col>
          <Col lg={10}>
            <div
              className="d-flex flex-wrap justify-content-end align-items-center"
              style={{
                width: "100%",
              }}
            >
              <Steps
                current={currentStep}
                progressDot
                items={[
                  {
                    title: "5min",
                  },
                  {
                    title: "15min",
                  },
                  {
                    title: "30min",
                  },
                  {
                    title: "1hour",
                  },
                ]}
                style={{
                  width: "520px",
                }}
              />
            </div>
            <div>
              <TimeLineChart />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default EquipmentTimeLine;
