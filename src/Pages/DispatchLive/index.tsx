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
  addDispatchs,
  getAllBenches,
  getAllFleet,
  getAllMaterials,
  getAllVehicleRoutes,
  getDispatchs,
  getShiftRosters,
  getTargetsByRoster,
  addTruckAllocations,
  getTruckAllocations,
  removeTruckAllocation,
} from "slices/thunk";
import { format } from "date-fns";
import _ from "lodash";
import { dumpCentral, dumpNorth, dumpSouth } from "assets/images/locations";

const LocationImages = [dumpNorth, dumpCentral, dumpSouth];

const DispatchLive: React.FC = () => {
  document.title = "Dispatch Live | FMS Live";
  const dispatch: any = useDispatch();

  const {
    fleets,
    users,
    benches,
    targets,
    dispatchs,
    vehicleRoutes,
    materials,
    shiftRosters,
    truckAllocations,
  } = useSelector(
    createSelector(
      (state: any) => state,
      (state) => {
        return {
          shiftRosters: state.ShiftRosters.data,
          fleets: state.Fleet.data,
          users: state.Users.data,
          benches: state.Benches.data,
          targets: state.Targets.data,
          dispatchs: state.Dispatch.data,
          vehicleRoutes: state.VehicleRoutes.data,
          materials: state.Materials.data,
          truckAllocations: state.TruckAllocation.data,
        };
      }
    )
  );

  const [shift, setShift] = useState<any>(null);
  const [startDate, setStartDate] = useState<any>(null);

  const [selectedTab, setSelectedTab] = useState<string>("All");
  const [diggersForShow, setDiggersForShow] = useState<any[]>([]);

  const [assignedTrucks, setAssignedTrucks] = useState<any[]>(
    truckAllocations || []
  );
  const [haulRoutes, setHaulRoutes] = useState<HaulRoute[]>([]);
  const [assignedBenches, setAssignedBenches] = useState<any[]>([]);
  const [savedDispatchs, setSavedDispatchs] = useState<any[]>(dispatchs);
  const [deletedIds, setDeletedIds] = useState<any[]>([]);
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

  useEffect(() => {
    setAssignedTrucks(truckAllocations);
  }, [truckAllocations]);

  useEffect(() => {
    setSavedDispatchs(dispatchs);
  }, [dispatchs]);

  const assignReadyTrucks = (oldTruck, newTruck, diggerId) => {
    const newAssignTruck = {
      excavatorId: diggerId,
      roster: newTruck?.roster,
      truckId: newTruck?.vehicleId,
      truck: newTruck?.vehicle,
    };
    if (!!oldTruck) {
      const result = assignedTrucks.map((item) => {
        if (item.truckId === oldTruck.truckId) {
          return { ...newAssignTruck, updated: true };
        }
        return item;
      });

      setAssignedTrucks(result);
    } else {
      setAssignedTrucks([
        ...assignedTrucks,
        { ...newAssignTruck, updated: true },
      ]);
    }
  };

  const removeTruckFromAssigned = (removedTruck, diggerId) => {
    const result = assignedTrucks.filter(
      (item) => item.truckId !== removedTruck.truckId
    );
    setAssignedTrucks(result);
    if (!!removedTruck?.id) {
      setDeletedIds([...deletedIds, removedTruck.id]);
    }
  };

  const reAssignTruckToFleet = (truck, from, to) => {
    if (!!truck.id) {
      setDeletedIds([...deletedIds, truck.id]);
      const result = assignedTrucks.map((item) => {
        if (item?.truckId === truck?.truckId) {
          return _.omit({ ...truck, excavatorId: to, updated: true }, "id");
        }
        return item;
      });
      setAssignedTrucks(result);
    } else {
      const result = assignedTrucks.map((item) => {
        if (item?.truckId === truck?.truckId) {
          return { ...item, excavatorId: to, updated: true };
        }
        return item;
      });

      setAssignedTrucks(result);
    }
  };

  const addDumpLocation = (newDumpLocation: any, truckId: string) => {
    const updateAssignedTrucks = assignedTrucks.map((item) => {
      if (item.truckId === truckId) {
        return { ...item, destinationId: newDumpLocation.id, updated: true };
      }
      return item;
    });

    setAssignedTrucks(updateAssignedTrucks);
  };

  const addHaulRoute = (newHaulRoute: HaulRoute) => {
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

  const addBenches = (newBench: any, diggerId: string) => {
    const existItem = assignedBenches.find(
      (item) => item.vehicleId === diggerId
    );
    if (!existItem) {
      setAssignedBenches((prevBenches) => [
        ...prevBenches,
        {
          vehicleId: diggerId,
          benches: [newBench],
        },
      ]);
    } else {
      const remainingItems = assignedBenches.filter(
        (item) => item.vehicleId !== diggerId
      );
      setAssignedBenches((prevBenches) => [
        ...remainingItems,
        {
          vehicleId: diggerId,
          benches: [...existItem.benches, newBench],
        },
      ]);
    }
  };

  const normalizedDispatchs = useMemo(() => {
    const updatedDispatchIds = savedDispatchs.map((item) => item.excavatorId);

    const data = [
      ...savedDispatchs.filter(
        (item) => !updatedDispatchIds.includes(item.excavatorId)
      ),
      ...savedDispatchs,
    ];
    data.sort((a, b) => a?.excavator?.name.localeCompare(b?.excavator?.name));

    const result = Object.values(
      data.reduce((item, { excavator, source, excavatorId, status }) => {
        if (!item[excavatorId]) {
          item[excavatorId] = {
            excavator,
            excavatorId,
            sources: [{ source, status }],
          };
        } else {
          item[excavatorId] = {
            ...item[excavatorId],
            sources: [...item[excavatorId].sources, { source, status }],
          };
        }
        return { ...item };
      }, {})
    );

    return result;
  }, [savedDispatchs]);

  const handleChangeDiggersForShow = useCallback(
    (key: string) => {
      if (key === "All") {
        setDiggersForShow(normalizedDispatchs);
      } else {
        const filteredDiggers = normalizedDispatchs.filter(
          (digger: any) => digger.excavator.name == key
        );
        setDiggersForShow(filteredDiggers);
      }
    },
    [normalizedDispatchs]
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
      ...normalizedDispatchs.map((item: any) => ({
        key: item?.excavator?.name,
        label: item?.excavator?.name,
      })),
    ],
    [normalizedDispatchs]
  );

  const onTabChange = (key: string) => {
    setSelectedTab(key);
    handleChangeDiggersForShow(key);
  };

  const changePlanState = (locationId, vehicleId) => {
    const locations = savedDispatchs.map((item: any) => {
      if (item.excavatorId !== vehicleId) return item;
      if (item.source.id === locationId) {
        return { ...item, status: "INPROGRESS", updated: true };
      }
      if (item.status === "INPROGRESS")
        return { ...item, status: "PLANNED", updated: true };
      return item;
    });
    setSavedDispatchs(locations);
  };

  const addLocation = (newLocation, oldLocation, data) => {
    if (oldLocation !== "") {
      const result = savedDispatchs.map((item) => {
        if (item.sourceId === oldLocation.source.id) {
          return {
            ...item,
            source: newLocation,
            sourceId: newLocation.id,
            updated: true,
          };
        }
        return item;
      });
      setSavedDispatchs(result);
    } else {
      const result = {
        ...data,
        source: newLocation,
        sourceId: newLocation.id,
        updated: true,
      };
      setSavedDispatchs([...savedDispatchs, result]);
    }
  };

  const getLocations = useCallback(
    (category?: string) => {
      const assignedSourceIds =
        savedDispatchs?.map((item) => item.sourceId) || [];
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
    [benches, savedDispatchs, materials]
  );

  const normalizedWasteLocations = useMemo(() => {
    return getLocations("WASTE");
  }, [getLocations]);

  const normalizedOreLocations = useMemo(() => {
    return getLocations("ORE");
  }, [getLocations]);

  const normalizedFleets = useMemo(() => {
    const truckIds = assignedTrucks.map((item) => item.truckId);
    const result = fleets.filter((item) => !truckIds.includes(item.id));

    return result;
  }, [assignedTrucks]);

  const normalizedRosters = useMemo(() => {
    const truckIds = assignedTrucks.map((item) => item.truckId);
    const result = shiftRosters.filter(
      (item) => !truckIds.includes(item?.vehicle.id)
    );

    return result;
  }, [assignedTrucks]);

  const getYesterdayDate = (): string => {
    const yesterday = new Date(Date.now() - 864e5); // Subtract 1 day in milliseconds
    return `${yesterday.getDate().toString().padStart(2, "0")} ${yesterday
      .toLocaleString("en-US", { month: "short" })
      .toUpperCase()} ${yesterday.getFullYear()}`;
  };

  const handlePublishDispatch = async () => {
    setIsLoading(true);
    const dispatchresults = savedDispatchs.filter((item) => item.updated);
    if (!!dispatchresults.length) {
      await dispatch(
        addDispatchs(
          dispatchresults.map((item) => ({
            id: item?.id || undefined,
            endTime: item?.endTime || undefined,
            roster: item?.roster || undefined,
            sourceId: item?.sourceId || undefined,
            startTime: item?.startTime || undefined,
            excavatorId: item?.excavatorId,
            status: item?.status || "PLANNED",
          }))
        )
      );
    }

    if (!!deletedIds.length) {
      await dispatch(removeTruckAllocation(deletedIds.map((item) => item)));
      setDeletedIds([]);
    }

    const truckResult = assignedTrucks.filter((item) => item.updated);
    if (!!truckResult.length) {
      await dispatch(
        addTruckAllocations(
          truckResult.map((item) => ({
            id: item?.id || undefined,
            roster: item?.roster || undefined,
            excavatorId: item?.excavatorId || undefined,
            truckId: item?.truckId || undefined,
            destinationId: item?.destinationId || undefined,
          }))
        )
      );
    }
    setIsLoading(false);
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
                      - {shift === "DS" ? "DAY SHIFT" : "NIGHT SHIFT"}
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
                {diggersForShow.map((dispatch, index) => (
                  <MainCard
                    key={index}
                    dispatchs={normalizedDispatchs}
                    dispatch={dispatch}
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
                    assignedTrucks={assignedTrucks}
                    locations={getLocations()}
                    changePlanState={changePlanState}
                    addLocation={addLocation}
                  />
                ))}
              </div>
              <div className="dispatch-live-right">
                <RightBoard
                  benches={benches}
                  dispatchs={normalizedDispatchs}
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
