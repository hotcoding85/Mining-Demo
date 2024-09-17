import React, { useState, useCallback } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "moment/locale/en-gb";
import Sidebar from "./Sidebar";
import CalendarHeader from "./CalendarHeader/CalendarHeader";
import "./styles/Scheduler.scss";
import { equipmentList, sampleEvents } from "./data/sampleData";
import { DraggedEvent, Events } from "./interfaces/types";

//to start week from monday
moment.updateLocale("en-gb", {
  week: {
    dow: 1,
  },
});

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

const MaintenanceScheduler = () => {
  document.title = "Maintenance Scheduler | FMS Live";

  const [events, setEvents] = useState<Events[]>(sampleEvents);
  const [draggedEvent, setDraggedEvent] = useState<DraggedEvent | null>(null);

  const [view, setView] = useState<View>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [equipments, setEquipments] = useState(equipmentList);

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

  const handleNavigate = (action: string) => {
    switch (action) {
      case "TODAY":
        setCurrentDate(new Date());
        break;
      case "PREV":
        if (view === "day") {
          setCurrentDate(moment(currentDate).subtract(1, "day").toDate());
        } else if (view === "week") {
          setCurrentDate(moment(currentDate).subtract(1, "week").toDate());
        } else if (view === "month") {
          setCurrentDate(moment(currentDate).subtract(1, "month").toDate());
        } else if (view === "agenda") {
          setCurrentDate(moment(currentDate).subtract(1, "month").toDate());
        }
        break;
      case "NEXT":
        if (view === "day") {
          setCurrentDate(moment(currentDate).add(1, "day").toDate());
        } else if (view === "week") {
          setCurrentDate(moment(currentDate).add(1, "week").toDate());
        } else if (view === "month") {
          setCurrentDate(moment(currentDate).add(1, "month").toDate());
        } else if (view === "agenda") {
          setCurrentDate(moment(currentDate).add(1, "month").toDate());
        }
        break;
      default:
        break;
    }
  };

  const newEvent = useCallback(
    (event) => {
      const equipmentInfo = equipments.filter(
        (equipment) => equipment.name === event.title
      );

      const updatedEquipments = equipments.filter(
        (equipment) => equipment.name !== event.title
      );

      setEvents((prev) => {
        const idList = prev.map((item) => item.id);
        const newId = Math.max(...idList) + 1;

        return [
          ...prev,
          { ...event, id: newId, status: "In Progress", equipmentInfo },
        ];
      });

      setEquipments(updatedEquipments);
    },
    [setEvents, equipments]
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
          [type]:
            type === "resourceLabor"
              ? overlappedEvent.resourceLabor
                ? overlappedEvent.resourceLabor.includes(name)
                  ? overlappedEvent.resourceLabor
                  : [...overlappedEvent.resourceLabor, name]
                : [name]
              : name,
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

  const handleReadyToWorkClick = (completedEvent) => {
    setEvents((prevState) =>
      prevState.filter((event) => event.id !== completedEvent.event.id)
    );
    setEquipments((prevState) => [
      ...prevState,
      completedEvent.event.equipmentInfo,
    ]);
  };

  const onEventClick = useCallback(
    (event) => {
      setView("day");
      setCurrentDate(new Date(event.start));
    },
    [setView, setCurrentDate]
  );

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb
            title="Maintenance"
            breadcrumbItem="Maintenance Scheduler"
          />
          <Row>
            <DndProvider backend={HTML5Backend}>
              <Col lg="9">
                <Card className="h-99">
                  <CardBody className="p-0">
                    <div
                      className="maintenance-scheduler-calendar"
                      style={{ height: "calc(100vh - 260px)" }}
                    >
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
                        onSelectEvent={onEventClick}
                        step={60}
                        timeslots={1}
                        showMultiDayTimes
                        formats={formats}
                        views={["month", "week", "day", "agenda"]}
                        components={{
                          toolbar: (props) => (
                            <CalendarHeader
                              {...props}
                              toggle={toggle}
                              modal={modal}
                              modalInitialValues={modalInitialValues}
                              onNavigate={handleNavigate}
                              newEvent={newEvent}
                              onView={setView}
                              view={view}
                              equipments={equipments}
                            />
                          ),

                          event: (event) => (
                            <CustomEvent
                              event={event}
                              view={view}
                              handleReadyToWorkClick={handleReadyToWorkClick}
                            />
                          ),
                        }}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col lg="3">
                <Sidebar
                  setDraggedEvent={setDraggedEvent}
                  equipments={equipments}
                />
              </Col>
            </DndProvider>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

const CustomEvent = ({ event, view, handleReadyToWorkClick }) => {
  const eventStatusClass =
    event.event.status === "completed"
      ? "event-completed"
      : "event-in-progress";

  return view === "month" ? (
    <div className={`${eventStatusClass}`}>
      <span className="event-title event-title-month">{event.title}</span>
    </div>
  ) : (
    <div
      className={`d-flex flex-column align-items-center justify-content-between gap-4 h-100 event-direction ${eventStatusClass}`}
    >
      <>
        <div>
          <div className="d-flex align-items-center justify-content-center flex-wrap gap-2 my-2">
            <p className="text-center mb-0 p-2 event-title">{event.title}</p>
            <span className={`position-relative event-status`}>
              {event.event.status}
            </span>
          </div>
          <div className="d-flex flex-column align-items-center gap-2 event-chip-wrap">
            {event.event.workLocation && (
              <p className="text-center mb-0 p-2 event-chip">
                {event.event.workLocation}
              </p>
            )}

            <div className="d-flex align-items-center justify-content-center flex-wrap gap-2">
              {event.event.serviceInterval && (
                <p className="text-center mb-0 p-2 event-chip">
                  {event.event.serviceInterval}
                </p>
              )}
              {event.event.resourceLabor &&
                event.event.resourceLabor.map((labor) => (
                  <p className="text-center mb-0 p-2 event-chip event-chip-filter">
                    {labor}
                  </p>
                ))}
            </div>
            {event.event.reason && (
              <p className="text-center mb-0 p-2 event-chip">
                {event.event.reason}
              </p>
            )}
          </div>
        </div>
        <div className="event-ready-btn ms-auto">
          <button
            type="button"
            onClick={() => handleReadyToWorkClick(event)}
            disabled={event.event.status === "In Progress"}
          >
            Ready to Return to Work
            <svg
              width="21"
              height="16"
              viewBox="0 0 21 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.5185 16.9848L20.389 7.85716L11.2613 -1.01323L9.94715 0.33902L16.7085 6.90974L0.37673 7.14313L0.405308 9.14292L16.7369 8.90954L10.1662 15.6707L11.5185 16.9848Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
      </>
    </div>
  );
};

export default MaintenanceScheduler;
