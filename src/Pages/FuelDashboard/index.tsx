import React, { useCallback, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Segmented } from "antd";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "../FuelScheduler/styles/scheduler.css";
import SchedulerTools from "Pages/FuelScheduler/components/SchedulerTools";
import SchedulerDashboard from "Pages/FuelScheduler/components/SchedulerDashboard";
import SchedulerSidebar from "Pages/FuelScheduler/components/SchedulerSidebar";
import { sampleEvents } from "Pages/FuelScheduler/data/sampleData";
import { Events, DraggedEvent } from "Pages/FuelScheduler/interfaces/types";

moment.updateLocale("en-gb", {
  week: {
    dow: 1,
  },
});

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

const FuelDashboard = (props: any) => {
  document.title = "Fuel Dashboard | FMS Live";
  const [displayType, setDisplayType] = useState<string>("DASHBOARD");
  const [events, setEvents] = useState<Events[]>(sampleEvents);
  const [view, setView] = useState<View>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedEvent, setDraggedEvent] = useState<DraggedEvent | null>(null);
  const [modal, setModal] = useState<boolean>(false);
  const [modalInitialValues, setModalInitialValues] = useState({
    title: "",
    equipment: "",
    start: "",
    end: "",
  });

  const toggle = useCallback(() => {
    if (modal)
      setModalInitialValues({
        title: "",
        equipment: "",
        start: "",
        end: "",
      });

    setModal(!modal);
  }, [modal]);

  const onDisplayTypeChange = (displayInfo: string) => {
    setDisplayType(displayInfo);
  };

  const onEventDrop = useCallback(
    ({ event, start, end }) => {
      const updatedEvent = { ...event, start, end };
      const filteredEvents = events.filter((ev) => ev.id !== event.id);
      setEvents([...filteredEvents, updatedEvent]);
    },
    [events]
  );

  const onEventResize = useCallback(
    ({ event, start, end }) => {
      const updatedEvent = { ...event, start, end };
      const filteredEvents = events.filter((ev) => ev.id !== event.id);
      setEvents([...filteredEvents, updatedEvent]);
    },
    [events]
  );

  const newEvent = useCallback(
    (event) => {
      setEvents((prev) => {
        const idList = prev.map((item) => item.id);
        const newId = Math.max(...idList) + 1;
        return [...prev, { ...event, id: newId, status: "in Progress" }];
      });
    },
    [setEvents]
  );

  const onDropFromOutside = useCallback(
    ({ start, end }) => {
      if (!draggedEvent) return;

      const { name } = draggedEvent;

      setModalInitialValues((prevState) => ({
        ...prevState,
        title: name,
        start,
        end,
      }));
      toggle();
    },
    [draggedEvent, toggle]
  );

  const handleNavigate = (action: string) => {
    switch (action) {
      case "TODAY":
        setCurrentDate(new Date());
        break;
      case "PREV":
        if (view === "day") {
          setCurrentDate(moment(currentDate).subtract(1, "day").toDate());
        }
        break;
      case "NEXT":
        if (view === "day") {
          setCurrentDate(moment(currentDate).add(1, "day").toDate());
        }
        break;
      default:
        break;
    }
  };

  const formats = {
    timeGutterFormat: (date, culture, localizer) =>
      localizer.format(date, "h A", culture),
    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
      `${localizer.format(start, "h:mm A", culture)} - ${localizer.format(
        end,
        "h:mm A",
        culture
      )}`,
  };

  const handleSelectSlot = useCallback(({ start, end }) => {
    setModalInitialValues((prevState) => ({ ...prevState, start, end }));
    setModal(true);
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container className="fuel-scheduler" fluid>
          <Breadcrumb title="Dashboards" breadcrumbItem="Fuel Dashboard" />
          <Row className="mb-3">
            <Col className="d-flex flex-row-reverse">
              <Segmented
                className="customSegmentLabel customSegmentBackground"
                value={displayType}
                onChange={onDisplayTypeChange}
                options={[
                  { value: "CALENDAR", label: "Calendar" },
                  { value: "DASHBOARD", label: "Dashboard" },
                ]}
              />
            </Col>
          </Row>
          <Row>
            <DndProvider backend={HTML5Backend}>
              <Col className="fuel-scheduler-calendar">
                {displayType === "CALENDAR" ? (
                  <Card className="mb-1">
                    <CardBody className="p-0">
                      <div style={{ height: "calc(100vh - 260px)" }}>
                        <DragAndDropCalendar
                          localizer={localizer}
                          view={view}
                          onView={setView}
                          events={events}
                          style={{ height: "100%" }}
                          date={currentDate}
                          onEventDrop={onEventDrop}
                          onDropFromOutside={onDropFromOutside}
                          onSelectSlot={handleSelectSlot}
                          selectable
                          onEventResize={onEventResize}
                          step={60}
                          timeslots={1}
                          showMultiDayTimes
                          formats={formats}
                          views={["day"]}
                          components={{
                            toolbar: (props) => (
                              <SchedulerTools
                                {...props}
                                toggle={toggle}
                                modal={modal}
                                modalInitialValues={modalInitialValues}
                                onNavigate={handleNavigate}
                                newEvent={newEvent}
                                onView={setView}
                                view={view}
                              />
                            ),
                          }}
                        />
                      </div>
                    </CardBody>
                  </Card>
                ) : (
                  <SchedulerDashboard draggedEvent={draggedEvent} />
                )}
              </Col>
              <Col lg="3">
                <SchedulerSidebar setDraggedEvent={setDraggedEvent} />
              </Col>
            </DndProvider>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default FuelDashboard;
