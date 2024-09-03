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
import {
  addDispatchs,
  addEvents,
  addMaterials,
  addShiftRosters,
  addUsers,
  getAllUsers,
} from "slices/thunk";
import { useDispatch } from "react-redux";
import { getMockResources } from "Helpers/api_mock_helper";
import { generateMockTargetData } from "_mock/target";
import { generateMockRosterData } from "_mock/roster";
import { generateMockPlanData } from "_mock/plan";
import { generateEventData, generateMockEventMetaData } from "_mock/event";
import AutoTable from "Components/Common/AutoTable";
import { postTargets } from "Helpers/api_target_helper";
import { generateMaterialMockData } from "_mock/material";
import { postEventMetas } from "Helpers/api_eventmata_helper";

const Mock = () => {
  document.title = "Mock | FMS Live";

  const dispatch: any = useDispatch();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resource, setResource] = useState<any>({});

  const [rosters, setRosters] = useState<any>();
  const [targets, setTargets] = useState<any>();
  const [materials, setMaterials] = useState<any>();
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
      const rosters = generateMockRosterData(
        resource,
        startDate,
        endDate,
        resource.users
      );
      const targets = generateMockTargetData(resource, rosters);
      const newMaterials = generateMaterialMockData(resource);
      const plans = generateMockPlanData(resource, targets, rosters);
      const eventMetas = generateMockEventMetaData(plans);
      const events = generateEventData(eventMetas);

      setRosters(rosters);
      setTargets(targets);
      setMaterials(newMaterials);
      setPlans(plans);
      setEventMetas(eventMetas);
      setEvents(events);
      setIsGenerating(false);
    }
  };

  const onSaveRosters = async () => {
    await dispatch(addShiftRosters(rosters.slice(0, 2)));
  };

  const onSaveTargets = async () => {
    await postTargets(targets.slice(0, 2));
  };

  const onSavePlans = async () => {
    await dispatch(addDispatchs(plans.slice(0, 2)));
  };

  const onSaveMaterials = async () => {
    const { data: newMaterials } = await dispatch(addMaterials(materials));
    setResource({
      ...resource,
      materials: [...resource.materials, ...newMaterials],
    });
    onClickGenerateMockData();
  };

  const onSaveEventMetas = async () => {
    await postEventMetas(eventMetas.slice(0, 2));
  };

  const onSaveEvents = async () => {
    await dispatch(addEvents({ records: events.slice(0, 2) }));
  };

  return (
    <React.Fragment>
      {(isGenerating || isLoading) && (
        <div
          className="position-absolute top-0 start-0 bg-light d-flex justify-content-center align-items-center"
          style={{
            width: "calc(100vw - 24px)",
            height: "calc(100% - 24px)",
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
          {resource?.users && (
            <AutoTable data={resource?.users} title="Users" />
          )}
          {rosters && (
            <AutoTable data={rosters} title="Rosters" onSave={onSaveRosters} />
          )}
          {targets && (
            <AutoTable data={targets} title="Targets" onSave={onSaveTargets} />
          )}
          {materials?.length > 0 && (
            <AutoTable
              data={materials}
              title="Materials"
              onSave={onSaveMaterials}
            />
          )}
          {plans && (
            <AutoTable data={plans} title="Plans" onSave={onSavePlans} />
          )}
          {eventMetas && (
            <AutoTable
              data={eventMetas}
              title="Event Metas"
              onSave={onSaveEventMetas}
            />
          )}
          {events && (
            <AutoTable data={events} title="Events" onSave={onSaveEvents} />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};
export default Mock;
