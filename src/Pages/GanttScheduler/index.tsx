import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ShiftSelector from "./ShiftSelector";
import ZoomControl from "./ZoomControl";
import TableComponent from "./TableComponent";
import PlanList from "./PlanList/PlanList";
import NoAssignPlanList from "./PlanList/NoAssignPlanList";
import PlanModal from "./PlanModal";
import { Card, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { ShiftType, Plan, resourceHeight } from "./interfaces/type";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DatePicker, DatePickerProps, Space } from "antd";
import dayjs from "dayjs";
import "./styles/GanttScheduler.scss";
import "../../App.css";
import {
  getAllBenches,
  getAllFleet,
  getDispatchs,
  addDispatch,
  updateDispatch,
  removeDispatch,
} from "slices/thunk";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { debounce } from "lodash";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { usePlans } from "Hooks/usePlans";

const GanttScheduler: React.FC = () => {
  document.title = "Gantt Scheduler | FMS Live";
  const dispatch: any = useDispatch();

  const { benches, fleets } = useSelector(
    createSelector(
      (state: any) => state,
      (state) => {
        return {
          benches: state.Benches.data,
          fleets: state.Fleet.data,
        };
      }
    )
  );
  const { mergedPlans } = usePlans();
  const zoomSteps = [5, 15, 30, 60, 180, 360, 720];
  const minZoom = zoomSteps[0];
  const maxZoom = zoomSteps[zoomSteps.length - 1];

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [shiftType, setShiftType] = useState<ShiftType>("DAY_SHIFT");
  const [zoomSize, setZoomSize] = useState<number>(60);
  const [plans, setPlans] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalPlan, setModalPlan] = useState<any>();
  const [requestCount, setRequestCount] = useState<number>(0);

  const [roster, setRoster] = useState<string>(
    format(selectedDate, "yyyy-MM-dd") +
    ":" +
    (shiftType === "DAY_SHIFT" ? "DS" : "NS")
  );

  const addRequestCount = useCallback(
    () => setRequestCount((prev) => (prev === 0 ? prev + 2 : prev + 1)),
    [setRequestCount]
  );

  const reduceRequestCount = useCallback(
    () => setRequestCount((prev) => prev - 1),
    [setRequestCount]
  );

  const excavatorFilter = useCallback(
    (vehicle) =>
      vehicle?.category === "EXCAVATOR" &&
      (vehicle?.state === "ACTIVE" || vehicle?.state === "STANDBY"),
    []
  );

  const excavators = useMemo(() => {
    return fleets.filter((fleet) => excavatorFilter(fleet));
  }, [fleets, excavatorFilter]);

  const [heights, setHeights] = useState<any[]>(
    excavators.map((excavator) => ({
      excavatorId: excavator.excavatorId,
      height: 50,
    }))
  );

  useEffect(() => {
    const hour = new Date().getHours();
    setShiftType(hour >= 6 && hour < 18 ? "DAY_SHIFT" : "NIGHT_SHIFT");
    if (hour < 6) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      setSelectedDate(yesterday);
    } else {
      setSelectedDate(new Date());
    }
  }, []);

  useEffect(() => {
    const result =
      format(selectedDate, "yyyy-MM-dd") +
      ":" +
      (shiftType === "DAY_SHIFT" ? "DS" : "NS");
    setRoster(result);
  }, [selectedDate, shiftType]);

  useEffect(() => {
    dispatch(getAllBenches(1, 200));
    dispatch(getAllFleet(1, 200));
  }, []);

  useEffect(() => {
    dispatch(getDispatchs(roster)); //set roster
  }, [roster]);

  useEffect(() => {
    if (requestCount === 0) {
      addSavedPlans();
    } else if (requestCount === 1) {
      addSavedPlans();
      toast.success(`Operation completed successfully.`, { autoClose: 2000 });
    }
  }, [mergedPlans]);

  const activeBenches = useMemo(
    () => benches.filter((item) => item.status === "ACTIVE" && item.category === 'SOURCE'),
    [benches]
  );
  const archiveBenches = useMemo(
    () => benches.filter((item) => item.status === "ARCHIVE" && item.category === 'SOURCE'),
    [benches]
  );

  const convertData = (plans: any) => {
    const result = plans.map((item: any) => ({
      ...item,
      startTime: new Date(item?.startTime),
      endTime: new Date(item?.endTime),
      blockId: item?.source?.blockId,
      name: item?.source?.name,
      status: item?.status,
      roster: item?.roster,
    }));

    return result;
  };

  const noAssignedPlans = useMemo(() => {
    return convertData(mergedPlans.filter((item) => !item.startTime));
  }, [mergedPlans]);

  const addSavedPlans = () => {
    const result = convertData(mergedPlans.filter((item) => !!item.startTime));
    setPlans(result);
  };

  const addPlan = async (excavatorId: string, startTime: Date, plan: any) => {
    const defaultDuration = 60 * 60 * 1000; // 1 hour in milliseconds
    const endTime = new Date(startTime.getTime() + defaultDuration);
    const newPlan: any = {
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
      excavatorId,
      sourceId: plan?.sourceId || plan.id,
      status: "PLANNED",
      roster: plan?.roster || roster,
      color: plan?.color || "#ff6247",
    };
    if (!!plan.excavatorId) {
      if (excavatorId === plan.excavatorId) {
        setPlans((prevPlans) => [
          ...prevPlans,
          {
            ...newPlan,
            startTime,
            endTime,
            blockId: plan.blockId,
            name: plan.name,
          },
        ]);
        const result = {
          ...newPlan,
          excavatorId: plan.excavatorId,
        };
        addRequestCount();
        await dispatch(updateDispatch(plan.id, result, true));
        reduceRequestCount();
      } else {
        toast.warning("Excavator is not matched!", { autoClose: 2000 });
      }
    } else if (!confirm(newPlan)) {
      addRequestCount();
      await dispatch(addDispatch(newPlan, true));
      reduceRequestCount();
    } else {
      toast.warning("Unable to assign benches. Please try again.", {
        autoClose: 2000,
      });
    }
  };

  const confirm = (plan) => {
    const selectedPlans = mergedPlans.filter(
      (item: any) => item.excavatorId === plan.excavatorId
    );
    const exist = selectedPlans.find(
      (item) =>
        (item.startTime <= plan.startTime &&
          item.endTime >= plan.startTime &&
          item.id !== plan?.id) ||
        (item.startTime < plan.endTime &&
          item.endTime >= plan.endTime &&
          item.id !== plan?.id) ||
        (item.sourceId === plan.sourceId && item.id !== plan?.id)
    );
    return exist;
  };

  const save = async (updatedPlan: any) => {
    const result = {
      startTime: updatedPlan.startTime.getTime(),
      endTime: updatedPlan.endTime.getTime(),
      excavatorId: updatedPlan.excavatorId,
      sourceId: updatedPlan.sourceId,
      status: updatedPlan.status || "PLANNED",
      roster: updatedPlan.roster || roster, // Assuming `roster` is defined in the outer scope
      color: updatedPlan.color || "#ff6247",
    };
    addRequestCount();
    await dispatch(updateDispatch(updatedPlan.id, result, true));
    reduceRequestCount();
  };

  const debouncedSave = useCallback(
    debounce((updatedPlan) => save(updatedPlan), 500),
    []
  );

  const updatePlan = (updatedPlan: Plan, flag: string) => {
    const updatePlans = () => {
      setPlans((prevPlans: any[]) =>
        prevPlans.map((plan) =>
          plan.id === updatedPlan.id ? updatedPlan : plan
        )
      );
      debouncedSave.cancel();
      debouncedSave(updatedPlan);
    };

    if (flag === "scroll") {
      updatePlans();
    } else if (flag === "drag" && !confirm(updatedPlan)) {
      updatePlans();
    } else {
      toast.warning("Unable to assign benches. Please try again.", {
        autoClose: 2000,
      });
    }
  };

  const editPlan = (updatedPlan: Plan) => {
    if (!confirm(updatedPlan)) {
      setPlans((prevPlans: Plan[]) =>
        prevPlans.map((plan) =>
          plan.id === updatedPlan.id ? updatedPlan : plan
        )
      );
      save(updatedPlan);
    } else {
      toast.warning("Unable to assign benches. Please try again.", {
        autoClose: 2000,
      });
    }
  };

  const openModal = (plan?: Plan) => {
    setModalPlan(plan);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalPlan(undefined);
  };

  const deletePlan = async (planId) => {
    closeModal();
    addRequestCount();
    await dispatch(removeDispatch(planId, true));
    reduceRequestCount();
  };

  const onDateChange: DatePickerProps["onChange"] = (date, dateString) => {
    if (date) {
      setSelectedDate(date.toDate());
    }
  };

  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = Number(event.target.value);
    const nearestZoom = zoomSteps.reduce((prev, curr) =>
      Math.abs(curr - newZoom) < Math.abs(prev - newZoom) ? curr : prev
    );
    setZoomSize(nearestZoom);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <DndProvider backend={HTML5Backend}>
            <Row className="mb-3">
              <Col xs={10} className="plan-left">
                <Breadcrumb
                  breadcrumbItem="Gantt Scheduler"
                  title="Operations"
                />
                <Row className="mb-3">
                  <Col className="d-flex justify-content-end fle">
                    <Space>
                      <div className="scheduler-tool">
                        <ZoomControl
                          minZoom={minZoom}
                          maxZoom={maxZoom}
                          steps={zoomSteps}
                          handleZoomChange={handleZoomChange}
                          currentZoom={zoomSize}
                        />
                      </div>
                      <DatePicker
                        size="large"
                        allowClear={false}
                        value={dayjs(selectedDate)}
                        onChange={onDateChange}
                      />
                      <ShiftSelector
                        shiftType={shiftType}
                        setShiftType={setShiftType}
                      />
                    </Space>
                  </Col>
                </Row>
                <Card>
                  <TableComponent
                    data={excavators}
                    plans={plans}
                    setPlans={setPlans}
                    selectedDate={selectedDate}
                    shiftType={shiftType}
                    zoomSize={zoomSize}
                    addPlan={addPlan}
                    updatePlan={updatePlan}
                    heights={heights}
                    openModal={openModal}
                  />
                </Card>
              </Col>

              <Col xs={2} className="plan-right">
                <Card>
                  <NoAssignPlanList
                    plans={noAssignedPlans}
                    title={"NO TIME ASSIGNED"}
                  />
                </Card>
                <Card>
                  <PlanList plans={activeBenches} title={"ACTIVE BENCHES"} />
                </Card>
                <Card>
                  <PlanList
                    plans={archiveBenches}
                    title={"ARCHIVED BENCHES (in last 7 days)"}
                  />
                </Card>
              </Col>
            </Row>
          </DndProvider>
          <PlanModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSave={editPlan}
            plan={modalPlan}
            plans={activeBenches}
            deletePlan={deletePlan}
          />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default GanttScheduler;
