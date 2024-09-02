import React, { useEffect, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Col, Container, Row } from "reactstrap";
import _, { isObjectLike } from "lodash";
import { Button, DatePicker, DatePickerProps, Space, Spin } from "antd";
import dayjs from "dayjs";
import "./mock.css";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { addUsers, getAllUsers } from "slices/thunk";
import { useDispatch } from "react-redux";
import { getMockResources } from "Helpers/api_mock_helper";
import { generateMockTargetData } from "_mock/target";
import { generateMockRosterData } from "_mock/roster";
import { generateMockPlanData } from "_mock/plan";
import { generateEventData, generateMockEventMetaData } from "_mock/event";
import { generateMockUserData } from "_mock/user";
import AutoTable from "Components/Common/AutoTable";

const Mock = () => {
  document.title = "Mock | FMS Live";

  const dispatch: any = useDispatch();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resource, setResource] = useState<any>({});

  const [users, setUsers] = useState<any>();
  const [rosters, setRosters] = useState<any>();
  const [targets, setTargets] = useState<any>();
  const [plans, setPlans] = useState<any>();
  const [eventMetas, setEventMetas] = useState<any>();
  const [events, setEvents] = useState<any>();

  useEffect(() => {
    const getMock = async () => {
      try {
        setIsLoading(true);
        const result = await getMockResources();
        setResource(result);
        setIsLoading(false);
      } catch (e: any) {
        console.error(e);
      }
    };

    getMock();

    return () => {
      getMock();
    };
  }, []);

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

  const onClickGenerateMockData = () => {
    if (!isLoading) {
      setIsGenerating(true);
      console.log(resource);
      const mockUsers = generateMockUserData();
      const rosters = generateMockRosterData(
        resource,
        startDate,
        endDate,
        mockUsers
      );
      const targets = generateMockTargetData(resource, rosters);
      const plans = generateMockPlanData(resource, targets, rosters);
      const eventMetas = generateMockEventMetaData(plans);
      const events = generateEventData(eventMetas);

      setUsers(mockUsers);
      setRosters(rosters);
      setTargets(targets);
      setPlans(plans);
      setEventMetas(eventMetas);
      setEvents(events);
      setIsGenerating(false);
    }
  };

  const onSaveUsers = () => {
    dispatch(addUsers(users));
  };

  return (
    <React.Fragment>
      {(isGenerating || isLoading) && (
        <div
          className="position-absolute top-0 start-0 bg-light d-flex justify-content-center align-items-center"
          style={{
            width: "100vw",
            height: "100vh",
            opacity: 0.5,
            zIndex: 9999,
          }}
        >
          <div style={{ height: "50px" }}>
            <Spin tip="Loading" size="large" />
            {isLoading ? (
              <p className="mt-2">
                Loading resources for mock data, please wait...
              </p>
            ) : (
              <p className="mt-2">Generating mock data, please wait...</p>
            )}
          </div>
        </div>
      )}
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            breadcrumbItem="Mock Data Generation"
            title="Operations"
          />
          <Row className="mb-3">
            <Col className="d-flex gap-3">
              <Space>
                <div>Start:</div>
                <DatePicker
                  allowClear={false}
                  value={dayjs(startDate)}
                  onChange={onStartDateChange}
                />
              </Space>
              <Space>
                <div>End:</div>
                <DatePicker
                  allowClear={false}
                  value={dayjs(endDate)}
                  onChange={onEndDateChange}
                />
              </Space>
              <Button type="primary" onClick={onClickGenerateMockData}>
                Generate
              </Button>
            </Col>
          </Row>
          {users && (
            <AutoTable data={users} title="Users" onSave={onSaveUsers} />
          )}
          {rosters && <AutoTable data={rosters} title="Rosters" />}
          {targets && <AutoTable data={targets} title="Targets" />}
          {plans && <AutoTable data={plans} title="Plans" />}
          {eventMetas && <AutoTable data={eventMetas} title="Event Metas" />}
          {events && <AutoTable data={events} title="Events" />}
        </Container>
      </div>
    </React.Fragment>
  );
};
export default Mock;
