import React, { useCallback, useEffect, useRef, useState } from "react";
import { Col, Container, Row, TabPane } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Tabs, TabsProps, } from "antd";
import HaulRoadOptimisationTableView from "./components/HaulRoadOptimisationTableView";
import HaulRoadOptimisationMapView from "./components/HaulRoadOptimisationMapView";
import HaulRoadOptimisationVisualView from "./components/HaulRoadOptimisationVisualView";
import "./styles/index.scss";
import { LineString, Point } from 'interfaces/GeoJson';
import { LayoutSelector, VehicleRouteSelector } from 'selectors';
import { useDispatch, useSelector } from "react-redux";
import { DropdownType, Dropdown } from "Components/Common/Dropdown";
import _ from "lodash";
import JSZip from "@turbowarp/jszip";

const HaulRoadOptimization = (props: any) => {
  document.title = "Haul Road Optimisation | FMS Live";

  const { vehicleRoutes } = useSelector(VehicleRouteSelector);

  const [replayRoads, setReplayRoad] = useState<any>([])

  const [geojsonData, setGeojsonData] = useState<any>(null)

  useEffect(() => {
    const _roads = vehicleRoutes.filter(_route => _route.category !== 'STOP_SIGNS' && _route.status == 'ACTIVE')
    const _replayRoads: any = []
    _.map(_roads, (road, index) => {
      const temp = {
        label: "Trip " + (index + 1),
        value: road.id
      }
      _replayRoads.push(temp)
    })

    setReplayRoad(_replayRoads)
  }, [vehicleRoutes])
  const [currentRoad, setCurrentRoad] = useState<DropdownType>({
    label: "Choose Replay Road",
  });
  const [activeTab, setActiveTab] = useState<string>('1');
  const onChangeTap = useCallback((key) => {
    setActiveTab(key)
  }, [activeTab])

  return (
    <React.Fragment>
      <div className="page-content col-lg-12" style={{paddingBottom: '10px'}}>
        <Container fluid className="haul-raod-optimisation">
          <Breadcrumb
            title="Mine Dynamics"
            breadcrumbItem="Haul Road Optimisation"
          />

          <Row>
            <Col lg="12">
              <Tabs
                className="haul-raod-optimisation-tabs"
                defaultActiveKey="1"
                // items={tabItems}
                activeKey={activeTab}
                onChange={(key) => onChangeTap(key)}
              >
                <TabPane tab="Table View" key="1">
                  <HaulRoadOptimisationTableView />
                </TabPane>

                <TabPane tab="Map View" key="2">
                  <HaulRoadOptimisationMapView
                    geojsonData={geojsonData}
                    currentRoad={currentRoad}
                    setCurrentRoad={setCurrentRoad}
                    vehicleRoutes={vehicleRoutes.filter(_route => _route.category !== 'STOP_SIGNS' && _route.status == 'ACTIVE')}
                    replayRoads={replayRoads}
                  />
                </TabPane>

                <TabPane tab="Visual Analytics" key="3">
                  <HaulRoadOptimisationVisualView />
                </TabPane>
              </Tabs>
              <div className="replay-road-dropdown" style={{position: 'absolute', top: '0px', right: '12px', display: activeTab == "2" ? 'block' : 'none'}}>
                <Dropdown
                  label="Choose Replay"
                  items={replayRoads}
                  value={currentRoad}
                  onChange={setCurrentRoad}
                  />
              </div>
            </Col>
          </Row>

        </Container>
      </div>
    </React.Fragment>
  );
};

export default HaulRoadOptimization;
