import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row, Spinner } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import MainCard from "./componenets/MainCard";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Space, Tabs } from "antd";
import type { TabsProps } from "antd";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { useDispatch } from "react-redux";
import RightBoard from "Pages/DispatchLive/RightBoard";
import { HaulRoute } from "Pages/DispatchLive/interfaces/type";
import "./styles/style.scss";
import { Material } from "../DispatchLive/interfaces/type";
import "../DispatchLive/styles/style.scss";
import "./styles/style.scss";
import { useMaterials } from "Hooks/useMaterials";
import { useEventmetas } from "Hooks/useEventmetas";
import { useTruckAllocations } from "Hooks/useTruckAllocations";
import { usePlans } from "Hooks/usePlans";
import {
  getAllBenches,
  getAllFleet,
  getAllMaterials,
  getAllVehicleRoutes,
  getDispatchs,
  getShiftRosters,
  getTargetsByRoster,
  getTruckAllocations,
  getEventMetas,
} from "slices/thunk";
import { format } from "date-fns";
import { dumpCentral, dumpNorth, dumpSouth } from "assets/images/locations";

const LocationImages = [dumpNorth, dumpCentral, dumpSouth];

const OreSpotter: React.FC = () => {
  document.title = "Ore tracker | FMS Live";
  const dispatch = useDispatch<any>();

  const { fleets, users, benches, targets, vehicleRoutes, shiftRosters } =
    useSelector(
      createSelector(
        (state: any) => state,
        (state) => {
          return {
            shiftRosters: state.ShiftRosters.data,
            fleets: state.Fleet.data,
            users: state.Users.data,
            benches: state.Benches.data,
            targets: state.Targets.data,
            vehicleRoutes: state.VehicleRoutes.data,
          };
        }
      )
    );

  const { mergedPlans, addNewPlan, updatePlan, changePlan, handlepublishPlan } =
    usePlans();

  const {
    mergedEventmetas,
    addNewEventmeta,
    updateEventmeta,
    removeEventmeta,
    findEventmetaByTruckId,
    handleSubmitEventmeta,
  } = useEventmetas();

  const {
    mergedTruckAllocations,
    findTruckAllocationByTruckId,
    addNewTruckAllocation,
    removeTruckAllocation,
    updateTruckAllocation,
    handleSubmitTruckAllocation,
  } = useTruckAllocations();

  const { materials } = useMaterials();

  const [shift, setShift] = useState<any>(null);
  const [startDate, setStartDate] = useState<any>(null);

  const [selectedTab, setSelectedTab] = useState<string>("All");
  const [diggersForShow, setDiggersForShow] = useState<any[]>([]);

  const [haulRoutes, setHaulRoutes] = useState<HaulRoute[]>([]);
  const [assignedBenches, setAssignedBenches] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const hour = new Date().getHours();
    setShift(hour >= 6 && hour < 18 ? "DS" : "NS");
    if (hour < 6) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      setStartDate(yesterday);
    } else {
      setStartDate(new Date());
    }
  }, []);

  useEffect(() => {
    if (startDate !== null && shift !== null) {
      dispatch(getShiftRosters(format(startDate, "yyyy-MM-dd") + ":" + shift));
      dispatch(
        getTargetsByRoster(format(startDate, "yyyy-MM-dd") + ":" + shift)
      );
      dispatch(getDispatchs(format(startDate, "yyyy-MM-dd") + ":" + shift));
      dispatch(
        getTruckAllocations(format(startDate, "yyyy-MM-dd") + ":" + shift)
      );
      dispatch(getEventMetas(format(startDate, "yyyy-MM-dd") + ":" + shift));
    }
  }, [startDate, shift]);

  useEffect(() => {
    const getAll = async () => {
      dispatch(getAllFleet(1, 200));
      dispatch(getAllBenches(1, 200));
      dispatch(getAllVehicleRoutes(1, 200));
      dispatch(getAllMaterials(1, 200));
    };

    getAll();
  }, []);

  const assignReadyTrucks = (oldTruck, newTruck, excavatorId) => {
    const newAssignTruck = {
      excavatorId: excavatorId,
      roster: newTruck?.roster,
      truckId: newTruck?.vehicleId,
      truck: newTruck?.vehicle,
    };
    if (!!oldTruck) {
      updateTruckAllocation(oldTruck.truckId, newAssignTruck);
    } else {
      addNewTruckAllocation(newAssignTruck);
    }
  };

  const excavatorFilter = useCallback(
    (vehicle) =>
      vehicle?.category === "EXCAVATOR" &&
      (vehicle?.state === "ACTIVE" || vehicle?.state === "STANDBY"),
    []
  );

  const excavators = useMemo(() => {
    return fleets.filter((fleet) => excavatorFilter(fleet));
  }, [fleets, excavatorFilter]);

  const removeTruckFromAssigned = (removedTruckAllocation, diggerId) => {
    removeTruckAllocation(removedTruckAllocation.truckId);
    removeEventmeta(removedTruckAllocation.truckId);
  };

  const reAssignTruckToFleet = (truck, from, to) => {
    updateTruckAllocation(truck.truckId, { ...truck, excavatorId: to });

    const isEventMeta = findEventmetaByTruckId(truck.truckId);
    if (!!isEventMeta) {
      updateEventmeta(truck.truckId, { ...isEventMeta, vehicleId: to });
    }
  };

  const addDumpLocation = (newDumpLocation: any, truckId: string) => {
    const selectedTruckAllocation = findTruckAllocationByTruckId(truckId);
    if (!!selectedTruckAllocation) {
      updateTruckAllocation(truckId, {
        ...selectedTruckAllocation,
        destinationId: newDumpLocation.id,
      });
    }

    const selectedEventmeta = findEventmetaByTruckId(truckId);
    if (!!selectedEventmeta) {
      updateEventmeta(truckId, {
        ...selectedEventmeta,
        destinationId: newDumpLocation.id,
      });
    }
  };

  const addHaulRoute = (newHaulRoute: HaulRoute) => {
    const existItem = haulRoutes.find(
      (item) =>
        item.assignId === newHaulRoute.assignId &&
        item.diggerId === newHaulRoute.diggerId
    );
    if (existItem) {
      setHaulRoutes((prevBenches) =>
        prevBenches.map((item) =>
          item.assignId === newHaulRoute.assignId &&
          item.diggerId === newHaulRoute.diggerId
            ? newHaulRoute
            : item
        )
      );
    } else {
      setHaulRoutes((prevLocations) => [...prevLocations, newHaulRoute]);
    }
  };

  const handleChangeDiggersForShow = useCallback(
    (key: string) => {
      if (key === "All") {
        setDiggersForShow(excavators);
      } else {
        const filteredDiggers = excavators.filter(
          (excavator: any) => excavator.name == key
        );
        setDiggersForShow(filteredDiggers);
      }
    },
    [mergedPlans]
  );

  useEffect(() => {
    handleChangeDiggersForShow(selectedTab);
  }, [handleChangeDiggersForShow]);

  const tabItems: TabsProps["items"] = useMemo(
    () => [
      {
        key: "All",
        label: "All",
      },
      ...excavators.map((item: any) => ({
        key: item?.name,
        label: item?.name,
      })),
    ],
    [excavators]
  );

  const onTabChange = (key: string) => {
    setSelectedTab(key);
    handleChangeDiggersForShow(key);
  };

  const changePlanState = (sourceId, excavatorId) => {
    changePlan(sourceId, excavatorId);
  };

  const addBenches = (newLocation, oldLocation, data) => {
    const result = {
      ...data,
      source: newLocation,
      sourceId: newLocation.id,
    };
    if (oldLocation !== "") {
      updatePlan(oldLocation.source.id, result);
    } else {
      addNewPlan(result);
    }
  };

  const getLocations = useCallback(
    (category?: string) => {
      const assignedSourceIds = mergedPlans?.map((item) => item.sourceId) || [];
      const wasteMaterialIds = materials
        ?.filter((item) => !category || item.category === category)
        .map((item) => item.id);

      return (
        benches
          ?.filter(
            (bench) =>
              bench.status === "ACTIVE" &&
              bench.category === "DESTINATION" &&
              !assignedSourceIds.includes(bench.id) &&
              wasteMaterialIds?.includes(bench.materialId)
          )
          ?.map((item, index) => ({
            ...item,
            locationImg: LocationImages[index % 3],
          })) || []
      );
    },
    [benches, mergedPlans, materials]
  );

  const normalizedWasteLocations = useMemo(() => {
    return getLocations("WASTE");
  }, [getLocations]);

  const normalizedOreLocations = useMemo(() => {
    return getLocations("ORE");
  }, [getLocations]);

  const normalizedFleets = useMemo(() => {
    const truckIds = mergedTruckAllocations.map((item) => item.truckId);
    const result = fleets.filter((item) => !truckIds.includes(item.id));

    return result;
  }, [mergedTruckAllocations]);

  const normalizedRosters = useMemo(() => {
    const truckIds = mergedTruckAllocations.map((item) => item.truckId);
    const result = shiftRosters.filter(
      (item) => !truckIds.includes(item?.vehicle.id)
    );

    return result;
  }, [mergedTruckAllocations]);

  const updateTargetMaterials = (oldMaterial: any, updatedMaterial: any) => {
    if (oldMaterial) {
      updateEventmeta(oldMaterial.truckId, updatedMaterial);
    } else {
      addNewEventmeta(updatedMaterial);
    }
  };

  const handlePublishOreSpotter = async () => {
    setIsLoading(true);

    try {
      await Promise.all([
        handleSubmitTruckAllocation(),
        handleSubmitEventmeta(),
        handlepublishPlan(),
      ]);
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <React.Fragment>
      <DndProvider backend={HTML5Backend}>
        <div className="page-content">
          <Container fluid>
            <div className="ore-trakcer-content dispatch-live-content">
              <div className="dispatch-live-left">
                <Breadcrumb breadcrumbItem="Ore Spotter" title="Operations" />
                <Row className="schedule-filter">
                  <Col md="9" className="d-flex">
                    <Space>
                      <Tabs
                        defaultActiveKey="1"
                        items={tabItems}
                        onChange={onTabChange}
                      ></Tabs>
                    </Space>
                  </Col>
                  <Col md="3" className="d-flex flex-row-reverse">
                    <Button
                      style={{
                        backgroundColor: "blue",
                        color: "white",
                        fontSize: "16px",
                        height: "48px",
                        marginRight: "8px",
                      }}
                      onClick={handlePublishOreSpotter}
                    >
                      {isLoading ? <Spinner size="sm"></Spinner> : <></>}
                      {"  "}Publish to Production
                    </Button>
                  </Col>
                </Row>
                <div className="dispatch-digger-container">
                  {diggersForShow.map((vehicle, index) => (
                    <MainCard
                      targetMaterials={mergedEventmetas}
                      updateTargetMaterials={updateTargetMaterials}
                      key={index}
                      dispatchs={mergedPlans}
                      vehicle={vehicle}
                      shiftRoster={shiftRosters}
                      diggerHeader={""}
                      assignReadyTrucks={assignReadyTrucks}
                      removeTruckFromAssigned={removeTruckFromAssigned}
                      reAssignTruckToFleet={reAssignTruckToFleet}
                      dumpLocations={[
                        ...normalizedWasteLocations,
                        ...normalizedOreLocations,
                      ]}
                      haulRoutes={haulRoutes}
                      addDumpLocation={addDumpLocation}
                      addHaulRoute={addHaulRoute}
                      assignedBenches={assignedBenches}
                      addBenches={addBenches}
                      assignedTrucks={mergedTruckAllocations}
                      locations={getLocations()}
                      changePlanState={changePlanState}
                      excavators={excavators}
                    />
                  ))}
                </div>
              </div>
              <div className="dispatch-live-right">
                <RightBoard
                  benches={benches}
                  dispatchs={mergedPlans}
                  fleets={normalizedFleets}
                  materials={materials}
                  shiftRosters={normalizedRosters}
                  vehicleRoutes={vehicleRoutes}
                  wasteLocations={normalizedWasteLocations}
                  oreLocations={normalizedOreLocations}
                />
              </div>
            </div>
          </Container>
        </div>
      </DndProvider>
    </React.Fragment>
  );
};
export default OreSpotter;
