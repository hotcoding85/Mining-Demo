import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row, Spinner } from "reactstrap";
import MainCard from "./MainCard";
import RightBoard from "./RightBoard";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Space, Tabs } from "antd";
import type { TabsProps } from "antd";
import "./styles/style.scss";
import { HaulRoute } from "./interfaces/type";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { useDispatch } from "react-redux";
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
import _ from "lodash";
import { dumpCentral, dumpNorth, dumpSouth } from "assets/images/locations";
import { useMaterials } from "Hooks/useMaterials";
import { useEventmetas } from "Hooks/useEventmetas";
import { useTruckAllocations } from "Hooks/useTruckAllocations";
import { usePlans } from "Hooks/usePlans";

const LocationImages = [dumpNorth, dumpCentral, dumpSouth];

const DispatchLive: React.FC = () => {
  document.title = "Dispatch Live | FMS Live";
  const dispatch: any = useDispatch();

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
            vehicleRoutes: state.VehicleRoutes.data.filter(item => item.category === "CURRENT_HAUL_ROUTES"),
          };
        }
      )
    );

  const { mergedPlans, addNewPlan, updatePlan, changePlan, handlepublishPlan } =
    usePlans();

  const { findEventmetaByTruckId, updateEventmeta, handleSubmitEventmeta } =
    useEventmetas();

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

  const [haulRoutes, setHaulRoutes] = useState<HaulRoute[]>([{
    "id": 0,
    "assignId": 0,
    "locationName": "Haul Road to ROM",
    "locationImg": "/static/media/centralRampToDump.d256cc5ca334bd22c858.png",
    "name": "Haul Road to ROM",
    "diggerId": "9966fdb2-95ac-4dde-93f5-c78f488cedc3"
  },
  {
    "id": 1,
    "assignId": 1,
    "locationName": "Haul Road to Central Pit",
    "locationImg": "/static/media/centralRampToDump.d256cc5ca334bd22c858.png",
    "name": "Haul Road to Central Pit",
    "diggerId": "9966fdb2-95ac-4dde-93f5-c78f488cedc3"
  },
  {
    "id": 2,
    "assignId": 2,
    "locationName": "Haul Road to Central Pit",
    "locationImg": "/static/media/centralRampToDump.d256cc5ca334bd22c858.png",
    "name": "Haul Road to Central Pit",
    "diggerId": "9966fdb2-95ac-4dde-93f5-c78f488cedc3"
  }, {
    "id": 0,
    "assignId": 0,
    "locationName": "Haul Road to ROM",
    "locationImg": "/static/media/centralRampToDump.d256cc5ca334bd22c858.png",
    "name": "Haul Road to ROM",
    "diggerId": "ad9bb92e-ace6-43ea-84c3-eba9725b28a7"
  },
  {
    "id": 1,
    "assignId": 1,
    "locationName": "Haul Road to Central Pit",
    "locationImg": "/static/media/centralRampToDump.d256cc5ca334bd22c858.png",
    "name": "Haul Road to Central Pit",
    "diggerId": "ad9bb92e-ace6-43ea-84c3-eba9725b28a7"
  },
  {
    "id": 2,
    "assignId": 2,
    "locationName": "Haul Road to Central Pit",
    "locationImg": "/static/media/centralRampToDump.d256cc5ca334bd22c858.png",
    "name": "Haul Road to Central Pit",
    "diggerId": "ad9bb92e-ace6-43ea-84c3-eba9725b28a7"
  },
  {
    "id": 0,
    "assignId": 0,
    "locationName": "Haul Road to ROM",
    "locationImg": "/static/media/centralRampToDump.d256cc5ca334bd22c858.png",
    "name": "Haul Road to ROM",
    "diggerId": "413d454c-9037-4726-b67f-e5a53770bc02"
  },
  {
    "id": 1,
    "assignId": 1,
    "locationName": "Haul Road to Central Pit",
    "locationImg": "/static/media/centralRampToDump.d256cc5ca334bd22c858.png",
    "name": "Haul Road to Central Pit",
    "diggerId": "413d454c-9037-4726-b67f-e5a53770bc02"
  },
  {
    "id": 2,
    "assignId": 2,
    "locationName": "Haul Road to Central Pit",
    "locationImg": "/static/media/centralRampToDump.d256cc5ca334bd22c858.png",
    "name": "Haul Road to Central Pit",
    "diggerId": "413d454c-9037-4726-b67f-e5a53770bc02"
  }]);
  const [assignedBenches, setAssignedBenches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  console.log('state.VehicleRoutes.data', vehicleRoutes.filter(item => item.category === "CURRENT_HAUL_ROUTES"))
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

  const excavatorFilter = useCallback(
    (vehicle) =>
      vehicle?.category === "EXCAVATOR" &&
      (vehicle?.state === "ACTIVE" || vehicle?.state === "STANDBY"),
    []
  );

  const excavators = useMemo(() => {
    return fleets.filter((fleet) => excavatorFilter(fleet));
  }, [fleets, excavatorFilter]);

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

  const removeTruckFromAssigned = (removedTruckAllocation, diggerId) => {
    removeTruckAllocation(removedTruckAllocation.truckId);
  };

  const reAssignTruckToFleet = (truck, from, to) => {
    updateTruckAllocation(truck.truckId, { ...truck, excavatorId: to });
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
    console.log('newHaulRoute', newHaulRoute)
    const existItem = haulRoutes.find(
      (item) =>
        item.assignId === newHaulRoute.assignId &&
        item.diggerId == newHaulRoute.diggerId
    );
    if (existItem) {
      setHaulRoutes((prevBenches) =>
        prevBenches.map((item) =>
          item.assignId === newHaulRoute.assignId &&
            item.diggerId == newHaulRoute.diggerId
            ? newHaulRoute
            : item
        )
      );
    } else {
      setHaulRoutes((prevLocations) => [...prevLocations, newHaulRoute]);
    }
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

  const changePlanState = (sourceId, excavatorId) => {
    changePlan(sourceId, excavatorId);
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
    const truckIds = mergedTruckAllocations.map((item) => item?.truckId);
    const result = fleets.filter((item) => !truckIds.includes(item.id));

    return result;
  }, [mergedTruckAllocations]);

  const normalizedRosters = useMemo(() => {
    const truckIds = mergedTruckAllocations.map((item) => item?.truckId);
    const result = shiftRosters.filter(
      (item) => !truckIds.includes(item?.vehicle.id)
    );

    return result;
  }, [mergedTruckAllocations]);

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

  const getYesterdayDate = (): string => {
    const now = new Date();
    const hours = now.getHours();
    const dayOffset = hours >= 18 ? 0 : 864e5;
    const yesterday = new Date(Date.now() - dayOffset);
    return format(yesterday, "dd MMM yyyy");
  };

  const handlePublishDispatch = async () => {
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
      <div className="page-content">
        <Container fluid>
          <DndProvider backend={HTML5Backend}>
            <div className="dispatch-live-content">
              <div className="dispatch-live-left">
                {/* <Breadcrumb breadcrumbItem="Dispatch Live" title="Operations" /> */}
                <Row>
                  <Col md="12" className="d-flex flex-row-reverse">
                    <Space>
                      <Button
                        style={{
                          marginRight: "64px",
                          fontSize: "16px",
                          height: "48px",
                        }}
                      >
                        Export to SIC
                      </Button>
                      <Button
                        style={{
                          backgroundColor: "blue",
                          color: "white",
                          fontSize: "16px",
                          height: "48px",
                        }}
                        onClick={handlePublishDispatch}
                      >
                        {isLoading ? <Spinner size="sm"></Spinner> : <></>}
                        {"  "}Publish to Production
                      </Button>
                    </Space>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <h5>
                      {shift === "DS"
                        ? format(new Date(), "dd MMM yyyy")
                        : getYesterdayDate()}{" "}
                      {shift === "DS" ? "DAY SHIFT" : "NIGHT SHIFT"}
                    </h5>
                  </Col>
                </Row>
                <Row>
                  <Col md="12" className="d-flex">
                    <Space>
                      <Tabs
                        defaultActiveKey="1"
                        items={tabItems}
                        onChange={onTabChange}
                      ></Tabs>
                    </Space>
                  </Col>
                </Row>
                {diggersForShow.map((excavator, index) => (
                  <MainCard
                    key={index}
                    dispatchs={mergedPlans}
                    excavator={excavator}
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
                    assignedTrucks={mergedTruckAllocations}
                    locations={getLocations()}
                    changePlanState={changePlanState}
                    addBenches={addBenches}
                    excavators={excavators}
                  />
                ))}
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
          </DndProvider>
        </Container>
      </div>
    </React.Fragment>
  );
};
export default DispatchLive;
