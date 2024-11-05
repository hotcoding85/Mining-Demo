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

import { DatePicker, DatePickerProps, Space, Avatar, Tooltip, Badge } from "antd";

import dayjs from "dayjs";
import "./styles/GanttScheduler.scss";
import "../../App.css";
import {
  hd1500,
  hd785,
  pc1250,
  pc2000,
  placeHolder,
  wa600,
  d375,
  t45,
} from "assets/images/equipment";
import {
  getAllBenches,
  getAllFleet,
  getDispatchs,
  addDispatch,
  updateDispatch,
  removeDispatch,
  getAllMaterials,
} from "slices/thunk";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { debounce } from "lodash";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { usePlans } from "Hooks/usePlans";
import { FleetSelector, MaterialSelector } from "selectors";
import { colors } from './data/sampleData'

import { MoonOutlined, SunOutlined } from "@ant-design/icons";

const GanttScheduler: React.FC = () => {
  document.title = "Gantt Scheduler | FMS Live";
  const dispatch: any = useDispatch();
  const { fleet } = useSelector(FleetSelector);
  const { materials } = useSelector(MaterialSelector)
  const { benches, fleets, fences } = useSelector(
    createSelector(
      (state: any) => state,
      (state) => {
        return {
          benches: state.Benches.data,
          fleets: state.Fleet.data,
          fences: state.GeoFences.fences
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
  const categoryOrder = ["EXCAVATOR", "LOADER", "DOZER", "DRILLER"];
  const excavatorFilter = useCallback(
    (vehicle) =>
      vehicle?.category !== "DUMP_TRUCK" 
      &&
      (vehicle?.status === "ACTIVE" || vehicle?.status === "STANDBY")
      ,
    []
  );

  const excavators = useMemo(() => {
    // First filter the fleets
    const filteredFleets = fleets.filter((fleet) => excavatorFilter(fleet));
  
    // Then sort by category and name
    return filteredFleets.sort((a, b) => {
      // Sort by category using the predefined order
      const categoryAIndex = categoryOrder.indexOf(a.category);
      const categoryBIndex = categoryOrder.indexOf(b.category);
      if (categoryAIndex !== categoryBIndex) {
        return categoryAIndex - categoryBIndex;
      }
  
      // If categories are the same, sort by name alphabetically
      return a.name.localeCompare(b.name);
    });
  }, [fleets, excavatorFilter]);

  const [orderedData, setOrderedData] = useState(excavators)
  useEffect(() => {
    setOrderedData(excavators)
  }, [excavators])

  const [heights, setHeights] = useState<any[]>(
    excavators.map((excavator) => ({
      excavatorId: excavator.id,
      height: 50,
      category: excavator.category,
      capacity: excavator.capacity
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
    dispatch(getAllMaterials(1, 100)); // Dispatch action to fetch data on component mount
  }, [dispatch]);

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
    () => {
      return benches
      .filter((bench) => bench.status === "ACTIVE" && bench.category === "SOURCE")
      .map((bench) => {
        // Find the material associated with this bench
        const material = materials.find((mat) => mat.id === bench.materialId);

        // Use material color if it exists and is defined, otherwise assign random color
        const color = material?.color || colors[Math.floor(Math.random() * colors.length)];

        return {
          ...bench,
          color,
          materialName: material?.name || "Unknown", // Optionally add material name or other fields
        };
      });
    },
    [benches, materials]
  );
  const archiveBenches = useMemo(
    () => {
      return benches
        .filter((item) => item.status === "ARCHIVE" && item.category === 'SOURCE')
        .map((bench) => ({
          ...bench,
          color: colors[Math.floor(Math.random() * colors.length)] // Assign random color
        }));
    },
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

  function containsCaseInsensitive(str: string, substr: string): boolean {
    return str.toLowerCase().includes(substr.toLowerCase());
  }

  const getImage = (category: string) => {
    if (!category) {
      return placeHolder;
    }

    if (containsCaseInsensitive(category, "hd785")) {
      return hd785;
    } else if (containsCaseInsensitive(category, "hd1500")) {
      return hd1500;
    } else if (containsCaseInsensitive(category, "pc1250")) {
      return pc1250;
    } else if (containsCaseInsensitive(category, "pc2000")) {
      return pc2000;
    } else if (containsCaseInsensitive(category, "wa600")) {
      return wa600;
    } else if (containsCaseInsensitive(category, "d375")) {
      return d375;
    } else if (containsCaseInsensitive(category, "t45")) {
      return t45;
    } else {
      return placeHolder;
    }
  };

  useEffect(() => {
    console.log(plans)
  },[ plans ])

  return (
    <React.Fragment>
      <div className="page-content" style={{paddingBottom: '0rem'}}>
        <Container fluid>
          <DndProvider backend={HTML5Backend}>
            <Row className="mb-3">
              <Col xs={12}>
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
                        size="middle"
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
                <Row>
                  <Col md={9} sm={8} xs={12} className="plan-left">
                    <Card style={{marginBottom: '0px'}}>
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
                        _setOrderedData={setOrderedData}
                      />
                    </Card>
                    <div className="row mt-2">
                      {excavators.map((equipment) => {
                        const equipmentPlans = plans.filter(plan => {
                          if (plan.excavatorId !== equipment.id) return false;
                          // Parse the selectedDate to create Date objects for shift boundaries
                          const startOfDay = new Date(selectedDate);
                          startOfDay.setHours(0, 0, 0, 0);
                          
                          // Set shift boundaries
                          let shiftStart, shiftEnd;
                          
                          if (shiftType === "DAY_SHIFT") {
                            shiftStart = new Date(startOfDay);
                            shiftStart.setHours(6, 0, 0, 0); // 06:00 of selectedDate
                        
                            shiftEnd = new Date(startOfDay);
                            shiftEnd.setHours(18, 0, 0, 0); // 18:00 of selectedDate
                          } else if (shiftType === "NIGHT_SHIFT") {
                            shiftStart = new Date(startOfDay);
                            shiftStart.setHours(18, 0, 0, 0); // 18:00 of selectedDate
                        
                            shiftEnd = new Date(startOfDay);
                            shiftEnd.setDate(shiftEnd.getDate() + 1); // Move to the next day
                            shiftEnd.setHours(6, 0, 0, 0); // 06:00 of the next date
                          }
                        
                          // Check if the plan's start time is within the shift boundaries
                          const planStartTime = new Date(plan.startTime);
                          return planStartTime >= shiftStart && planStartTime < shiftEnd;
                        }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
                        // Calculate total duration in milliseconds
                        const totalDurationMs = equipmentPlans.reduce((total, plan) => {
                          const start = new Date(plan.startTime).getTime();
                          const end = new Date(plan.endTime).getTime();
                          return total + (end - start);
                        }, 0);
                        // Convert milliseconds to hours and minutes
                        const hours = Math.floor(totalDurationMs / (1000 * 60 * 60));
                        const minutes = Math.floor((totalDurationMs % (1000 * 60 * 60)) / (1000 * 60));
                        const firstPlan = equipmentPlans ? equipmentPlans[0] : null
                        // Format as hh:mm
                        const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                        return (
                          <Col sm={6} xs={6} lg={4} key={equipment.id}>
                            <Card className="p-2 flex items-center space-x-4 aggregate-item">
                              <div className="d-flex items-center" style={{flexDirection: 'row', height: '150px', alignItems: 'center'}}>
                                <div style={{ flexDirection: 'column', display: 'flex', alignItems: 'center', marginRight: '2rem' }}>
                                  <Avatar style={{ backgroundColor: '#00000080' }} size={48}>
                                    <img style={{ width: '30px', height: '30px' }} src={getImage(equipment.model)} alt="equipment" />
                                  </Avatar>
                                  <h5 className="font-bold" style={{ marginBottom: '0px', fontSize:"16px" }}>{equipment.name}</h5>
                                  <h6 style={{marginBottom: '0px', marginTop: '1rem', fontSize: '12px'}}>{shiftType == 'NIGHT_SHIFT' ? <MoonOutlined style={{marginRight: '5px'}} /> : <SunOutlined style={{color: "gold", marginRight: '5px'}} />}{duration + ' / 12:00'}</h6> 
                                </div>
                                <div style={{ flexDirection: 'column', display: 'flex', alignItems: 'center' }}>
                                  {firstPlan ?
                                    <div className="plan-item-tooltip-content" style={{fontSize: '11px'}}>
                                      <div><strong>Plan: </strong> {firstPlan.name}</div>
                                      <div><strong>Time: </strong> 
                                        {new Date(firstPlan.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ~ ' +
                                          new Date(firstPlan.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                      <div><strong>Block ID: </strong> {firstPlan?.source?.blockId}</div>
                                      <div><strong>Density: </strong> {firstPlan?.source?.density}</div>
                                      <div><strong>Grade: </strong> {firstPlan?.source?.grade}</div>
                                      <div><strong>Tonnes: </strong> {firstPlan?.source?.volume - firstPlan?.source?.tonnes}</div>
                                      <div><strong>Remainder: </strong> {firstPlan?.source?.tonnes || '---'}</div>
                                    </div> :
                                    <div>
                                      <strong>No assigned plan</strong>
                                    </div>
                                  }
                                </div>
                              </div>
                              <span
                                className="equipment-status"
                                style={{ backgroundColor: equipment.state === 'ACTIVE' ? '#0f9d58' : equipment.state !== 'STANDBY' ? '#db4437' : '#F7B31A' }}
                              >
                                  {equipment.state}
                              </span>
                            </Card>
                          </Col>
                        );
                      })}
                    </div>
                  </Col>
                  <Col md={3} sm={4} xs={12} className="plan-right">
                    <Badge.Ribbon placement="start" text="NO TIME ASSIGNED" color="Orange" style={{fontWeight: 600, fontSize: '14px'}}>
                      <Card>
                        <NoAssignPlanList
                          plans={noAssignedPlans}
                          title={"NO TIME ASSIGNED"}
                        />
                      </Card>
                    </Badge.Ribbon>
                    <Badge.Ribbon text="ACTIVE BENCHES" color="green" style={{fontWeight: 600, fontSize: '14px'}}>
                      <Card>
                        <PlanList plans={activeBenches} title={"ACTIVE BENCHES"} />
                      </Card>
                    </Badge.Ribbon>
                    <Badge.Ribbon placement="start" text="ARCHIVED BENCHES (in last 7 days)" color="Purple" style={{fontWeight: 600, fontSize: '14px'}}>
                      <Card>
                        <PlanList
                          plans={archiveBenches}
                          title={"ARCHIVED BENCHES (in last 7 days)"}
                        />
                      </Card>
                    </Badge.Ribbon>
                  </Col>
                </Row>
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
