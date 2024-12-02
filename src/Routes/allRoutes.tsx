import { Navigate } from "react-router-dom"
import React from "react";
import socketIO from 'socket.io-client';
import OilAnalysisReportPage from "Pages/OilAnalysis/OilAnalysisReportPage";
import { ThreeJS } from "Pages/ThreeJS";
import TruckLoadOptimisation from "Pages/TruckLoadOptimisation";
import DiggingOptimisation from "Pages/DiggingOptimisation";
import PayloadOptimsation from "Pages/PayloadOptimisation";

import FMS from "Pages/FleetStatus";
// const FMS = React.lazy(() => import("Pages/FleetStatus"));

import DispatchLive from "Pages/DispatchLive";
// const DispatchLive = React.lazy(() => import("Pages/DispatchLive"));

import {RealTimePositioning} from "Pages/Map";
// const Map = React.lazy(() => import("Pages/Map"));

import Geofences from "Pages/Geofences";
// const Geofences = React.lazy(() => import("Pages/Geofences"));

import AutoRouting from "Pages/AutoRouting";
// const AutoRouting = React.lazy(() => import("Pages/AutoRouting"));

import TruckingDashboard from "Pages/TruckingDashboard";
// const TruckingDashboard = React.lazy(() => import("Pages/TruckingDashboard"));

import DiggingDashboard from "Pages/DiggingDashboard";
// const DiggingDashboard = React.lazy(() => import("Pages/DiggingDashboard"));

import EquipmentGantt from "Pages/EquipmentGantt";
import { Underground } from "Pages/Underground";
// const EquipmentGantt = React.lazy(() => import("Pages/Equipment Gantt"));

// Auth

// const MaterialInventory = React.lazy(() => import("Pages/MaterialInventory"));
import MaterialInventory from "Pages/MaterialInventory"

// const DiggingPerformance = React.lazy(() => import("Pages/DiggingPerformance"));
import DiggingPerformance from "Pages/DiggingPerformance"

// const OreTracker = React.lazy(() => import("Pages/OreTracker"));
import OreTracker from "Pages/OreTracker";

// const ShiftRoster = React.lazy(() => import("Pages/ShiftRoster"));
import ShiftRoster from "Pages/ShiftRoster";

// const MapGeofence = React.lazy(() => import("Pages/MapGeofences"));
import MapGeofence from "Pages/MapGeofences";

// const FleetTimeline = React.lazy(() => import("Pages/FleetTimeline"));
import FleetTimeline from "Pages/FleetTimeline";

// const Target = React.lazy(() => import("Pages/Targets"));
import Target from "Pages/Targets";

// const OperatorReport = React.lazy(() => import("Pages/OperatorReport"));
import OperatorReport from "Pages/OperatorReport";

// const TelemetryReport = React.lazy(() => import("Pages/TelemetryReport"));
import TelemetryReport from "Pages/TelemetryReport";

// const GanttScheduler = React.lazy(() => import("Pages/GanttScheduler"));
import GanttScheduler from "Pages/GanttScheduler";

// const Replay = React.lazy(() => import("Pages/Replay"));
import Replay from "Pages/Replay";

// const MaintenanceStatus = React.lazy(() => import("Pages/MaintenanceStatus"));
import MaintenanceStatus from "Pages/MaintenanceStatus";

// const MaterialMovement = React.lazy(() => import("Pages/MaterialMovement"));
import MaterialMovement from "Pages/MaterialMovement";

// const ShiftReport = React.lazy(() => import("Pages/Reports/ShiftReport"));
import ShiftReport from "Pages/Reports/ShiftReport";

// const DigBlockLayout = React.lazy(() => import("Pages/DigBlockLayout"));
import DigBlockLayout from "Pages/DigBlockLayout";

// const DailyProductionDashboard = React.lazy(() => import("Pages/DailySnapshot"));
import DailyProductionDashboard from "Pages/DailySnapshot";

// const TruckingPerformance = React.lazy(() => import("Pages/Trucking"));
import TruckingPerformance from "Pages/Trucking";

// const FuelStatusDashboard = React.lazy(() => import("Pages/FuelStatus"));
import FuelStatusDashboard from "Pages/FuelStatus";

// const MaintenanceScheduler = React.lazy(() => import("Pages/MaintenanceScheduler"));
import MaintenanceScheduler from "Pages/MaintenanceScheduler";

// const OilAnalysis = React.lazy(() => import("Pages/OilAnalysis"));
import OilAnalysis from "Pages/OilAnalysis";

// const PreStarts = React.lazy(() => import("Pages/PreStarts"));
import PreStarts from "Pages/PreStarts";

// const HaulRoadOptimisation = React.lazy(() => import("Pages/HaulRoadOptimisation"));
import HaulRoadOptimisation from "Pages/HaulRoadOptimisation";

// const HaulTruckIntelligence = React.lazy(() => import("Pages/HaulTruckIntelligence"));
import HaulTruckIntelligence from "Pages/HaulTruckIntelligence";

