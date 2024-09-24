import React from "react";
import { Card, CardBody } from "reactstrap";
import styled from "styled-components";
import AnalysisChart from "Components/Charts/AnalysisChart";

const Wrapper = styled.div`
  width: 100%;
  height: 507px;
  margin-top: 32px;
`;

const Title = styled.div`
  color: ${(props) => (props.theme.dark ? "#fff" : "#454545")};
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
  padding: 16px;
  max-width: 295px;
`;

interface AnalysisCardProps {
  title: string;
  chartData: {
    x: string;
    y: number;
  }[];
  color: string;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({
  title,
  chartData,
  color,
}) => {
  return (
    <Card className="text-center">
      <CardBody>
        <div className="d-flex flex-column align-items-start">
          <Title>{title}</Title>
          <Wrapper>
            <AnalysisChart chartData={chartData} color={color} />
          </Wrapper>
        </div>
      </CardBody>
    </Card>
  );
};

export default AnalysisCard;
