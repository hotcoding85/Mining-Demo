import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import dayjs from "dayjs";
import { format } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { getAllEvents } from "slices/thunk";
import { DatePicker, DatePickerProps, Segmented } from "antd";
import { Dropdown, DropdownType } from "Components/Common/Dropdown";
import { FLEET_TIME_STATE_COLOR } from "Components/constants/layout";
import StateTime from "./components/StateTime";
import EquipmentTimeLine from "./components/EquipmentTimeLine";
import "./fleettimeline.css";
import { PieChart } from "Components/Charts/PieChart";
import StateDescription from "./components/StateDescription";
import AnalysisCard from "./components/AnalysisCard";
import {
  ActiveAnalysis,
  DelayAnalysis,
  DownAnalysis,
  StandByAnalysis,
} from "./_mock";

const EquipmentTypes = [
  {
    label: "Blasthole Rig",
    value: "BLASTHOLE_RIG",
  },
  {
    label: "Haul Truck",
    value: "HAUL_TRUCK",
  },
  {
    label: "Dozer",
    value: "DOZER",
  },
  {
    label: "Excuvator",
    value: "EXCUVATOR",
  },
  {
    label: "Grader",
    value: "GRADER",
  },
  {
    label: "Loader",
    value: "LOADER",
  },
  {
    label: "Light Vehicle",
    value: "LIGHT_VEHICLE",
  },
  {
    label: "Utility",
    value: "UTILITY",
  },
  {
    label: "Water cart",
    value: "WATER_CART",
  },
  {
    label: "Wheel loader",
    value: "WHEEL_LOADER",
  },
];

const StateTimes = [
  {
    state: "Active",
    time: "00:24:52",
    pctValue: 34.21,
    color: FLEET_TIME_STATE_COLOR.ACTIVE,
    bgColor: "#FFFFFF",
  },
  {
    state: "StandBy",
    time: "00:24:52",
    pctValue: 49.04,
    color: FLEET_TIME_STATE_COLOR.STANDBY,
    bgColor: "#FFFFFF",
  },
  {
    state: "Down",
    time: "00:24:52",
    pctValue: 16.3,
    color: FLEET_TIME_STATE_COLOR.DOWN,
    bgColor: "#FFFFFF",
  },
  {
    state: "Idle",
    time: "00:24:52",
    pctValue: 0.0,
    color: FLEET_TIME_STATE_COLOR.IDLE,
    bgColor: "#D9D9D9",
  },
  {
    state: "Delay",
    time: "00:24:52",
    pctValue: 0.35,
    color: FLEET_TIME_STATE_COLOR.DELAY,
    bgColor: "#FFFFFF",
  },
];

const FleetTimeline = (props: any) => {
  document.title = "Timeline Utilization Model | FMS Live";

  const dispatch: any = useDispatch();

  const timeScale = {
    enable: true,
    interval: 60,
    slotCount: 2,
  };

  const { fleet } = useSelector(
    createSelector(
      (state: any) => state.Fleet,
      (fleetState) => ({
        fleet: fleetState.data,
      })
    )
  );

  const { events } = useSelector(
    createSelector(
      (state: any) => state.Events,
      (eventsState) => ({
        events: eventsState.data,
      })
    )
  );

  const [fleetMode, setFleetMode] = useState<string>("CURRENT_SHIFT");

  const [searchParams, setSearchParams] = useSearchParams();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [equipmentType, setEquipmentType] = useState<DropdownType>({
    label: "ALL",
  });

  const onStartDateChange: DatePickerProps["onChange"] = (date) => {
    if (date) {
      setStartDate(date.toDate());
    }
  };

  const onEndDateChange: DatePickerProps["onChange"] = (date) => {
    if (date) {
      setEndDate(date.toDate());
    }
  };

  useEffect(() => {
    setSearchParams({ date: format(startDate, "yyyy-MM-dd") });
  }, []);

  useEffect(() => {
    dispatch(getAllEvents(format(startDate, "yyyy-MM-dd")));
  }, [dispatch, startDate]);

  const stateData = {
    labels: ["Active", "StandBy", "Down", "Idle", "Delay"],
    datasets: [
      {
        data: [34.21, 49.4, 16.3, 0.35, 0.0],
        backgroundColor: Object.values(FLEET_TIME_STATE_COLOR),
        borderWidth: 0,
      },
    ],
  };

  return (
    <React.Fragment>
      <div
        className="page-content"
        style={{
          minHeight: "100vh",
        }}
      >
        <Container fluid>
          <Row className="d-flex justify-content-between align-items-center">
            <Col md={12} lg={5}>
              <Segmented
                className="customSegmentLabel customSegmentBackground"
                value={fleetMode}
                onChange={(e) => setFleetMode(e)}
                options={[
                  "All Fleet",
                  { label: "Digging Fleet", value: "DIGGING_FLEET" },
                  { label: "Trucking Fleet", value: "TRUCKING_FLEET" },
                  { label: "Previous Shift", value: "PREVIOUS_SHIFT" },
                  { label: "Current Shift", value: "CURRENT_SHIFT" },
                ]}
              />
            </Col>
            <Col xs={2}>
              <div className="d-flex justify-content-center align-items-center gap-2">
                <DatePicker
                  allowClear={false}
                  value={dayjs(startDate)}
                  format={"MM/DD/YY"}
                  onChange={onStartDateChange}
                />
                <DatePicker
                  allowClear={false}
                  value={dayjs(endDate)}
                  format={"MM/DD/YY"}
                  onChange={onEndDateChange}
                />
              </div>
            </Col>
            <Col xs={5}>
              <div className="d-flex justify-content-end align-items-center gap-2">
                <Dropdown
                  label="Equipment types"
                  items={EquipmentTypes}
                  value={equipmentType}
                  onChange={setEquipmentType}
                />
              </div>
            </Col>
          </Row>
          <Row
            className="d-flex justify-content-center align-items-center"
            style={{ marginTop: "120px" }}
          >
            {StateTimes.map((el) => (
              <Col xs={2}>
                <StateTime {...el} />
              </Col>
            ))}
          </Row>
          <EquipmentTimeLine vehicles={fleet} />
          <Row className="py-5 mt-5 d-flex align-items-center">
            <Col
              xs={5}
              className="fleet-state-pie-chart d-flex justify-content-center align-items-center"
            >
              <div
                style={{
                  width: 210,
                  height: 210,
                }}
              >
                <PieChart
                  data={stateData}
                  title=""
                  legendsFirst={false}
                  legendsPosition="bottom"
                  width={210}
                  height={210}
                  fontStyle={{
                    size: 12,
                    color: "#000",
                  }}
                />
              </div>
            </Col>
            <Col xs={7}>
              <StateDescription />
            </Col>
          </Row>
          <Row className="mt-5">
            <Col xs={6}>
              <AnalysisCard
                title="Detailed Active analysis"
                chartData={ActiveAnalysis}
                color={FLEET_TIME_STATE_COLOR.ACTIVE}
              />
            </Col>
            <Col xs={6}>
              <AnalysisCard
                title="Detailed Active analysis"
                chartData={StandByAnalysis}
                color={FLEET_TIME_STATE_COLOR.STANDBY}
              />
            </Col>
            <Col xs={6}>
              <AnalysisCard
                title="Detailed Active analysis"
                chartData={DownAnalysis}
                color={FLEET_TIME_STATE_COLOR.DOWN}
              />
            </Col>
            <Col xs={6}>
              <AnalysisCard
                title="Detailed Active analysis"
                chartData={DelayAnalysis}
                color={FLEET_TIME_STATE_COLOR.DELAY}
              />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};
export default FleetTimeline;
