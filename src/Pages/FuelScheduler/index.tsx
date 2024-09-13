import React, { useCallback, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Segmented } from "antd";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  DraggedEvent,
  Events,
} from "Pages/MaintenanceScheduler/interfaces/types";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { sampleEvents } from "./data/sampleData";
import SchedulerTools from "./components/SchedulerTools";
import SchedulerDashboard from "./components/SchedulerDashboard";
import SchedulerSidebar from "./components/SchedulerSidebar";
import "./styles/scheduler.css";

moment.updateLocale("en-gb", {
  week: {
    dow: 1,
  },
});

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

const FuelScheduler = (props: any) => {
  document.title = "Fuel Scheduler | FMS Live";
  const [displayType, setDisplayType] = useState<string>("CALENDAR");
  const [events, setEvents] = useState<Events[]>(sampleEvents);
  const [view, setView] = useState<View>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedEvent, setDraggedEvent] = useState<DraggedEvent | null>(null);
  const [modal, setModal] = useState<boolean>(false);
  const [modalInitialValues, setModalInitialValues] = useState({
    title: "",
    workLocation: "",
    serviceInterval: "",
    reason: "",
    resourceLabor: "",
    start: "",
    end: "",
  });

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
  const isEventOverlapping = useCallback(
    (newEvent) => {
      return events.find((existingEvent) => {
        return (
          newEvent.start < existingEvent.end &&
          newEvent.end > existingEvent.start
        );
      });
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
      const draggedEventDeatils = { start, end };
      if (!draggedEvent) return;

      const { name, type } = draggedEvent;

      if (type === "title") {
        const event = {
          title: name,
          start,
          end,
        };
        setDraggedEvent(null);

        newEvent(event);
      } else {
        const overlappedEvent = isEventOverlapping(draggedEventDeatils);
        if (!overlappedEvent) return;

        const updatedOverlappedEvent = {
          ...overlappedEvent,
          [type]: name,
        };

        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === overlappedEvent.id ? updatedOverlappedEvent : event
          )
        );

        setDraggedEvent(null);
      }
    },
    [draggedEvent, newEvent, isEventOverlapping, setEvents]
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

  const toggle = useCallback(() => {
    if (modal)
      setModalInitialValues({
        title: "",
        workLocation: "",
        serviceInterval: "",
        reason: "",
        resourceLabor: "",
        start: "",
        end: "",
      });

    setModal(!modal);
  }, [modal]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Mine Control" breadcrumbItem="Fuel Scheduler" />
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
              <Col>
                {displayType === "CALENDAR" ? (
                  <Card>
                    <CardBody className="p-0">
                      <div style={{ height: "720px" }}>
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
                  <SchedulerDashboard />
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

export default FuelScheduler;
