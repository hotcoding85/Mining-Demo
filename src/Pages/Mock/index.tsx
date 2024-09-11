import React, { useEffect, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Button, Col, Container, Row } from "reactstrap";
import _, { isObjectLike } from "lodash";
import { DatePicker, DatePickerProps, Space, Spin } from "antd";
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
  upsertMaterials,
  upsertUsers,
  upsertVehicles,
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
import UploadCsvModal from "Components/Common/UploadCsvModal";

const Mock = () => {
  document.title = "Mock | FMS Live";

  const dispatch: any = useDispatch();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resource, setResource] = useState<any>({});

  const [isOpenUploadModal, setIsOpenUploadModal] = useState<boolean>(false);

  const handleOpenUploadModal = () => setIsOpenUploadModal(true);
  const handleCloseUploadModal = () => setIsOpenUploadModal(false);

  const [mockData, setMockData] = useState<any>({
    rosters: null,
    targets: null,
    materials: null,
    plans: null,
    eventMetas: null,
    events: null,
  });

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
      const eventsData = generateMockEventMetaData(plans);
      const eventMetas = eventsData.eventMetas;
      const events = eventsData.events;//generateEventData(eventMetas);

      setMockData({
        rosters,
        targets,
        materials: newMaterials,
        plans,
        eventMetas,
        events,
      });

      setIsGenerating(false);
    }
  };

  const saveData = async (saveFunction, additionalLogic?: any) => {
    setIsSaving(true);
    try {
      const result = await saveFunction();
      additionalLogic && additionalLogic(result);
    } finally {
      setIsSaving(false);
    }
  };
  const onSaveRosters = () =>
    saveData(() => dispatch(addShiftRosters(mockData.rosters)));

  const onSaveTargets = () => saveData(() => postTargets(mockData.targets));

  const onSavePlans = () =>
    saveData(() => dispatch(addDispatchs(mockData.plans)));

  const onSaveMaterials = () =>
    saveData(
      async () => {
        const { data: newMaterials } = await dispatch(
          addMaterials(mockData.materials)
        );
        return newMaterials;
      },
      (newMaterials: any) => {
        setResource({
          ...resource,
          materials: [...resource.materials, ...newMaterials],
        });
        onClickGenerateMockData();
      }
    );

  const onSaveEventMetas = () =>
    saveData(() => postEventMetas(mockData.eventMetas));

  const onSaveEvents = () =>
    saveData(() => dispatch(addEvents({ records: mockData.events })));

  const handleUploadFile = async (type: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    switch (type) {
      case "user":
        await dispatch(upsertUsers(formData));
        break;
      case "fleet":
        await dispatch(upsertVehicles(formData));
        break;
      case "material":
        await dispatch(upsertMaterials(formData));
        break;
      default:
        break;
    }

    handleCloseUploadModal();
  };

  return (
    <React.Fragment>
      {(isGenerating || isLoading || isSaving) && (
        <div
          className="position-absolute top-0 start-0 bg-light"
          style={{
            width: "calc(100vw - 24px)",
            height: "calc(100% - 24px)",
            opacity: 0.75,
            zIndex: 9999,
          }}
        >
          <div
            style={{ height: "50px", top: "450px" }}
            className="position-sticky mx-auto"
          >
            <Spin tip="Loading" size="large" />
            {isLoading && (
              <p className="mt-2 text-white text-center">
                Loading resources for mock data, please wait...
              </p>
            )}
            {isGenerating && (
              <p className="mt-2 text-white text-center">
                Generating mock data, please wait...
              </p>
            )}
            {isSaving && (
              <p className="mt-2 text-white text-center">Saving data...</p>
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
              <Button onClick={onClickGenerateMockData}>Generate</Button>
              <Button onClick={handleOpenUploadModal}>Upload CSV File</Button>
            </Col>
          </Row>
          {resource?.users && (
            <AutoTable data={resource?.users} title="Users" />
          )}
          {mockData.rosters && (
            <AutoTable
              data={mockData.rosters}
              title="Rosters"
              onSave={onSaveRosters}
            />
          )}
          {mockData.targets && (
            <AutoTable
              data={mockData.targets}
              title="Targets"
              onSave={onSaveTargets}
            />
          )}
          {mockData.materials?.length > 0 && (
            <AutoTable
              data={mockData.materials}
              title="Materials"
              onSave={onSaveMaterials}
            />
          )}
          {mockData.plans && (
            <AutoTable
              data={mockData.plans}
              title="Plans"
              onSave={onSavePlans}
            />
          )}
          {mockData.eventMetas && (
            <AutoTable
              data={mockData.eventMetas}
              title="Event Metas"
              onSave={onSaveEventMetas}
            />
          )}
          {mockData.events && (
            <AutoTable
              data={mockData.events}
              title="Events"
              onSave={onSaveEvents}
            />
          )}
        </Container>
      </div>
      <UploadCsvModal
        isOpen={isOpenUploadModal}
        onClose={handleCloseUploadModal}
        onUpload={handleUploadFile}
      />
    </React.Fragment>
  );
};
export default Mock;