// const PitView = React.lazy(() => import("Pages/PitView"));
// const ProductionSummary = React.lazy(() => import("Pages/ProductionSummary"));
import ProductionSummary from "Pages/ProductionSummary";

// const ShortIntervalControl = React.lazy(() => import("Pages/ShortIntervalControl"));
import ShortIntervalControl from "Pages/ShortIntervalControl";

// const FuelScheduler = React.lazy(() => import("Pages/FuelScheduler"));
import FuelScheduler from "Pages/FuelScheduler";

// const MessageCentre = React.lazy(() => import("Pages/MessageCentre"));
import MessageCentre from "Pages/MessageCentre";

// const TelemetryDetails = React.lazy(() => import("Pages/TelemetryDetails"));
import TelemetryDetails from "Pages/TelemetryDetails";

// const RomWasteSummary = React.lazy(() => import("Pages/RomWasteSummary"));
import RomWasteSummary from "Pages/RomWasteSummary";

// const PreShiftInfo = React.lazy(() => import("Pages/PreShiftInfo"));
import PreShiftInfo from "Pages/PreShiftInfo";

// const OreSpotter = React.lazy(() => import("Pages/OreSpotter"));
import OreSpotter from "Pages/OreSpotter";

// const CarryBackDescrepencies = React.lazy(() => import("Pages/CarryBackDescrepencies"));
import CarryBackDescrepencies from "Pages/CarryBackDescrepencies";

// const ROMMillTargets = React.lazy(() => import("Pages/ROMMillTargets"));
import ROMMillTargets from "Pages/ROMMillTargets";



// const Dispatch = React.lazy(() => import("Pages/Dispatch"));
import Dispatch from "Pages/Dispatch";

// const ROMManagement = React.lazy(() => import("Pages/ROMManagement"));
import ROMManagement from "Pages/ROMManagement";

// const WasteDumpManagement = React.lazy(() => import("Pages/WasteDumpManagement"));
import WasteDumpManagement from "Pages/WasteDumpManagement";

// const BlendPlans = React.lazy(() => import("Pages/BlendPlans"));
import BlendPlans from "Pages/BlendPlans";

import MenuSettings from "Pages/MenuSettings";
// const Materials = React.lazy(() => import("Pages/Materials"));
import Materials from "Pages/Materials";

import RosterScheduler from "Pages/RosterScheduler";
import TruckingTripSummary from "Pages/TrackingTripSummary";
import NetworkMonitoring from "Pages/NetworkMonitoring";

const ManagerKPI = React.lazy(() => import("Pages/ManagerKPI"));

const PreStartDetails = React.lazy(() => import("Pages/PreStartDetails"));

const TimelineReport = React.lazy(() => import("Pages/Reports/TimelineReport"));
const Mock = React.lazy(() => import("Pages/Mock"));

const Reports = React.lazy(() => import("Pages/Reports"));

const Replay2D = React.lazy(() => import("Pages/2DReplay"));

const LoginPage = React.lazy(() => import("Pages/Authentication/Login"));
const Logout = React.lazy(() => import("Pages/Authentication/Logout"));
const ForgotPassword = React.lazy(() => import("Pages/Authentication/ForgotPassword"));

const Benches = React.lazy(() => import("Pages/Benches"));
const AdminSettings = React.lazy(() => import("Pages/AdminSettings"))
const Users = React.lazy(() => import("Pages/Users"));
const Fleet = React.lazy(() => import("Pages/Fleet"));
const Trackers = React.lazy(() => import("Pages/Trackers"));

const Dashboard = React.lazy(() => import("Pages/Dashboard"));

const socket = socketIO(process.env.REACT_APP_API_URL!);

socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

