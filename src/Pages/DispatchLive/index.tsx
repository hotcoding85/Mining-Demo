import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row } from "reactstrap";
import MainCard from "./MainCard";
import RightBoard from "./RightBoard";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  sampleReadyTrucks,
  dumpLocationsForAssign,
  sampleAssignedBenches,
  haulRoutesForAssign,
  diggers,
  sampleTargetMaterials,
} from "./data/sampleData";
import { Space, Tabs } from "antd";
import type { TabsProps } from "antd";
import "./styles/style.scss";
import {
  Truck,
  DumpLocation,
  ActiveBenchData,
  DiggerData,
  Material,
  HaulRoute,
} from "./interfaces/type";
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
} from "slices/thunk";
import { getMaterials } from "Helpers/api_materials_helper";
import { compareAsc, format } from "date-fns";
import { debounce } from "lodash";
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
        };
      }
    )
  );

  const [shift, setShift] = useState<any>(null);
  const [startDate, setStartDate] = useState<any>(null);

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

  const [readyTrucks, setreadyTrucks] = useState<Truck[]>(sampleReadyTrucks);
  const [assignedTrucks, setAssignedTrucks] = useState<Truck[]>([]);
  const [dumpLocations, setDumpLocations] = useState<DumpLocation[]>([]);
  const [haulRoutes, setHaulRoutes] = useState<HaulRoute[]>([]);
  const [assignedBenches, setAssignedBenches] = useState<any[]>([]);
  const [targetMaterials, setTargetMaterials] = useState<Material[]>(
    sampleTargetMaterials
  );
  const [diggersForShow, setdiggersForShow] = useState<DiggerData[]>(diggers);

  const [updatedDispatchs, setUpdatedDispatchs] = useState<any[]>([]);

  const onTabChange = (key: string) => {
    if (key === "All") {
      setdiggersForShow(diggers);
    } else {
      const filteredDiggers = diggers.filter(
        (digger) => digger.diggerId == key
      );
      setdiggersForShow(filteredDiggers);
    }
  };

  const getExistingDispatch = (diggerId) =>
    updatedDispatchs?.find((item) => item.vehicleId === diggerId) ||
    dispatchs?.find((item) => item.vehicleId === diggerId);

  const assignReadyTrucks = (oldTruck, newTruck, diggerId) => {
    const existingDispatch = getExistingDispatch(diggerId);

    if (!existingDispatch) return;

    const updatedDispatch = {
      ...existingDispatch,
      supporting: [
        ...existingDispatch.supporting.filter(
          (id) => !oldTruck?.id || id !== oldTruck?.id
        ),
        newTruck.vehicleId,
      ],
      supportTrucks: [
        ...existingDispatch.supportTrucks.filter(
          (truck) => !oldTruck?.id || truck?.id !== oldTruck?.id
        ),
        newTruck.vehicle,
      ],
    };

    setUpdatedDispatchs([
      ...updatedDispatchs.filter((item) => item.vehicleId !== diggerId),
      updatedDispatch,
    ]);
  };

  const removeTruckFromAssigned = (removedTruck, diggerId) => {
    const existingDispatch = getExistingDispatch(diggerId);

    if (!existingDispatch) return;

    const updatedDispatch = {
      ...existingDispatch,
      supporting: [
        ...existingDispatch.supporting.filter((id) => id !== removedTruck?.id),
      ],
      supportTrucks: [
        ...existingDispatch.supportTrucks.filter(
          (truck) => truck?.id !== removedTruck?.id
        ),
      ],
    };

    setUpdatedDispatchs([
      ...updatedDispatchs.filter((item) => item.vehicleId !== diggerId),
      updatedDispatch,
    ]);
  };

  const reAssignTruckToFleet = (truck, from, to) => {
    // Remove the truck from the 'from' dispatch
    const removingDispatch = {
      ...getExistingDispatch(from),
      supporting: getExistingDispatch(from).supporting.filter(
        (id) => id !== truck?.id
      ),
      supportTrucks: getExistingDispatch(from).supportTrucks.filter(
        (item) => item?.id !== truck?.id
      ),
    };

    // Add the truck to the 'to' dispatch
    const updatingDispatch = {
      ...getExistingDispatch(to),
      supporting: [...getExistingDispatch(to).supporting, truck.id],
      supportTrucks: [...getExistingDispatch(to).supportTrucks, truck],
    };

    // Update the list of dispatches
    setUpdatedDispatchs((prev) => [
      ...prev.filter(
        (item) => item.vehicleId !== from && item.vehicleId !== to
      ),
      removingDispatch,
      updatingDispatch,
    ]);
  };

  const addDumpLocation = (newDumpLocation: any, diggerId: string) => {
    const existingDispatch = getExistingDispatch(diggerId);

    if (!existingDispatch) return;

    const updatingDispatch = {
      ...existingDispatch,
      destination: newDumpLocation,
      destinationId: newDumpLocation.id,
    };

    setUpdatedDispatchs((prev) => [
      ...prev.filter((item) => item.vehicleId !== diggerId),
      updatingDispatch,
    ]);
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

  const tabItems: TabsProps["items"] = useMemo(
    () => [
      {
        key: "All",
        label: "All",
      },
      ...dispatchs.map((item) => ({
        key: item?.vehicle?.name,
        label: item?.vehicle?.name,
      })),
    ],
    [dispatchs]
  );

  const excuvatorFilter = useCallback(
    (vehicle) =>
      vehicle?.category === "EXCAVATOR" &&
      (vehicle?.state === "ACTIVE" || vehicle?.state === "STANDBY"),
    []
  );

  const excuvatorRoster = useMemo(() => {
    return shiftRosters.filter((roster) => excuvatorFilter(roster.vehicle));
  }, [shiftRosters, excuvatorFilter]);

  const normalizedDispatchs = useMemo(() => {
    const updatedDispatchIds = updatedDispatchs.map((item) => item.vehicleId);

    const data = [
      ...dispatchs.filter(
        (item) => !updatedDispatchIds.includes(item.vehicleId)
      ),
      ...updatedDispatchs,
    ];

    data.sort((a, b) => a.vehicle.name.localeCompare(b.vehicle.name));

    return data;
  }, [dispatchs, updatedDispatchs]);

  const handlePublishDispatch = async () => {
    if (!!updatedDispatchs.length) {
      await dispatch(
        addDispatchs(
          updatedDispatchs.map((item) => ({
            id: item?.id || undefined,
            destinationId: item?.destinationId || undefined,
            endTime: item?.endTime || undefined,
            materialId: item?.materialId || undefined,
            planId: item?.planId || undefined,
            roster: item?.roster || undefined,
            sourceId: item?.sourceId || undefined,
            startTime: item?.startTime || undefined,
            supporting: item?.supporting || undefined,
            tonnes: item?.tonnes || undefined,
            vehicleId: item?.vehicleId,
          }))
        )
      );
      setUpdatedDispatchs([]);
    }
  };

  const getLocations = useCallback(
    (category?) => {
      const assignedSourceIds = dispatchs?.map((item) => item.sourceId) || [];
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
    [benches, dispatchs, materials]
  );

  const normalizedWasteLocations = useMemo(() => {
    return getLocations("WASTE");
  }, [getLocations]);

  const normalizedOreLocations = useMemo(() => {
    return getLocations("ORE");
  }, [getLocations]);

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
                        Publish to Production
                      </Button>
                    </Space>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <h5>
                      {format(new Date(), "dd MMM yyyy")} -{" "}
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
                {normalizedDispatchs.map((dispatch, index) => (
                  <MainCard
                    key={dispatch.id}
                    dispatchs={dispatchs}
                    dispatch={dispatch}
                    shiftRoster={excuvatorRoster}
                    diggerHeader={dispatch.vehicle.name}
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
                  />
                ))}
              </div>
              <div className="dispatch-live-right">
                <RightBoard
                  benches={benches}
                  dispatchs={normalizedDispatchs}
                  fleets={fleets}
                  materials={materials}
                  shiftRosters={shiftRosters}
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
