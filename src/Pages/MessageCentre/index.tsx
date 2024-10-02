import React, { useCallback, useEffect, useRef, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import * as Leaflet from 'leaflet';
import { Tabs, Layout } from 'antd';
import './index.css';
import { getGeoFences, getAllFleet, getAllEvents } from 'slices/thunk';
import { LAYOUT_MODE_TYPES } from "Components/constants/layout";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import MessagesPanel from "./MessagePanel";
import mapboxgl, { LngLatLike, Marker } from "mapbox-gl";
import { buildGraticule } from "utils/mapUtils";
import _ from "lodash";
import { shiftTimings } from "utils/common";
import { activeExcavator, activeTruck, delayExcavator, delayTruck, downExcavator, downTruck, standbyExcavator, standbyTruck } from "assets/images/map";
import { Dropdown, DropdownType } from "Components/Common/Dropdown";
import StatusCard from "./StatusCard";
import MessageComponent from "./MessageComponent";
import EquipmentBoard from "./EquipmentBoard";
const { Content } = Layout;
const { TabPane } = Tabs;
export interface EquipmentLocation {
    id: string;
    name: string;
    color: string;
    status: string;
    position: LngLatLike;
    vehicleType: string;
    operator: string;
    rpm: number;
    interval: number;
    fault: string;
    statusColor: string;
}

interface MessageItem {
    id: string;
    name: string;
}
  
interface MarkerData {
    id: string;
    marker: Marker;
}

interface Geofence {
    id: number,
    name: string;
    layer: Leaflet.Layer | null;  // Make layer nullable
}
  
const equipments: EquipmentLocation[] = [
    {
        id: "DT101",
        name: "DT101",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [120.46246497162531,
            -29.160384014441625],
        operator: 'DT101',
        rpm: 2700, 
        interval: 195, 
        fault: 'CA234', 
        statusColor: 'green'
    },
    {
        id: "DT102",
        name: "DT102",
        status: "ACTIVE",
        operator: 'DT102',
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [120.45002414328343,
            -29.157918736758198],
        rpm: 1500, 
        interval: 315, 
        fault: 'CA234', 
        statusColor: 'green' 
    },
    {
        id: "DT103",
        name: "DT103",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [120.4383369229248,
            -29.15641296566485],
        operator: 'DT103', 
        rpm: 500, 
        interval: 502, 
        fault: 'CA234', 
        statusColor: 'purple'
    },
    {
        id: "DT104",
        name: "DT104",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [120.4509115631555,
            -29.16343502685107],
        operator: 'DT104', 
        rpm: 2316, 
        interval: 122, 
        fault: 'CA234', 
        statusColor: 'green'
    },
    {
        id: "DT105",
        name: "DT105",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [
            120.44976212320336,
            -29.157642097015362
        ],
        operator: 'DT105', 
        rpm: 2000, 
        interval: 0, 
        fault: 'CA234', 
        statusColor: 'red'
    },
    {
        id: "DT106",
        name: "DT106",
        status: "STANDBY",
        color: "#F08B00",
        vehicleType: "DUMP_TRUCK",
        position: [
            120.43758279849703,
            -29.156386794482586
        ],
        operator: 'DT106', 
        rpm: 2130, 
        interval: 503, 
        fault: 'CA234', 
        statusColor: 'green'
    },
    {
        id: "DT121",
        name: "DT121",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [120.44438970741732,
            -29.146627309426933],
        operator: 'DT121', 
        rpm: 2000,
        interval: 201, 
        fault: 'CA234', 
        statusColor: 'green'
    },
    {
        id: "DT122",
        name: "DT122",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "DUMP_TRUCK",
        position: [120.44551473011586,
            -29.152641269272948],
        operator: 'DT122',
        rpm: 2000, 
        interval: 221, 
        fault: 'CA234', 
        statusColor: 'green'
    },
    {
        id: "DT123",
        name: "DT123",
        status: "DELAY",
        color: "#BC00FF",
        vehicleType: "DUMP_TRUCK",
        position: [
            120.44526945482403,
            -29.14803343661103
        ] ,
        operator: 'DT123',
        rpm: 2000, 
        interval: 221, 
        fault: 'CA234', 
        statusColor: 'gold'
    },
    {
        id: "EX201",
        name: "EX201",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "EXCAVATOR",
        position: [
            120.44463458272295,
            -29.146790943732764
        ],
        operator: 'EX201',
        rpm: 2000, 
        interval: 221, 
        fault: 'CA234', 
        statusColor: 'green'
    },
    {
        id: "EX202",
        name: "EX202",
        status: "ACTIVE",
        color: "#009D10",
        vehicleType: "EXCAVATOR",
        position: [
            120.44968382497262,
            -29.15766694159693
        ],
        operator: 'EX202',
        rpm: 2000, 
        interval: 221, 
        fault: 'CA234', 
        statusColor: 'green'
    },
    {
        id: "EX205",
        name: "EX205",
        status: "DELAY",
        color: "#BC00FF",
        vehicleType: "EXCAVATOR",
        position: [
            120.44516509787695,
            -29.147993875066938
        ],
        operator: 'EX205',
        rpm: 2000, 
        interval: 221, 
        fault: 'CA234', 
        statusColor: 'gold'
    }
]

const dumpingPaths = {
    type: 'FeatureCollection',
    features: [
      {
        "id": "bd75417a4d6220eaa22607c1dcef716b",
        "type": "Feature",
        "properties": {},
        "geometry": {
          "coordinates": [
            [
              120.44438970741732,
              -29.146627309426933
            ],
            [
              120.4442274307242,
              -29.146387322587906
            ],
            [
              120.44415072955388,
              -29.146607362040278
            ],
            [
              120.44413852347515,
              -29.147044057451183
            ],
            [
              120.44423384216378,
              -29.147482281142487
            ],
            [
              120.44437900559785,
              -29.148137368465434
            ],
            [
              120.4444611747428,
              -29.148423544949097
            ],
            [
              120.44460218168092,
              -29.148741815648506
            ],
            [
              120.44485350113376,
              -29.149042027368097
            ],
            [
              120.44511053585188,
              -29.149331649824745
            ],
            [
              120.44534639143461,
              -29.149599764290123
            ],
            [
              120.44551515198503,
              -29.14995375407502
            ],
            [
              120.44553986761662,
              -29.15025821181986
            ],
            [
              120.44563869225067,
              -29.150881342718513
            ],
            [
              120.44570717429548,
              -29.1512136277292
            ],
            [
              120.44576592620894,
              -29.151722264829786
            ],
            [
              120.44586439032986,
              -29.15229354362662
            ],
            [
              120.44596145016271,
              -29.152802818241128
            ],
            [
              120.44594634081665,
              -29.152997264172697
            ],
            [
              120.44587683453369,
              -29.15318980759774
            ],
            [
              120.4456824923534,
              -29.153409481548778
            ],
            [
              120.4448458221936,
              -29.154183347394373
            ],
            [
              120.44449947901558,
              -29.154489497501494
            ],
            [
              120.44421052519596,
              -29.154764907366364
            ],
            [
              120.44383973362892,
              -29.15496867265273
            ],
            [
              120.44350366899494,
              -29.155066680931938
            ],
            [
              120.44318131863207,
              -29.15505787387947
            ],
            [
              120.44259883174277,
              -29.15495963787427
            ],
            [
              120.44197695818451,
              -29.154895798340178
            ],
            [
              120.44132003023685,
              -29.155084234283052
            ],
            [
              120.44023229318157,
              -29.15533424338021
            ],
            [
              120.43948670260221,
              -29.15555156287538
            ],
            [
              120.43855597237041,
              -29.155825594520984
            ],
            [
              120.43829307027693,
              -29.155956333117402
            ],
            [
              120.43827931019695,
              -29.156175767373988
            ],
            [
              120.4383369229248,
              -29.15641296566485
            ]
          ],
          "type": "LineString"
        }
      },
      {
        "id": "d30d00c218e734d5f11947f11e272cf8",
        "type": "Feature",
        "properties": {},
        "geometry": {
          "coordinates": [
            [
              120.45002414328343,
              -29.157918736758198
            ],
            [
              120.45017028413355,
              -29.158264268470887
            ],
            [
              120.45024294687119,
              -29.158588845155727
            ],
            [
              120.45022662696834,
              -29.158931241329675
            ],
            [
              120.45012697683234,
              -29.159211073380348
            ],
            [
              120.44994056549632,
              -29.159303807814325
            ],
            [
              120.44974373559097,
              -29.15927769860378
            ],
            [
              120.4494873186726,
              -29.159006210183477
            ],
            [
              120.4492665764459,
              -29.158640689786296
            ],
            [
              120.44898048533486,
              -29.158264268470887
            ],
            [
              120.448690452851,
              -29.157862570887985
            ],
            [
              120.44836111496579,
              -29.157424047377766
            ],
            [
              120.44808521202043,
              -29.157079204381752
            ],
            [
              120.44789835315152,
              -29.156930557898875
            ],
            [
              120.44767090416417,
              -29.15683816184874
            ],
            [
              120.44742284553479,
              -29.156930557898875
            ],
            [
              120.44746342531573,
              -29.157151134243456
            ],
            [
              120.44801073043897,
              -29.158254397415114
            ],
            [
              120.44846427933606,
              -29.15917014333791
            ],
            [
              120.44999590287534,
              -29.162166578961823
            ],
            [
              120.45021208808214,
              -29.162541658307205
            ],
            [
              120.45044951419698,
              -29.16289903073509
            ],
            [
              120.45067581469073,
              -29.163126909057908
            ],
            [
              120.45101402783433,
              -29.163295317906318
            ],
            [
              120.4514957629994,
              -29.16340547440769
            ],
            [
              120.45211386711287,
              -29.163490385254114
            ],
            [
              120.45272607463983,
              -29.163488836040003
            ],
            [
              120.45385993699205,
              -29.16333783160721
            ],
            [
              120.45583476977248,
              -29.162764604937998
            ],
            [
              120.45712729897798,
              -29.162351597303108
            ],
            [
              120.45800945221953,
              -29.162063105605164
            ],
            [
              120.45905613814932,
              -29.1613594501638
            ],
            [
              120.46035080487519,
              -29.16033946713747
            ],
            [
              120.46077509442762,
              -29.16002143498551
            ],
            [
              120.46117298701341,
              -29.159889344058016
            ],
            [
              120.46158990849926,
              -29.159878921631233
            ],
            [
              120.46204630174753,
              -29.15992038302778
            ],
            [
              120.46246187351079,
              -29.160001515493285
            ],
            [
              120.46275663053598,
              -29.160084482222132
            ],
            [
              120.46287160897748,
              -29.160196189941054
            ],
            [
              120.46284022812279,
              -29.160319570950804
            ],
            [
              120.46276375673716,
              -29.16037246924384
            ],
            [
              120.4626505128033,
              -29.160366668385258
            ],
            [
              120.46246497162531,
              -29.160384014441625
            ],
            [
              120.46221114476094,
              -29.160429454928995
            ],
            [
              120.46201657780148,
              -29.160446196069515
            ],
            [
              120.46176373656584,
              -29.160462777723808
            ],
            [
              120.46144511165818,
              -29.160506232864904
            ],
            [
              120.46122751637074,
              -29.16060013061515
            ],
            [
              120.46105711362321,
              -29.160703365511125
            ],
            [
              120.4609137887681,
              -29.160804861486774
            ],
            [
              120.46098357019855,
              -29.1610813447436
            ],
            [
              120.4611559908385,
              -29.161295504918783
            ]
          ],
          "type": "LineString"
        }
      }
    ]
};

  const travellingPaths = {
    type: 'FeatureCollection',
    features: [
      {
        "id": "8c93154be7d2e8934bbdbef7a2f15303",
        "type": "Feature",
        "properties": {},
        "geometry": {
          "coordinates": [
            [
              120.4509115631555,
              -29.16343502685107
            ],
            [
              120.45056322997993,
              -29.16322369984951
            ],
            [
              120.45026409317938,
              -29.16292309602222
            ],
            [
              120.4498823833984,
              -29.162323213869776
            ],
            [
              120.448414278406,
              -29.15947869881643
            ],
            [
              120.44747354113719,
              -29.157550485319526
            ],
            [
              120.44733303552692,
              -29.157194340411095
            ],
            [
              120.44734395336894,
              -29.15692310593934
            ],
            [
              120.44744383422051,
              -29.15681247017954
            ],
            [
              120.44755964647157,
              -29.156760667841453
            ],
            [
              120.44773953538174,
              -29.156751988005837
            ],
            [
              120.44804117909973,
              -29.15696508468961
            ],
            [
              120.44829009799253,
              -29.157202495193175
            ],
            [
              120.44848776609786,
              -29.15746830085935
            ],
            [
              120.44866658524023,
              -29.15780800552305
            ],
            [
              120.44904307589525,
              -29.15828535681804
            ],
            [
              120.44935449183254,
              -29.158714588903777
            ],
            [
              120.44958672099904,
              -29.15913521272899
            ],
            [
              120.44978361618399,
              -29.15926895457644
            ],
            [
              120.44999304046235,
              -29.159199908655054
            ],
            [
              120.45016787748852,
              -29.159030839622496
            ],
            [
              120.4501937236252,
              -29.15883789771088
            ],
            [
              120.45020412142594,
              -29.158557314256484
            ],
            [
              120.450062154065,
              -29.158173531245716
            ],
            [
              120.4498886967001,
              -29.157714214967164
            ]
          ],
          "type": "LineString"
        }
      },
      {
        "id": "4a6015da092bf62869b7aaf6160bb228",
        "type": "Feature",
        "properties": {},
        "geometry": {
          "coordinates": [
            [
              120.44551473011586,
              -29.152641269272948
            ],
            [
              120.44539571205422,
              -29.151914184457368
            ],
            [
              120.44517240656859,
              -29.150531112713587
            ],
            [
              120.44478593943927,
              -29.149568983324066
            ],
            [
              120.44421789210458,
              -29.148859328490637
            ],
            [
              120.44368919657501,
              -29.147164298759755
            ],
            [
              120.44369209927515,
              -29.146542327241796
            ],
            [
              120.44383946086413,
              -29.146331719196695
            ],
            [
              120.4440976631223,
              -29.146298821160393
            ],
            [
              120.44435500673364,
              -29.14636435142546
            ],
            [
              120.44454019859671,
              -29.146536106667888
            ],
            [
              120.44459995683707,
              -29.146664410491823
            ]
          ],
          "type": "LineString"
        }
      }
    ]
};
const MessageCentre = (props: any) => {
    document.title = "Message Centre | FMS Live";

    const { layoutModeType } = useSelector(
        createSelector(
          (state: any) => state.Layout,
          (layout) => ({
            layoutModeType: layout.layoutModeTypes,
          })
        )
    );
    const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;

    const dispatch: any = useDispatch();
    
    const eventsProperties = createSelector(
        (state: any) => state.Events,
        (eventsState) => ({
        events: eventsState.data
        })
    );
    
    const mapContainer = useRef(null);
    const mapRef = useRef<any>(null);
    const [lng, setLng] = useState(120.44463458272295,);
    const [lat, setLat] = useState(-29.146790943732764);

    const [filter, setFilter] = useState<string>('All Equipment');

    const [markers, setMarkers] = useState<MarkerData[]>([]);
    var [geofences, setGeofences] = useState<any[]>([]);

    const [currentEq, setCurrentEq] = useState<EquipmentLocation[]>([]);
    const [isBroadcast, setIsBroadcast] = useState(false)

    const [activeTab, setActiveTab] = useState<string>('1');
    const onChangeTap = useCallback((key) => { 
        setActiveTab(key); 
        if (key === '2') setShowMessageModal(false)
        if (key === '1') {
            setShowDetailModal(false)
            setShowMessageModal(false)
        }
    }, [])
    useEffect(() => {
        // get routeData
        if (mapRef.current) return; // Initialize map only once
        mapboxgl.accessToken = 'pk.eyJ1IjoiaG1lc3VwcG9ydCIsImEiOiJjbHp1eTRibDAwMG05MmpvczE1ZHdham5qIn0.ZoE3pSipzwdf-0TkY3ezzw';

        if (mapRef.current) return; // initialize map only once

        mapRef.current = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/hmesupport/cm00qombw008z01oe8pcf6j2m', //'mapbox://styles/mapbox/standard-satellite',
            center: [lng, lat],
            zoom: 15,
            pitch: 60,
            minZoom: 15,
            attributionControl: false,
            bearing: 50,

        });

        // mapRef.current.addControl(new mapboxgl.ScaleControl());
        // mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }));
        // mapRef.current.addControl(new mapboxgl.FullscreenControl());

        mapRef.current.on('style.load', () => {
            mapRef.current?.addSource('mapbox-terrain-rgb', {
                type: 'raster-dem',
                url: 'mapbox://mapbox.terrain-rgb',
                tileSize: 512,
                maxzoom: 15,
            });
            
            mapRef.current?.setTerrain({ source: 'mapbox-terrain-rgb', exaggeration: 1 });
        });

        mapRef.current.on('load', () => {
            mapRef.current.setTerrain({ 'exaggeration': 2 });
            const graticule = buildGraticule(lat, lng);
            mapRef.current.addSource('graticule', {
                type: 'geojson',
                data: graticule
            });
      
            mapRef.current.addLayer({
                id: 'graticule',
                type: 'line',
                source: 'graticule',
                minzoom: 17,
                layout: {},
                paint: {
                    'line-color': 'white',
                    'line-width': 1
                }
            });
        });
        
        // mapRef.current.on('click', handleMapClick);
        mapRef.current.doubleClickZoom.disable();

        // addMarkers();
    }, []);

    const rippleIcon = (eq) => {
        // const textStyle = `
        //         display: flex;
        //         background-color: #242424;
        //         opacity: 1;
        //         position: absolute;
        //         top: -30px;
        //         left: -46px;
        //         font-size: 16px;
        //         color: ${eq.color};
        //         font-weight: 600;
        //         padding: 10px 16px 10px 16px;
        //         width: 110px;
        //         height: 40px;
        //         justify-content: space-around;
        //         text-align: center;`;
    
        // const isNotActive: boolean = eq.status.toLowerCase() != 'ACTIVE';
        // const standardIconTemplate = `
        //         <div class="marker-imageContainer" style="${textStyle}">
        //           <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        //           <path d="M21.425 10.275C21.425 10.2 21.425 10.2 21.425 10.275C21.35 10.2 21.35 10.125 21.35 10.125L18.35 5.625C18.2 5.4 17.975 5.25 17.75 5.25H14.75V4.35L18.65 3.75C18.95 3.675 19.25 3.375 19.25 3V1.5C19.25 1.05 18.95 0.75 18.5 0.75H11.75C11.45 0.75 11.225 0.9 11.075 1.2L9.05 5.25H1.25C0.8 5.25 0.5 5.55 0.5 6V9.75C0.5 9.975 0.575 10.125 0.725 10.275L2.75 12.3C1.4 12.9 0.5 14.25 0.5 15.75C0.5 17.85 2.15 19.5 4.25 19.5C6.35 19.5 8 17.85 8 15.75C8 15.525 8 15.225 7.925 15H11.075C11 15.225 11 15.525 11 15.75C11 17.85 12.65 19.5 14.75 19.5C16.85 19.5 18.5 17.85 18.5 15.75H20.75C21.2 15.75 21.5 15.45 21.5 15V10.5C21.5 10.425 21.5 10.35 21.425 10.275ZM14.75 6.75H17.375L19.4 9.75H18.725C17.975 9.75 17.3 9.3 17 8.7C16.775 8.4 16.55 8.25 16.25 8.25H14.75V6.75ZM4.25 18C2.975 18 2 17.025 2 15.75C2 14.475 2.975 13.5 4.25 13.5C5.525 13.5 6.5 14.475 6.5 15.75C6.5 17.025 5.525 18 4.25 18ZM11.75 10.5H4.25C3.8 10.5 3.5 10.2 3.5 9.75C3.5 9.3 3.8 9 4.25 9H11.75C12.2 9 12.5 9.3 12.5 9.75C12.5 10.2 12.2 10.5 11.75 10.5ZM14.75 18C13.475 18 12.5 17.025 12.5 15.75C12.5 14.475 13.475 13.5 14.75 13.5C16.025 13.5 17 14.475 17 15.75C17 17.025 16.025 18 14.75 18Z" fill="${eq.color}"/>
        //           </svg>
        //           <div>${eq.name}</div>
        //         </div>
        //         `
        const textStyle = `
            background-color: white;
            position: absolute;
            top: -96px;
            left: -46px;
            border: 4px solid ${eq.color};
            border-radius: 20px;
            font-size: 20px;
            color: ${eq.color};
            font-weight: 600;
            padding-left: 12px;
            padding-right: 12px;
            width: 100px;
            text-align: center;`;



        const isNotActive: boolean = eq.status.toLowerCase() != 'ACTIVE';
        const standardIconTemplate = `<div style="${textStyle}">${eq.name}</div>
                <div id="imageContainer" style="position: absolute;bottom: 5px;transform: translateX(-40%); z-index:1;">
                  <img src="${getEquipmentStatusIcon(eq)}" alt="Description of the image">
                </div>`

    
        const icon = document.createElement('div');
        icon.innerHTML = standardIconTemplate;
        return icon
    }

    const getEquipmentStatusIcon = (eq: EquipmentLocation) => {
        if (eq.vehicleType == 'EXCAVATOR') {
            switch (eq.status) {
                case 'ACTIVE':
                    return activeExcavator;
                case 'STANDBY':
                    return standbyExcavator;
                case 'DOWN':
                    return downExcavator;
                case 'DELAY':
                    return delayExcavator;
            }
    
        } else if (eq.vehicleType == 'DUMP_TRUCK') {
            switch (eq.status) {
                case 'ACTIVE':
                    return activeTruck;
                case 'STANDBY':
                    return standbyTruck;
                case 'DOWN':
                    return downTruck;
                case 'DELAY':
                    return delayTruck;
            }
        }
    }
    

    useEffect(() => {
        dispatch(getGeoFences());
        dispatch(getAllFleet());
    
        const { shift, shiftDate } = shiftTimings();
        dispatch(getAllEvents(shiftDate + ':' + shift));
    }, [dispatch]);
    
    const clearMarkers = () => {
        markers.map(item => {
            // mapRef.current?.removeLayer(item.marker)
            item.marker.remove()
        })
        setMarkers([]);
    }
    
    let animationRequestId: number;

    useEffect(() => {
        clearMarkers();
        const markersData: MarkerData[] = [];
        let filteredEquipment: EquipmentLocation[] = []
        if (filter == 'All Equipment') {
            filteredEquipment = equipments
        } else {
            filteredEquipment = equipments.filter(item => item.vehicleType == filter)
        }
    
        if (mapRef.current.getLayer('line-dashed')) {
            mapRef.current.removeLayer('line-dashed')
        }
    
        if (mapRef.current.getLayer('loaded-line-dashed')) {
            mapRef.current.removeLayer('loaded-line-dashed')
        }
    
        if (mapRef.current.getLayer('line-background')) {
            mapRef.current.removeLayer('line-background')
        }
    
        if (mapRef.current.getLayer('loaded-line-background')) {
            mapRef.current.removeLayer('loaded-line-background')
        }
    
        if (mapRef.current.getSource('line')) {
            mapRef.current.removeSource('line')
        }
    
    
        if (mapRef.current.getSource('loadedline')) {
          mapRef.current.removeSource('loadedline')
        }
    
        if (mapRef.current && (filter == 'DUMP_TRUCK' || filter == 'All Equipment')) {
    
            if (mapRef.current.isStyleLoaded()) {
                mapRef.current.addSource('line', {
                    type: 'geojson',
                    data: travellingPaths
                });
        
                mapRef.current.addSource('loadedline', {
                    type: 'geojson',
                    data: dumpingPaths
                });
        
                mapRef.current.addLayer({
                    type: 'line',
                    source: 'line',
                    id: 'line-background',
                    paint: {
                        'line-color': 'red',
                        'line-width': 40,
                        'line-opacity': 0.4
                    }
                });
        
                mapRef.current.addLayer({
                    type: 'line',
                    source: 'line',
                    id: 'line-dashed',
                    paint: {
                        'line-color': 'yellow',
                        'line-width': 4,
                        'line-dasharray': [0, 4, 3]
                    }
                });
        
                mapRef.current.addLayer({
                    type: 'line',
                    source: 'loadedline',
                    id: 'loaded-line-background',
                    paint: {
                        'line-color': '#14E010',
                        'line-width': 4,
                        'line-opacity': 0.4
                    }
                });
        
                mapRef.current.addLayer({
                    type: 'line',
                    source: 'loadedline',
                    id: 'loaded-line-dashed',
                    paint: {
                        'line-color': 'yellow',
                        'line-width': 4,
                        'line-dasharray': [0, 4, 3]
                    }
                });
        
                const dashArraySequence = [
                    [0, 4, 3],
                    [0.5, 4, 2.5],
                    [1, 4, 2],
                    [1.5, 4, 1.5],
                    [2, 4, 1],
                    [2.5, 4, 0.5],
                    [3, 4, 0],
                    [0, 0.5, 3, 3.5],
                    [0, 1, 3, 3],
                    [0, 1.5, 3, 2.5],
                    [0, 2, 3, 2],
                    [0, 2.5, 3, 1.5],
                    [0, 3, 3, 1],
                    [0, 3.5, 3, 0.5]
                ];
        
                let step = 0;
        
                function animateDashArray(timestamp) {
                    const newStep = Math.round((timestamp / 50) % dashArraySequence.length);
                    if (newStep !== step && mapRef.current.getLayer('line-dashed')) {
                        mapRef.current.setPaintProperty(
                            'line-dashed',
                            'line-dasharray',
                            dashArraySequence[step]
                        );
                        step = newStep;
                    } else {
            
                    }
            
                    return requestAnimationFrame(animateDashArray);
                }
        
                animationRequestId = animateDashArray(0);
            }
        }
    
        
        filteredEquipment.map(eq => {
            // const marker = new ExtendedMarker(eq.position as Leaflet.LatLngExpression, { icon: rippleIcon(eq) }).addTo(mapRef.current!)
            // const el = document.createElement('div');
            // el.className = 'activemarker';
            const el = rippleIcon(eq)
            const marker = new mapboxgl.Marker(el).setLngLat(eq.position).addTo(mapRef.current);
            markersData.push({ id: eq['name'], marker: marker })
            marker.getElement().addEventListener('click', () => {
                setShowDetailModal(true);
                setCurrentEq([eq]);
            })
    
        })
        // markersLayer.
        setMarkers(markersData);
    }, [filter]);

    const locationItems = [
        {
            label: "Blasthole Rig",
            value: "BLASTHOLE_RIG",
        },
        {
            label: "Haul Truck",
            value: "HAUL_TRUCK",
        },
        {
            label: "Dozer",
            value: "DOZER",
        },
    ]

    const [locations, setLocaltions] = useState<DropdownType>({
        label: "ALL",
    });

    const [showDetailModal, setShowDetailModal] = useState<boolean>(false)
    const [showMessageModal, setShowMessageModal] = useState<boolean>(false)

    const handleMessageClick = useCallback(() => {
        setShowMessageModal(true)
        setIsBroadcast(false)
    }, [currentEq])
    const onClose = useCallback(() => {
        setShowDetailModal(false)
    }, [showDetailModal])
    const showMessage = useCallback(() => {
        setShowMessageModal(true)
    }, [showMessageModal])
    return (
        <React.Fragment>
            <div className="page-content" style={{}}>
                <Container fluid >
                        <Content style={{ minHeight: 'calc( 100vh - 130px)' , margin: '-24px', border: '1px solid #535E77'}}>
                            <Row style={{height: '100%'}}>
                                <Col sm={9} md={9} xs={12}  style={{padding: '30px 20px 10px 20px', background: isLight ? 'white' : '#1d263b'}}>
                                    <div style={{position:'absolute', right: '30px', zIndex: '9', display: activeTab === '1' ? 'block' : 'none'}}>
                                        <Dropdown
                                            label="Choose Location"
                                            items={locationItems}
                                            value={locations}
                                            onChange={setLocaltions}
                                            />
                                    </div>
                                    <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={(key) => onChangeTap(key)} >
                                        <TabPane tab="Map View" key="1">
                                        {/* Map View Placeholder */}
                                            <div ref={mapContainer} className="map-container" style={{ height: 'calc(100vh - 250px)', width: '100%', borderRadius: '20px' }} >
                                                <div style={{display: showDetailModal ? 'block' : 'none'}}>
                                                    <StatusCard id={currentEq[0] && currentEq[0].id ? currentEq[0].id : "DT103"}
                                                        syncedTime={"1h ago"}
                                                        status={currentEq[0] && currentEq[0].status ? currentEq[0].status : "Healthy"}
                                                        smu="33,987.67"
                                                        fuelLevel="30%"
                                                        fuelRate="8.92 L/h"
                                                        bgColor={currentEq[0] && currentEq[0].color ? currentEq[0].color: 'green'}
                                                        onMessageClick={handleMessageClick}
                                                        onClose={onClose}  />
                                                </div>
                                            </div>
                                        </TabPane>
                                        <TabPane tab="List View" key="2">
                                            <EquipmentBoard setIsBroadcast={setIsBroadcast} setCurrentEq={setCurrentEq} showMessage={showMessage} data={equipments} />
                                        </TabPane>
                                    </Tabs>
                                    {showMessageModal && <MessageComponent isLight={isLight} isBroadcast={isBroadcast} currentEq={currentEq} onClose={() => setShowMessageModal(false)} />}
                                </Col>
                                {/* Optional Message Panel */}
                                <Col xs={12} md={3} sm={3} style={{height: 'calc( 100vh - 130px)', paddingLeft: '0'}} className="custom-scrollbar-horizontal">
                                    <MessagesPanel setIsBroadcast={setIsBroadcast} showMessageModal={setShowMessageModal} />
                                </Col>
                            </Row>
                        </Content>
                </Container>
            </div>
        </React.Fragment >
    )
}

export default MessageCentre;