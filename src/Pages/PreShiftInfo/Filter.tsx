import { DatePicker, Segmented, Select } from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";
import { Button, Col, Row, Spinner } from "reactstrap";

interface RosterFilterProps {
  startDate: dayjs.Dayjs;
  onChangeDate: (date: dayjs.Dayjs, dateString: string | string[]) => void;
  shift: string;
  onChangeShift: (shift: string) => void;
  handlePublish: () => void;
  isLoading: boolean;
}

const RosterFilter: React.FC<RosterFilterProps> = ({
  startDate,
  onChangeDate,
  shift,
  onChangeShift,
  handlePublish,
  isLoading,
}) => {
  return (
    <Row className="schedule-filter pe-2">
      <Col xxl={3} lg={3}>
        <Select
          className="basic-single"
          id="Crew"
          showSearch
          allowClear
          placeholder="Crew"
          style={{ width: "100%", color: "#ffff" }}
          // value={selectedCrew}
          // options={getCrews()}
          // onChange={onCrewChange}
        />
      </Col>
      <Col xxl={3} lg={3}>
        <Select
          className="basic-single"
          id="Plan By"
          showSearch
          allowClear
          placeholder="Plan By"
          style={{ width: "100%", color: "#ffff" }}
          // value={selectedPlan}
          // options={getPlans()}
          // onChange={onPlanChange}
        />
      </Col>
      <Col xxl={3} lg={3}>
        <div className="d-flex justify-content-start align-items-center gap-2">
          <DatePicker
            allowClear={false}
            value={startDate}
            onChange={onChangeDate}
            style={{ width: "100%" }}
          />
          <Segmented
            className="customSegmentLabel customSegmentBackground"
            value={shift}
            onChange={onChangeShift}
            options={[
              { value: "DS", label: "DS" },
              { value: "NS", label: "NS" },
            ]}
          />
        </div>
      </Col>
      <Col xxl={3} lg={3}>
        <Button
          className="schedule-btn w-100"
          style={{ backgroundColor: "blue", color: "white" }}
          onClick={handlePublish}
        >
          {isLoading ? <Spinner size="sm"></Spinner> : <></>}
          {'  '}Publish to Production
        </Button>
      </Col>
    </Row>
  );
};

export default RosterFilter;