const authProtectedRoutes = [
  { path: "/", exact: true, component: <Navigate to="/fleet-status" /> },
  { path: "/fleet-status", component: <FMS /> },
  { path: "/realtime-postioning/:equipmentId?", component: <RealTimePositioning socket={socket} /> },
  { path: "/benches", exact: true, component: <Benches /> },
  { path: "/materials", exact: true, component: <Materials /> },
  { path: "/admin-settings", exact: true, component: <AdminSettings /> },
  { path: "/users", exact: true, component: <Users /> },
  { path: "/shift-planner", exact: true, component: <Dispatch /> },
  { path: "/rom-management", exact: true, component: <ROMManagement /> },
  { path: "/waste-dump-management", exact: true, component: <WasteDumpManagement /> },
  { path: "/payload-optimisation", exact: true, component: <PayloadOptimsation /> },
  { path: "/fleet", exact: true, component: <Fleet /> },
  { path: "/trackers", exact: true, component: <Trackers /> },
  { path: "/shiftrosters", exact: true, component: <ShiftRoster /> },
  { path: "/gantt-scheduler", exact: true, component: <GanttScheduler /> },
  { path: "/dispatch-live", exact: true, component: <DispatchLive /> },
  { path: "/sic", exact: true, component: <ShortIntervalControl /> },
  { path: "/descrepencies", exact: true, component: <CarryBackDescrepencies /> },
  { path: '/rom-mill-targets', exact: true, component: <ROMMillTargets /> },
  { path: "/dashboard", exact: true, component: <Dashboard /> },
  { path: "/geofences", exact: true, component: <Geofences socket={socket} /> },
  { path: "/daily-production", exact: true, component: <DailyProductionDashboard /> },
  { path: "/digging-performance", exact: true, component: <DiggingPerformance /> },
  { path: "/trucking-performance", exact: true, component: <TruckingPerformance /> },
  { path: "/ore-tracker", exact: true, component: <OreTracker /> },
  { path: "/ore-spotter", exact: true, component: <OreSpotter /> },
  { path: "/map-geofence", exact: true, component: <MapGeofence /> },
  { path: "/fleet-timeline", exact: true, component: <FleetTimeline /> },
  { path: "/reports", exact: true, component: <Reports /> },
  { path: "/route-replay", exact: true, component: <Replay /> },
  { path: "/maintenance-status", exact: true, component: <MaintenanceStatus /> },
  { path: "/maintenance-scheduler", exact: true, component: <MaintenanceScheduler /> },
  { path: "/fuel-scheduler", exact: true, component: <FuelScheduler /> },
  { path: "/message-centre", exact: true, component: <MessageCentre /> },
  { path: "/blend-plans", exact: true, component: <BlendPlans /> },
  { path: "/trucking", exact: true, component: <TruckingDashboard /> },
  { path: "/digging", exact: true, component: <DiggingDashboard /> },
  { path: "/fuel-status", exact: true, component: <FuelStatusDashboard /> },
  { path: "/maintenance-fuel-status", exact: true, component: <FuelStatusDashboard /> },
  { path: "/material-inventory", exact: true, component: <MaterialInventory /> },
  { path: "/material-movement", exact: true, component: <MaterialMovement /> },
  { path: "/targets", exact: true, component: <Target /> },
  { path: "/reports/shift-report", exact: true, component: <ShiftReport /> },
  { path: "/reports/timeline-report", exact: true, component: <TimelineReport /> },
  { path: "/dig-blocks", exact: true, component: <DigBlockLayout /> },
  { path: "/kpi", exact: true, component: <ManagerKPI /> },
  { path: "/oil-analysis", exact: true, component: <OilAnalysis /> },
  { path: "/oil-analysis/:machineId", exact: true, component: <OilAnalysisReportPage/> },
  { path: "/oil-analysis/:machineId/:filterDate", exact: true, component: <OilAnalysisReportPage/> },
  { path: "/pre-starts", exact: true, component: <PreStarts /> },
  { path: "/pre-starts/:start/:end/:equipmentId", exact: true, component: <PreStartDetails /> }, 
  { path: "/haul-road-optimisation", exact: true, component: <HaulRoadOptimisation /> },
  { path: "/auto-routing", exact: true, component: <AutoRouting /> },
  { path: "/truck-load-optimisation", exact: true, component: <TruckLoadOptimisation /> },
  { path: "/digging-optimisation", exact: true, component: <DiggingOptimisation /> },
  { path: "/fuel-dashboard", exact: true, component: <FuelStatusDashboard /> },
  { path: "/operations-fuel-scheduler", exact: true, component: <FuelScheduler /> },
  { path: "/maintenance-fuel-scheduler", exact: true, component: <FuelScheduler /> },

  // { path: "/pit-view", exact: true, component: <PitView socket={socket} /> },
  { path: "/production-summary", exact: true, component: <ProductionSummary /> },
  { path: "/haul-truck-intelligence", exact: true, component: <HaulTruckIntelligence /> },
  { path: "/equipment-gantt", exact: true, component: <EquipmentGantt /> },
  { path: "/operator-report", exact: true, component: <OperatorReport /> },
  { path: "/telemetry-report", exact: true, component: <TelemetryReport /> },
  { path: "/telemetry-details", exact: true, component: <TelemetryDetails /> },
  { path: "/preshift-info", exact: true, component: <PreShiftInfo /> },
  { path: "/mock-data", exact: true, component: <Mock /> },

  // Production
  { path: "/rom-waste-summary", exact: true, component: <RomWasteSummary /> },
  // ThreeJS View
  { path: "//3d-pit-view", exact: true, component: <ThreeJS /> },
  // Underground Map View
  { path: "/underground-map", exact: true, component: <Underground /> },

  { path: "/menu-settings", exact: true, component: <MenuSettings /> },

  { path: "/roster-scheduler", exact: true, component: <RosterScheduler /> },

  { path: "/trucking-trip-summary", exact: true, component: <TruckingTripSummary /> },

  { path: "/network-monitoring", exact: true, component: <NetworkMonitoring /> },
];

const publicRoutes = [
  { path: "/login", component: <LoginPage /> },
  { path: "/logout", component: <Logout /> },
  { path: "/forgot-password", component: <ForgotPassword /> },
]
export { authProtectedRoutes, publicRoutes };
