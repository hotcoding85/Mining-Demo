import ProgressPieChart from "Components/Charts/ProgressPieChart";
import { Card } from "reactstrap";
import styled from "styled-components";

const TimeLabel = styled.div<{ color?: string }>`
  color: ${({ color }) => color || "white"};
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

const DiggerState: React.FC<TruckingStateProps> = ({ truckStates }) => {
    return (
        <Card className="state-card">
            <div className="d-flex flex-column align-items-start">
                <div className="state-card-title">
                    <h3></h3>
                </div>
                <div className="mt-3 d-flex align-items-center justify-content-center w-100">
                    {truckStates.map(({ time, state, color, bgColor, textColor, pctValue }) => (
                        <div
                            className="d-flex flex-column justify-content-center align-items-center gap-1"
                            style={{ width: "19%" }}
                            key={state}
                        >
                            <ChartWrapper>
                                <ProgressPieChart
                                    width={300}
                                    pctValue={pctValue}
                                    color={color}
                                    bgColor={bgColor}
                                    textColor={textColor}
                                />
                            </ChartWrapper>
                            <div className="state-label">{state}</div>
                            <TimeLabel >{time}</TimeLabel>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};



export default DiggerState;
