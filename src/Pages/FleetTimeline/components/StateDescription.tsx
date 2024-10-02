import React from "react";
import { Card, CardBody } from "reactstrap";
import styled from "styled-components";
import {
  FLEET_TIME_STATE_COLOR,
  LAYOUT_MODE_TYPES,
} from "Components/constants/layout";
import { useSelector } from "react-redux";
import { LayoutSelector } from "selectors";

const Wrapper = styled.div`
  display: flex;
  align-items: start;
  gap: 8px;
`;

const Dot = styled.div<{ color: string }>`
  flex: none;
  width: 11px;
  height: 11px;
  background-color: ${(props) => props.color};
  border-radius: 100%;
  margin-top: 6px;
`;

const DescriptionText = styled.div<{ color?: string }>`
  color: ${(props) => props.color || "#fff"};
  font-family: "Source Sans Pro";
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px; /* 133.333% */
  text-align: left;
`;

const Title = styled.div<{ color?: string }>`
  color: ${(props) => props.color || "#fff"};
  font-size: 28px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
`;

const StateDescription: React.FC = () => {

  const { layoutModeType } = useSelector(LayoutSelector);

  const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;

  const textColor = isLight ? "#2A2A2A" : "#fff";

  return (
    <Card
      className="text-center"
      style={{
        height: "auto",
        marginTop: "100px",
        paddingLeft: "30px",
        paddingRight: "30px",
        paddingTop: "18px",
        paddingBottom: "18px",
      }}
    >
      <CardBody>
        <div className="d-flex flex-column align-items-start">
          <Title color={textColor}>Summary</Title>
          <div className="d-flex flex-column align-items-start gap-1 mt-3">
            <Wrapper>
              <Dot color={FLEET_TIME_STATE_COLOR.ACTIVE} />
              <DescriptionText color={textColor}>
                Green Indicates Engine is running, machine is working.
              </DescriptionText>
            </Wrapper>
            <Wrapper>
              <Dot color={FLEET_TIME_STATE_COLOR.STANDBY} />
              <DescriptionText color={textColor}>
                Amber Indicates Engine turned off, machine is not working ,
                parked out.
              </DescriptionText>
            </Wrapper>
            <Wrapper>
              <Dot color={FLEET_TIME_STATE_COLOR.DOWN} />
              <DescriptionText color={textColor}>
                Red Indicates Machine is broken down or being serviced, and
                unavailable to work .
              </DescriptionText>
            </Wrapper>
            <Wrapper>
              <Dot color={FLEET_TIME_STATE_COLOR.IDLE} />
              <DescriptionText color={textColor}>
                Grey Indicates Engine and machine is working, that has been
                idling for greater than a minute.
              </DescriptionText>
            </Wrapper>
            <Wrapper>
              <Dot color={FLEET_TIME_STATE_COLOR.DELAY} />
              <DescriptionText color={textColor}>
                Purple Indicates Operational Delay , Operations is affected by
                Weather ,Fueling ,Clean Up ,Waiting operator.
              </DescriptionText>
            </Wrapper>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default StateDescription;
