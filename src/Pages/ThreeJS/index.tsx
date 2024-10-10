import React, { useEffect, useRef, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { useDispatch } from 'react-redux';
import './index.css'
import mapboxgl from 'mapbox-gl';
import _ from 'lodash';
import { Checkbox, CheckboxProps } from 'antd';
import 'antd/dist/reset.css';
import { getAllVehicleRoutes, getGeoFences } from 'slices/thunk';
import { DropdownType } from 'Components/Common/Dropdown';
import { THREEJSMap } from 'Pages/3DMap';

export const ThreeJS = () => {
    const dispatch: any = useDispatch();

    const layerOptions = ['Active Benches', 'Current Haul Routes', 'Future Road Designs', 'Speed Restrictions', 'Pit Bottom', 'Pit Climb', 'Stop Signs',        'Restricted', 'Dump Locations'];
    const defaultLayers = ['Active Benches'];
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [checkedList, setCheckedList] = useState<string[]>(defaultLayers);

    const onChange = (list: string[]) => {
        setCheckedList(list);
    };

    const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
        setCheckedList(e.target.checked ? layerOptions : []);
    };

    document.title = "3D Pit View | FMS Live";

    const mapContainer = useRef<HTMLDivElement | null>(null);
    mapboxgl.accessToken = process.env.MAPBOX_API_KEY || 'pk.eyJ1IjoibXlreXRhcyIsImEiOiJjbTA1MGhtb3YwY3Y0Mm5uY3FzYWExdm93In0.cSDrE0Lq4_PitPdGnEV_6w';
    const [lng, setLng] = useState(120.44871814239025);
    const [lat, setLat] = useState(-29.1506602184213);
    const geojsonData = useRef<any>();

    // state for Map loading status
    let animationFrameId: number;
    let map: any;

    useEffect(() => {
        dispatch(getAllVehicleRoutes())
        dispatch(getGeoFences()); // Dispatch action to fetch data on component mount
    }, [dispatch]);

    useEffect(() => {
        // Clean up on component unmount
        return () => {
            map && map.clean()
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
    
            // Dispose Three.js objects
            if (geojsonData.current) {
                geojsonData.current = null;
            }
    
            // Clean up map and controls
            if (window.mapPicker) {
                window.mapPicker = null;
            }
            if (window.map) {
                window.map = null;
            }
            if (window.controls) {
                window.controls.dispose();
            }
            // Clean up Three.js objects
            if (mapContainer.current && mapContainer.current.firstChild) {
                mapContainer.current.removeChild(mapContainer.current.firstChild);
            }
        };
    }, []); // Added dependencies to reinitialize map if lat/lng changes

    const checkAll = layerOptions.length === checkedList.length;
    const indeterminate = checkedList.length > 0 && checkedList.length < layerOptions.length;
    const CheckboxGroup = Checkbox.Group;

    return (
        <>
            <React.Fragment>
                <div className="page-content" style={{paddingBottom: '0px'}}>
                    <Container fluid>
                    <Breadcrumb title="Home" breadcrumbItem="3D Pit View" />
                    <Row>
                        <Col lg="12">
                        <div style={{ alignContent: 'center', marginBottom: '20px' }}>
                            <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                            All
                            </Checkbox>
                            <CheckboxGroup options={layerOptions} value={checkedList} onChange={onChange} />
                        </div>
                            <THREEJSMap defaultLayers={checkedList} drawMarkers={() => {}} updateAnnotations={() => {}} isLoading={isLoading} setIsLoading={setIsLoading} />
                        </Col>
                    </Row>
                    </Container>
                </div>
            </React.Fragment >
        </>
    )
}