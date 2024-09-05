import { Dropdown, DropdownType } from "Components/Common/Dropdown";
import React, { useState } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import { Steps } from "antd";
import TimeLineChart from "Components/Charts/TimeLineChart";
import styled from "styled-components";
import { FLEET_TIME_STATE_COLOR } from "Components/constants/layout";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Dot = styled.div<{ color: string }>`
  flex: none;
  width: 11px;
  height: 11px;
  background-color: ${(props) => props.color};
  border-radius: 100%;
`;

const DescriptionText = styled.div`
  color: #fff;
  font-family: "Source Sans Pro";
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px; /* 133.333% */
`;

const Title = styled.div`
  color: #fff;
  font-size: 28px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;
`;

const StateDescription: React.FC = () => {
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
          <Title>Summary</Title>
          <div className="d-flex flex-column align-items-start gap-1 mt-3">
            <Wrapper>
              <Dot color={FLEET_TIME_STATE_COLOR.ACTIVE} />
              <DescriptionText>
                Green Indicates Engine is running, machine is working.
              </DescriptionText>
            </Wrapper>
            <Wrapper>
              <Dot color={FLEET_TIME_STATE_COLOR.STANDBY} />
              <DescriptionText>
                Amber Indicates Engine turned off, machine is not working ,
                parked out.
              </DescriptionText>
            </Wrapper>
            <Wrapper>
              <Dot color={FLEET_TIME_STATE_COLOR.DOWN} />
              <DescriptionText>
                Red Indicates Machine is broken down or being serviced, and
                unavailable to work .
              </DescriptionText>
            </Wrapper>
            <Wrapper>
              <Dot color={FLEET_TIME_STATE_COLOR.IDLE} />
              <DescriptionText>
                Grey Indicates Engine and machine is working, that has been
                idling for greater than a minute.
              </DescriptionText>
            </Wrapper>
            <Wrapper>
              <Dot color={FLEET_TIME_STATE_COLOR.DELAY} />
              <DescriptionText>
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
