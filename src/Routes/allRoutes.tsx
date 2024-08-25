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
import DailyProduction from "../Pages/DailyProduction";
import DiggingPerformance from "Pages/DiggingPerformance";
import Telemetry from "Pages/Telemetry";
import OreTracker from "Pages/OreTracker";
import ShiftRoster from "Pages/ShiftRoster";
import MapGeofence from "Pages/MapGeofences";
import FleetTimeline from "Pages/FleetTimeline";
import Target from "Pages/Targets";

import socketIO from 'socket.io-client';
import Reports from "Pages/Reports";
import Replay from "Pages/Replay";
import Maintenance from "Pages/Maintenance";
import MaterialMovement from "Pages/MaterialMovement";
import ShiftReport from "Pages/Reports/ShiftReport";

const socket = socketIO(process.env.REACT_APP_API_URL!);

socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

const authProtectedRoutes = [
  { path: "/", exact: true, component: <Navigate to="/fleet-status" /> },
  { path: "/fleet-status", component: <FMS /> },
  { path: "/map", component: <Map socket={socket} /> },
  { path: "/benches", exact: true, component: <Benches /> },
  { path: "/materials", exact: true, component: <Materials /> },
  { path: "/users", exact: true, component: <Users /> },
  { path: "/fleet", exact: true, component: <Fleet /> },
  { path: "/trackers", exact: true, component: <Trackers /> },
  { path: "/shiftrosters", exact: true, component: <ShiftRoster /> },
  { path: "/dispatch", exact: true, component: <Dispatch /> },
  { path: "/dashboard", exact: true, component: <Dashboard /> },
  { path: "/geofences", exact: true, component: <Geofences socket={socket} /> },
  { path: "/daily-production", exact: true, component: <DailyProduction /> },
  { path: "/digging-performance", exact: true, component: <DiggingPerformance /> },
  { path: "/telemetry", exact: true, component: <Telemetry /> },
  { path: "/ore-tracker", exact: true, component: <OreTracker /> },
  { path: "/map-geofence", exact: true, component: <MapGeofence /> },
  { path: "/fleet-timeline", exact: true, component: <FleetTimeline /> },
  { path: "/reports", exact: true, component: <Reports /> },
  { path: "/route-replay", exact: true, component: <Replay /> },
  { path: "/maintenance", exact: true, component: <Maintenance /> },
  { path: "/material-inventory", exact: true, component: <MaterialInventory /> },
  { path: "/material-movement", exact: true, component: <MaterialMovement /> },
  { path: "/targets", exact: true, component: <Target /> },
  {
    path: "/reports/shift-report",
    exact: true,
    component: <ShiftReport />
  }
];

const publicRoutes = [
  { path: "/login", component: <LoginPage /> },
  { path: "/logout", component: <Logout /> },
  { path: "/forgot-password", component: <ForgotPassword /> },
]
export { authProtectedRoutes, publicRoutes };
