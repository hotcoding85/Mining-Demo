import React from "react";
import ProgressPieChart from "Components/Charts/ProgressPieChart";
import { Card, Row, Col } from "reactstrap";
import styled from "styled-components";

const LabelContainer = styled.div`
  display: flex;
  align-items: center; 
  justify-content: center; 
  margin-top: 15px;
  background-color: #535e77;
  padding: 10px 20px;
  border-radius: 30px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
`;

const Label = styled.div`
  color: white;
  font-size: 16px;
  font-weight: bold;
  margin-right: 10px; 
`;

const ProgressInfo = styled.div`
  color: #ffffff;
  font-size: 14px;
`;

const ChartWrapper = styled.div`
  height: 185px;
  margin-top: -30px;
  margin-bottom: 30px;
`;

const metrics = [
  {
    title: "Overall Load Target",
    value: 79,
    completed: 280,
    target: 600,
    label: "COMPLETED",
    color: "#4CAF50", 
    bgColor: "#E0E0E0", 
    textColor: "#ffffff", 
  },
  {
    title: "Tonnes Extraction",
    value: 21,
    completed: "28K",
    target: "60K",
    label: "COMPLETED",
    color: "#FFC107", 
    bgColor: "#535E77",
    textColor: "#ffffff",
  }
];

const EfficiencyMetrics: React.FC = () => {
  return (
    <Row>
      {metrics.map(({ title, value, completed, target, label, color, bgColor, textColor }) => (
        <Col lg="6" className="mb-3" key={title}>
          <Card className="state-card">
            <div className="d-flex flex-column align-items-center">
              <h3 className="text-center">{title}</h3>
              <div className="d-flex align-items-center justify-content-center w-100 mt-3">
                <ChartWrapper>
                  <ProgressPieChart
                    width={300}
                    pctValue={value}
                    color={color}
                    bgColor={bgColor}
                    textColor={textColor}
                  />
                </ChartWrapper>
              </div>
              <LabelContainer>
                <Label>{label}</Label>
                <ProgressInfo>
                  {completed} of {target}
                </ProgressInfo>
              </LabelContainer>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default EfficiencyMetrics;
