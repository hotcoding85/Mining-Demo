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
  removeTruckAllocations,
  getEventMetas,
  addEventMetas,
  removeEventMetas,
} from "slices/thunk";
import { format } from "date-fns";
import _ from "lodash";
import { dumpCentral, dumpNorth, dumpSouth } from "assets/images/locations";

const LocationImages = [dumpNorth, dumpCentral, dumpSouth];

const OreSpotter: React.FC = () => {
  document.title = "Ore tracker | FMS Live";
  const dispatch = useDispatch<any>();

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
    eventMetas,
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
          eventMetas: state.EventMeta.data,
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
  const [deletedTruckIds, setDeletedTruckIds] = useState<any[]>([]);
  const [deletedMaterialIds, setDeletedMaterialIds] = useState<any[]>([]);
  const [targetMaterials, setTargetMaterials] = useState<Material[]>(
    eventMetas || []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoading) setTargetMaterials(eventMetas);
  }, [eventMetas, isLoading]);

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

  useEffect(() => {
    if (!isLoading) setAssignedTrucks(truckAllocations);
  }, [truckAllocations, isLoading]);

  useEffect(() => {
    if (!isLoading) setSavedDispatchs(dispatchs);
  }, [dispatchs, isLoading]);

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

  const excavatorFilter = useCallback(
    (vehicle) =>
      vehicle?.category === "EXCAVATOR" &&
      (vehicle?.state === "ACTIVE" || vehicle?.state === "STANDBY"),
    []
  );

  const excavators = useMemo(() => {
    return fleets.filter((fleet) => excavatorFilter(fleet));
  }, [fleets, excavatorFilter]);

  const removeTruckFromAssigned = (removedTruck: any, diggerId: any) => {
    const result = assignedTrucks.filter(
      (item) => item.truckId !== removedTruck.truckId
    );
    setAssignedTrucks(result);
    if (!!removedTruck?.id) {
      setDeletedTruckIds([...deletedTruckIds, removedTruck.id]);
    }
    removeTargetMaterial(removedTruck);
  };

  const reAssignTruckToFleet = (truck, from, to) => {
    if (!!truck.id) {
      setDeletedTruckIds([...deletedTruckIds, truck.id]);
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

    const foundMaterial = targetMaterials.find(
      (material: any) => material.truckId === truck.truckId
    );

    if (!!foundMaterial) {
      removeTargetMaterial(truck);
      updateTargetMaterials(null, {
        ...foundMaterial,
        vehicleId: to,
      });
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
      data.reduce((item, { excavator, source, excavatorId, status, id }) => {
        if (!item[excavatorId]) {
          item[excavatorId] = {
            excavator,
            excavatorId,
            sources: [{ source, status, id }],
          };
        } else {
          item[excavatorId] = {
            ...item[excavatorId],
            sources: [...item[excavatorId].sources, { source, status, id }],
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
        setDiggersForShow(mergedDispatchs);
      } else {
        const filteredDiggers = mergedDispatchs.filter(
          (digger: any) => digger.name == key
        );
        setDiggersForShow(filteredDiggers);
      }
    },
    [normalizedDispatchs]
  );

  useEffect(() => {
    handleChangeDiggersForShow(selectedTab);
  }, [handleChangeDiggersForShow]);

  const mergedDispatchs = useMemo(() => {
    return excavators.map((excavator) => {
      const item: any = normalizedDispatchs.find(
        (dispatch: any) => dispatch.excavatorId === excavator.id
      );
      return {
        ...excavator,
        excavator: excavator || {},
        sources: item?.sources || [],
        excavatorId: excavator.id || "",
      };
    });
  }, [savedDispatchs]);

  const tabItems: TabsProps["items"] = useMemo(
    () => [
      {
        key: "All",
        label: "All",
      },
      ...mergedDispatchs.map((item: any) => ({
        key: item?.name,
        label: item?.name,
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

  const updateTargetMaterials = (oldMaterial: any, updatedMaterial: any) => {
    if (oldMaterial) {
      if (oldMaterial?.id && !deletedMaterialIds.includes(oldMaterial?.id)) {
        setDeletedMaterialIds([...deletedMaterialIds, oldMaterial?.id]);
      }

      setTargetMaterials((prev) => [
        ...prev.filter(
          (material: any) => material.truckId !== oldMaterial.truckId
        ),
        { ...updatedMaterial, updated: true },
      ]);
    } else {
      setTargetMaterials((prev) => [
        ...prev,
        { ...updatedMaterial, updated: true },
      ]);
    }
  };

  const removeTargetMaterial = (removedTruck: any) => {
    const findMaterialsByTruckId = targetMaterials.find(
      (material: any) => material.truckId === removedTruck.truckId
    );
    if (!!findMaterialsByTruckId) {
      if (
        !!findMaterialsByTruckId?.id &&
        !deletedMaterialIds.includes(findMaterialsByTruckId?.id)
      ) {
        setDeletedMaterialIds([
          ...deletedMaterialIds,
          findMaterialsByTruckId.id,
        ]);
      }

      setTargetMaterials((prev) =>
        prev.filter(
          (material: any) => material.truckId !== removedTruck.truckId
        )
      );
    }
  };

  const handlePublishOreSpotter = async () => {
    setIsLoading(true);
    const dispatchResult = savedDispatchs.filter((item) => item.updated);
    if (!!dispatchResult.length) {
      await dispatch(
        addDispatchs(
          dispatchResult.map((item) => ({
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

    if (!!deletedTruckIds.length) {
      await dispatch(removeTruckAllocations(deletedTruckIds));
      setDeletedTruckIds([]);
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

    if (!!deletedMaterialIds.length) {
      await dispatch(removeEventMetas(deletedMaterialIds));
      setDeletedMaterialIds([]);
    }

    const materialResult = targetMaterials.filter((item: any) => item.updated);
    if (!!materialResult.length) {
      await dispatch(
        addEventMetas(
          materialResult.map((item: any) => ({
            id: item?.id || undefined,
            planId: item?.planId || undefined,
            vehicleId: item?.vehicleId || undefined,
            truckId: item?.truckId || undefined,
            destinationId: item?.destinationId || undefined,
            sourceId: item?.sourceId || undefined,
            materialId: item?.materialId || undefined,
            roster: item?.roster || undefined,
          }))
        )
      );
    }
    setIsLoading(false);
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
                  {diggersForShow.map((dispatch, index) => (
                    <MainCard
                      targetMaterials={targetMaterials}
                      updateTargetMaterials={updateTargetMaterials}
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
          </Container>
        </div>
      </DndProvider>
    </React.Fragment>
  );
};
export default OreSpotter;
