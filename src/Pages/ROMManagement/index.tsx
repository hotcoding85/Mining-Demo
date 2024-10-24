import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// lodush
import _ from "lodash";
// components
import Breadcrumb from "Components/Common/Breadcrumb";
import { useInitPolygonMap } from "Hooks/useInitPolygonMap";
import FenceEditModal from "Components/Common/FenceEditModal";
// reacstrap
import { Button, Card, Col, Container, Row } from "reactstrap";
// ant design
import { Tooltip } from "antd";
// redux
import { useSelector, useDispatch } from "react-redux";
import {
  getAllBenches,
  getAllMaterials,
  getGeoFences,
  removeGeoFence,
} from "slices/thunk";
// import modals
import BoundingBoxModal from "Pages/AutoRouting/BoundingBoxModal";
import FenceSidebarItem from "./components/FenceSidebarItem";

// import styles
import "./styles.scss";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { BenchSelector, FenceSelector } from "selectors";
import { useMaterials } from "Hooks/useMaterials";

// default wasted's polygon and line color - 'green'
const defaultColor = "#00ff00";

const ROMManagement = () => {
  document.title = "ORM Management | FMS Live";

  // dispatch
  const dispatch: any = useDispatch();

  // ref values
  const mapContainer = useRef(null);
  const mapRef = useRef<any>(null);

  // state values
  const [drawing, setDrawing] = useState<boolean>(false);
  const [fence, setFence] = useState<any>(null);

  // modal state values
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isBoundboxModalOpen, setIsBoundboxModalOpen] =
    useState<boolean>(false);

  const handleOpenEditModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseEditModal = useCallback(() => {
    setIsModalOpen(false);
    setFence(null);
  }, [setIsModalOpen, setFence]);

  const handleOpenBoundboxModal = useCallback(
    () => setIsBoundboxModalOpen(true),
    [setIsBoundboxModalOpen]
  );
  const handleCloseBoundboxModal = useCallback(
    () => setIsBoundboxModalOpen(false),
    [setIsBoundboxModalOpen]
  );

  const { fences } = useSelector(FenceSelector);
  const { benches } = useSelector(BenchSelector);
  const { findMaterialsById } = useMaterials();

  const oreDumpFences = useMemo(() => {
    const data: any[] = Array.from(fences);
    data.sort((a: any, b: any) => b.updatedAt - a.updatedAt);
    return data.filter((fence: any) => fence.category === "ORE_DUMP");
  }, [fences]);

  const availalbeBenches = useMemo(() => {
    const locationIds = oreDumpFences.map((fence) => fence.locationId);
    return benches.filter(
      (location: any) =>
        !locationIds.includes(location.id) &&
        location.category === "DESTINATION" &&
        findMaterialsById(location?.materialId)?.category === "ORE"
    );
  }, [oreDumpFences, benches]);

  useEffect(() => {
    if (!mapRef) return;
    dispatch(getGeoFences());
    dispatch(getAllBenches(1, 100));
    dispatch(getAllMaterials(1, 100));
  }, [dispatch]);

  const {
    handleSaveFence,
    handleUpdateBoundboxValues,
    removePolygonSourceAndLayer,
    toggleDrawController,
  } = useInitPolygonMap({
    mapContainer,
    mapCenter: [120.44871814239025, -29.1576602184213],
    wasteDumpFences: oreDumpFences,
    category: "ORE_DUMP",
    fence,
    setFence,
    handleCloseBoundboxModal,
    handleCloseEditModal,
    handleOpenEditModal,
  });

  const handleFenceClick = (fence: any) => {
    setFence(fence);
    handleOpenEditModal();
  };

  const handleRemoveFence = async (fence: any) => {
    await dispatch(removeGeoFence(fence.id));
    removePolygonSourceAndLayer(fence.id);
  };

  const toggleDrawing = () => {
    toggleDrawController(!drawing);
    setDrawing(!drawing);
  };

  return (
    <React.Fragment>
      <div className="page-content wasted-dump-content">
        <Container fluid>
          <Breadcrumb title="Mine Controle" breadcrumbItem="ORM Management" />
          <Row>
            <Col
              lg="12"
              className="d-flex justify-content-between align-items-start"
            >
              <div
                ref={mapContainer}
                className="map-container"
                style={{ height: "calc(100vh - 230px)", width: "80%" }}
              >
                <div className={drawing ? "map-drawing" : ""}>
                  <div
                    className="mapboxgl-ctrl mapboxgl-ctrl-group my-custom-ctrl-group"
                    style={{ display: !drawing ? "none" : "block" }}
                  >
                    <Tooltip title="Save Ore Dump">
                      <button
                        className="mapboxgl-ctrl-zoom-in"
                        type="button"
                        onClick={handleOpenEditModal}
                      >
                        <i className="fas fa-save"></i>
                      </button>
                    </Tooltip>
                  </div>
                  <div className="mapboxgl-ctrl mapboxgl-ctrl-group my-bounding-box-group">
                    <Tooltip title="Set Bounding Box">
                      <button
                        className="mapboxgl-ctrl-zoom-in"
                        type="button"
                        onClick={handleOpenBoundboxModal}
                      >
                        <i className="fas fa-share-alt-square"></i>
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <Card
                style={{
                  height: "calc(100vh - 230px)",
                  width: "20%",
                  marginLeft: "15px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    fontSize: "20px",
                    alignItems: "center",
                  }}
                >
                  Ore Dump
                  <Button onClick={toggleDrawing}>
                    {drawing ? (
                      <>
                        <i className="fas fa-ellipsis-h"></i>
                      </>
                    ) : (
                      <i className="fas fa-plus"></i>
                    )}
                  </Button>
                </div>
                <div
                  style={{
                    height: "calc(100% - 100px)",
                    overflow: "auto",
                    marginTop: "16px",
                  }}
                >
                  {oreDumpFences &&
                    _.map(oreDumpFences, (fenceData: any) => (
                      <FenceSidebarItem
                        fence={fenceData}
                        onClick={handleFenceClick}
                        onRemove={handleRemoveFence}
                      />
                    ))}
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <FenceEditModal
        category="ORE"
        isOpen={isModalOpen}
        onClose={handleCloseEditModal}
        benches={[
          ...availalbeBenches,
          ...(benches.filter((bench) => bench.id === fence?.locationId) || []),
        ]}
        onSave={handleSaveFence}
        wasteData={{
          name: fence?.name,
          color: fence?.color || defaultColor,
          benchId: fence?.locationId,
        }}
      />
      <BoundingBoxModal
        isVisible={isBoundboxModalOpen}
        handleOk={handleUpdateBoundboxValues}
        handleCancel={handleCloseBoundboxModal}
      />
    </React.Fragment>
  );
};

export default ROMManagement;
