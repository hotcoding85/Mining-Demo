import ProgressPieChart, {
  ProgressPieChartProps,
} from "Components/Charts/ProgressPieChart";
import styled from "styled-components";

const ChartWrapper = styled.div`
  position: relative;
  height: 210px;
  width: 210px;
`;

const CenteredChart = styled.div`
  position: absolute;
  top: -80%;
  transform: translateY(50%) translateX(-50%);
  left: 50%;
`;

const StatusLabel = styled.div<{ color: string }>`
  width: 210px;
  background-color: ${(props) => props.color};
  border-radius: 2px;
  color: white;
  text-align: center;
  font-size: 32px;
  font-style: normal;
  font-weight: 400;
  line-height: 36px;
`;

interface StateTimeProps extends ProgressPieChartProps {
  time: string;
  state: string;
}

const StateTime: React.FC<StateTimeProps> = ({ time, state, ...props }) => {
  return (
    <div className="d-flex flex-column align-items-start justify-content-start  gap-3">
      <ChartWrapper>
        <CenteredChart>
          <ProgressPieChart width={410} {...props} />
        </CenteredChart>
      </ChartWrapper>
      <div className="d-flex flex-column align-items-start justify-content-start mt-5">
        <StatusLabel color={props.color}>{state}</StatusLabel>
        <StatusLabel color="#283655">{time}</StatusLabel>
      </div>
    </div>
  );
};

export default StateTime;
