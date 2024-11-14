import React, { useEffect, useMemo, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import dayjs from "dayjs";
import { format } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllEvents } from "slices/thunk";
import { DatePickerProps, Segmented } from "antd";
import { Dropdown, DropdownType } from "Components/Common/Dropdown";
import {
  FLEET_TIME_STATE_COLOR,
  LAYOUT_MODE_TYPES,
} from "Components/constants/layout";
import StateTime, { StateTimeProps } from "./components/StateTime";
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
import CustomDatePicker from "Components/Common/DatePicker/CustomDatePicker";
import { FleetSelector, LayoutSelector } from "selectors";
import { divide12HoursRandomly, minutesToHhMm, round2Two, secondsToHMS } from "utils/common";

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

const FleetTimeline = (props: any) => {
  document.title = "Timeline Utilization Model | FMS Live";

  const dispatch: any = useDispatch();

  const timeScale = {
    enable: true,
    interval: 60,
    slotCount: 2,
  };

  const { layoutModeType } = useSelector(LayoutSelector);
  const { fleet } = useSelector(FleetSelector);

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

  const StateTimes: StateTimeProps[] = useMemo<any>(() => {
    const textColor =
      layoutModeType === LAYOUT_MODE_TYPES.DARK ? "#fff" : "#2A2A2A";
    const bgColor = layoutModeType === LAYOUT_MODE_TYPES.DARK ? "#fff" : "#fff";

    const stateKeys = [{ state: 'Active', color: FLEET_TIME_STATE_COLOR.ACTIVE }, { state: 'StandBy', color: FLEET_TIME_STATE_COLOR.STANDBY }, { state: 'Down', color: FLEET_TIME_STATE_COLOR.DOWN }, { state: 'Idle', color: FLEET_TIME_STATE_COLOR.IDLE }, { state: 'Delay', color: FLEET_TIME_STATE_COLOR.DELAY }]
    const data = divide12HoursRandomly(5)
    const formatted = secondsToHMS(data[0] * 60)
    console.log(data, formatted)

    const props = data.map((item, index) => {
      const keys = stateKeys[index]
      const value = item
      return {
        state: keys.state,
        time: secondsToHMS(value * 60),
        pctValue: round2Two((value / 720) * 100),
        color: keys.color,
        bgColor: bgColor,
        textColor: textColor,
      }
    })
    return props
  }, [layoutModeType]);

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
                <CustomDatePicker
                  label={"Start date"}
                  allowClear={false}
                  value={dayjs(startDate)}
                  format={"MM/DD/YY"}
                  onChange={onStartDateChange}
                />
                <CustomDatePicker
                  label={"End date"}
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
            style={{ marginTop: "60px" }}
          >
            {StateTimes.map((el) => (
              <Col xs={2}>
                <StateTime {...el} />
              </Col>
            ))}
          </Row>
          <EquipmentTimeLine vehicles={fleet} />
          <Row className="d-flex align-items-center">
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
