import ProgressPieChart from "Components/Charts/ProgressPieChart";
import { Card, CardBody } from "reactstrap";
import styled from "styled-components";

const TimeLabel = styled.div<{ color?: string }>`
  color: white;
  text-align: center;
  font-size: 20px;
  font-style: normal;
  line-height: 24px;
  margin-top: 10px;
`;

const ChartWrapper = styled.div`
  height: 185px;
`;

interface TruckingStateProps {
  truckStates: any[];
}

const RadicalGraph: React.FC<TruckingStateProps> = ({ truckStates }) => {
  return (
    <Card className="state-card">
      <div className="d-flex flex-column align-items-start" style={{marginBottom: '30px'}}>
        <div className="state-card-title"></div>
        <div className="mt-3 d-flex align-items-center justify-content-center w-100">
          {truckStates.map(({ time, state, ...item }) => (
            <div
              className="d-flex flex-column justify-content-center align-items-center gap-1"
              style={{ width: "19%" }}
            >
              <ChartWrapper>
                <ProgressPieChart width={300} {...item} />
              </ChartWrapper>
              <div className="state-label" style={{marginTop: '40px'}}>{state}</div>
              <TimeLabel>{time}</TimeLabel>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default RadicalGraph;
