import { Navigate } from "react-router-dom"
import FMS from "../Pages/FleetStatus";

// Auth
import LoginPage from "Pages/Authentication/Login";
import Logout from "Pages/Authentication/Logout";
import ForgotPassword from "Pages/Authentication/ForgotPassword";
import Materials from "Pages/Materials";
import Benches from "Pages/Benches";
import Users from "Pages/Users";
import Fleet from "Pages/Fleet";
import Trackers from "Pages/Trackers";
import Map from "Pages/Map";
import Dispatch from "Pages/Dispatch";
import Dashboard from "Pages/Dashboard";
import MaterialInventory from "Pages/MaterialInventory";
import Geofences from "Pages/Geofences";
import DiggingPerformance from "Pages/DiggingPerformance";
import OreTracker from "Pages/OreTracker";
import ShiftRoster from "Pages/ShiftRoster";
import MapGeofence from "Pages/MapGeofences";
import FleetTimeline from "Pages/FleetTimeline";
import Target from "Pages/Targets";
import OperatorReport from "Pages/OperatorReport";
import TelemetryReport from "Pages/TelemetryReport";

import socketIO from 'socket.io-client';
import Reports from "Pages/Reports";
import Replay from "Pages/Replay";
import MaintenanceStatus from "Pages/MaintenanceStatus";
import MaterialMovement from "Pages/MaterialMovement";
import ShiftReport from "Pages/Reports/ShiftReport";
import DigBlockLayout from "Pages/DigBlockLayout";
import DailyProductionDashboard from "Pages/Daily Production";
import TruckingPerformance from "Pages/Trucking";
import FuelStatusDashboard from "Pages/Fuel Status";
import ManagerKPI from "Pages/ManagerKPI";
import EquipmentGantt from "Pages/Equipment Gantt";
import MaintenanceScheduler from "Pages/MaintenanceScheduler";
import OilAnalysis from "Pages/OilAnalysis";
import PreStarts from "Pages/PreStarts";
import FleetOptimisation from "Pages/FleetOptimisation";
import AutoRouting from "Pages/AutoRouting";
import HaulRoadIntelligence from "Pages/HaulRoad";
import PitView from "Pages/PitView";
import ProductionSummary from "Pages/ProductionSummary";
import ShortIntervalControl from "Pages/ShortIntervalControl";
import FuelScheduler from "Pages/FuelScheduler";
import MessageCentre from "Pages/MessageCentre";
import TruckingDashboard from "Pages/TruckingDashboard";
import DiggingDashboard from "Pages/DiggingDashboard";

const socket = socketIO(process.env.REACT_APP_API_URL!);

socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

const authProtectedRoutes = [
  { path: "/", exact: true, component: <Navigate to="/fleet-status" /> },
  { path: "/fleet-status", component: <FMS /> },
  { path: "/realtime-postioning", component: <Map socket={socket} /> },
  { path: "/benches", exact: true, component: <Benches /> },
  { path: "/materials", exact: true, component: <Materials /> },
  { path: "/users", exact: true, component: <Users /> },
  { path: "/fleet", exact: true, component: <Fleet /> },
  { path: "/trackers", exact: true, component: <Trackers /> },
  { path: "/shiftrosters", exact: true, component: <ShiftRoster /> },
  { path: "/shift-planner", exact: true, component: <Dispatch /> },
  { path: "/dispatch-live", exact: true, component: <Dispatch /> },
  { path: "/sic", exact: true, component: <ShortIntervalControl /> },
  { path: "/dashboard", exact: true, component: <Dashboard /> },
  { path: "/geofences", exact: true, component: <Geofences socket={socket} /> },
  { path: "/daily-production", exact: true, component: <DailyProductionDashboard /> },
  { path: "/digging-performance", exact: true, component: <DiggingPerformance /> },
  { path: "/trucking-performance", exact: true, component: <TruckingPerformance /> },
  { path: "/ore-tracker", exact: true, component: <OreTracker /> },
  { path: "/map-geofence", exact: true, component: <MapGeofence /> },
  { path: "/fleet-timeline", exact: true, component: <FleetTimeline /> },
  { path: "/reports", exact: true, component: <Reports /> },
  { path: "/route-replay", exact: true, component: <Replay /> },
  { path: "/maintenance-status", exact: true, component: <MaintenanceStatus /> },
  { path: "/maintenance-scheduler", exact: true, component: <MaintenanceScheduler /> },
  { path: "/fuel-scheduler", exact: true, component: <FuelScheduler /> },
  { path: "/message-centre", exact: true, component: <MessageCentre /> },
  { path: "/trucking", exact: true, component: <TruckingDashboard /> },
  { path: "/digging", exact: true, component: <DiggingDashboard /> },
  { path: "/fuel-status", exact: true, component: <FuelStatusDashboard /> },
  { path: "/maintenance-fuel-status", exact: true, component: <FuelStatusDashboard /> },
  { path: "/material-inventory", exact: true, component: <MaterialInventory /> },
  { path: "/material-movement", exact: true, component: <MaterialMovement /> },
  { path: "/targets", exact: true, component: <Target /> },
  { path: "/reports/shift-report", exact: true, component: <ShiftReport /> },
  { path: "/dig-blocks", exact: true, component: <DigBlockLayout /> },
  { path: "/kpi", exact: true, component: <ManagerKPI /> },
  { path: "/oil-analysis", exact: true, component: <OilAnalysis /> },
  { path: "/pre-starts", exact: true, component: <PreStarts /> },
  { path: "/fleet-optimisation", exact: true, component: <FleetOptimisation /> },
  { path: "/auto-routing", exact: true, component: <AutoRouting /> },
  { path: "/pit-view", exact: true, component: <PitView /> },
  { path: "/production-summary", exact: true, component: <ProductionSummary /> },
  { path: "/haul-road-intelligence", exact: true, component: <HaulRoadIntelligence /> },
  { path: "/equipment-gantt", exact: true, component: <EquipmentGantt /> },
  { path: "/operator-report", exact: true, component: <OperatorReport /> },
  { path: "/telemetry-report", exact: true, component: <TelemetryReport /> }
];

const publicRoutes = [
  { path: "/login", component: <LoginPage /> },
  { path: "/logout", component: <Logout /> },
  { path: "/forgot-password", component: <ForgotPassword /> },
]
export { authProtectedRoutes, publicRoutes };
