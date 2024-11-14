import ProgressPieChart, {
  ProgressPieChartProps,
} from "Components/Charts/ProgressPieChart";
import { LAYOUT_MODE_TYPES } from "Components/constants/layout";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
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

const StatusLabel = styled.div<{ bgColor: string; color?: string }>`
  width: 210px;
  background-color: ${(props) => props.bgColor};
  border-radius: 2px;
  color: ${(props) => props.color || "#FFF"};
  text-align: center;
  font-size: 24px;
  font-style: normal;
  font-weight: 400;
  line-height: 36px;
`;

export interface StateTimeProps extends ProgressPieChartProps {
  time: string;
  state: string;
  color: string;
  bgColor: string;
  textColor: string;
  pctValue: number;
}

const StateTime: React.FC<StateTimeProps> = ({ time, state, color, bgColor, textColor, pctValue }) => {
  const { layoutModeType } = useSelector(
    createSelector(
      (state: any) => state.Layout,
      (layout) => ({
        layoutModeType: layout.layoutModeTypes,
      })
    )
  );

  const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;

  return (
    <div className="d-flex flex-column align-items-start justify-content-start ">
      <ChartWrapper>
        <CenteredChart>
          <ProgressPieChart width={360} color={color} bgColor={bgColor} textColor={textColor} pctValue={pctValue} />
        </CenteredChart>
      </ChartWrapper>
      <div className="d-flex flex-column align-items-start justify-content-start">
        <StatusLabel bgColor={color}>{state}</StatusLabel>
        <StatusLabel
          bgColor={isLight ? "#fff" : "var(--bg-color)"}
          color={isLight ? "#2A2A2A" : "#fff"}>
          {time}
        </StatusLabel>
      </div>
    </div>
  );
};

export default StateTime;
