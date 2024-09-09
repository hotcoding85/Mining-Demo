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
import "./styles/Scheduler.css";

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

  const [events, setEvents] = useState([
    {
      id: 0,
      title: "Meeting with Team",
      start: new Date(2024, 8, 10, 10, 0),
      end: new Date(2024, 8, 10, 15, 0),
    },
    {
      id: 1,
      title: "Lunch with Client",
      start: new Date(2024, 8, 11, 13, 0),
      end: new Date(2024, 8, 11, 19, 0),
    },
    {
      id: 2,
      title: "Project Deadline",
      start: new Date(2024, 8, 15, 0, 0),
      end: new Date(2024, 8, 15, 23, 59),
      allDay: true,
    },
  ]);

  const [view, setView] = useState<View>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const handleNavigate = (action: string, date?: Date) => {
    switch (action) {
      case "DAY":
        setView("day");
        setCurrentDate(date || new Date());
        break;
      case "TODAY":
        setView("month");
        setCurrentDate(new Date());
        break;
      case "PREV":
        if (view === "day") {
          setCurrentDate(moment(currentDate).subtract(1, "day").toDate());
        } else if (view === "week") {
          setCurrentDate(moment(currentDate).subtract(1, "week").toDate());
        } else if (view === "month") {
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
                <Card className="h-100">
                  <CardBody className="p-0">
                    <div style={{ height: "720px" }}>
                      <DragAndDropCalendar
                        localizer={localizer}
                        events={events}
                        style={{ height: "100%" }}
                        view={view}
                        date={currentDate}
                        onEventDrop={onEventDrop}
                        resizable
                        onEventResize={onEventResize}
                        step={60}
                        timeslots={1}
                        formats={formats}
                        components={{
                          toolbar: (props) => (
                            <CalendarHeader
                              {...props}
                              onNavigate={handleNavigate}
                              onView={setView}
                              view={view}
                            />
                          ),

                          event: (event) => (
                            <CustomEvent event={event} view={view} />
                          ),
                        }}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>
              <Col lg="3">
                <Sidebar />
              </Col>
            </DndProvider>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

const CustomEvent = ({ event, view }) => {
  return view === "month" ? (
    <span>{event.title}</span>
  ) : (
    <div className="d-flex flex-column align-items-center gap-2 event-chip-wrap">
      <>
        <p className="text-center mb-0 p-2 event-chip">{event.title}</p>
        <p className="text-center mb-0 p-2 event-chip">250hr</p>
        <p className="text-center mb-0 p-2 event-chip">Inspection</p>
        <p className="text-center mb-0 p-2 event-chip event-chip-filter">
          John Brown (Fitter)
        </p>
        <div className="event-ready-btn ms-auto">
          <button type="button">Ready to Return to Work</button>
        </div>
      </>
    </div>
  );
};

export default MaintenanceScheduler;
