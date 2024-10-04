import React, { useCallback, useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { Tabs, TabsProps } from "antd";
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
  const [displayType, setDisplayType] = useState("TABLE");

  const dispatch: any = useDispatch();

  const { vehicleRoutes } = useSelector(VehicleRouteSelector);

  const [replayRoads, setReplayRoad] = useState<any>([])

  const [geojsonData, setGeojsonData] = useState<any>(null)
  const [imageData, setImageData] = useState<any>(null)
  useEffect(() => {
    const _roads = vehicleRoutes.filter(_route => _route.category !== 'STOP_SIGNS' && _route.status == 'ACTIVE')
    const _replayRoads: any = []
    _.map(_roads, road => {
      const temp = {
        label: road.name,
        value: road.id
      }
      _replayRoads.push(temp)
    })

    setReplayRoad(_replayRoads)
  }, [vehicleRoutes])
  const [currentRoad, setCurrentRoad] = useState<DropdownType>({
    label: "Choose Replay Road",
  });
  const tabItems: TabsProps["items"] = [
    {
      key: "table",
      label: "Table View",
    },
    {
      key: "map",
      label: "Map View",
    },
    {
      key: "visual",
      label: "Visual Analytics",
    },
  ];
  const onTabChange = (key: string) => {
    if (key === "table") {
      setDisplayType("TABLE");
    } else if (key === "map") {
      setDisplayType("MAP");
    } else {
      setDisplayType("VISUAL");
    }
  };

  useEffect(() => {
    fetchZipFile()
  }, [])

  const fetchZipFile = async () => {
    const zipBuffer = await fetch('./240817_Pits_3D_WGS84.zip').then(response => response.arrayBuffer())
    JSZip.loadAsync(zipBuffer).then(data => {
        return data.file('240817_Pits_3D_WGS84.geojson')?.async("string");
    }).then((text) => {
        var _geojsonData = JSON.parse(text as string)
        setGeojsonData(_geojsonData)
        processZipFile(_geojsonData)
    })
  }

  let animationFrameId: number;
  let map: any;
  const processZipFile = async (geojsonData) => {
    // Fetch the ZIP file and get its ArrayBuffer
    const zipBuffer = await fetch('./images.zip').then(response => response.arrayBuffer());
    
    // Initialize an object to hold image data
    const _imageData = {};
    
    // Load the ZIP file using JSZip
    const zip = await JSZip.loadAsync(zipBuffer);

    // Create an array to hold promises
    const promises: any = [];

    // Iterate through each file in the ZIP
    zip.forEach((relativePath, file) => {
        // Check if the file is a WebP image
        if (file.name.endsWith('.webp')) {
            // Create a promise for each image processing
            const promise = file.async('arraybuffer').then(data => {
                // Extract the filename without extension
                const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
                // Store the image data in the object
                _imageData[fileNameWithoutExtension] = data;
            });
            promises.push(promise);
        }
    });

    // Wait for all promises to resolve
    await Promise.all(promises);
    setImageData(_imageData)
  }

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
                items={tabItems}
                onChange={onTabChange}
              />

              
              <div className="replay-road-dropdown" style={{position: 'absolute', top: '0px', right: '12px', display: displayType === "MAP" ? 'block' : 'none'}}>
                <Dropdown
                  label="Choose Replay"
                  items={replayRoads}
                  value={currentRoad}
                  onChange={setCurrentRoad}
                  />
              </div>
            </Col>
          </Row>

          {displayType === "TABLE" ? (
            <HaulRoadOptimisationTableView />
          ) : displayType === "MAP" ? (
            <HaulRoadOptimisationMapView geojsonData={geojsonData} imageData={imageData} currentRoad={currentRoad} replayRoads={vehicleRoutes.filter(_route => _route.category !== 'STOP_SIGNS' && _route.status == 'ACTIVE')} />
          ) : (
            <HaulRoadOptimisationVisualView />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default HaulRoadOptimization;
