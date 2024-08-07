import { Navigate } from "react-router-dom"
import FMS from "../Pages/FMS";

// Auth
import LoginPage from "Pages/Authentication/Login";
import Logout from "Pages/Authentication/Logout";
import ForgotPassword from "Pages/Authentication/ForgotPassword";
import Materials from "Pages/Materials";
import Benches from "Pages/Benches";
import Users from "Pages/Users";
import Fleet from "Pages/Fleet";
import Devices from "Pages/Devices";
import Map from "Pages/Map";
import Dispatch from "Pages/Dispatch";
import Dashboard from "Pages/Dashboard";
import MaterialStock from "Pages/MaterialStock";
import Geofences from "Pages/Geofences";
import FMSLive from "../Pages/FMSLive";
import TelemetryLive from "Pages/TelemetryLive";
import Telemetry from "Pages/Telemetry";
import OreTracker from "Pages/OreTracker";
import ShiftRoster from "Pages/ShiftRoster";
import MapGeofence from "Pages/MapGeofences";
import FleetTimeline from "Pages/FleetTimeline";

import socketIO from 'socket.io-client';
const socket = socketIO("http://localhost:3000");

socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});

const authProtectedRoutes = [
  { path: "/", exact: true, component: <Navigate to="/fms" /> },
  { path: "/fms", component: <FMS /> },
  { path: "/map", component: <Map socket={socket} /> },
  { path: "/benches", exact: true, component: <Benches /> },
  { path: "/materials", exact: true, component: <Materials /> },
  { path: "/users", exact: true, component: <Users /> },
  { path: "/fleet", exact: true, component: <Fleet /> },
  { path: "/trackers", exact: true, component: <Devices /> },
  { path: "/shiftrosters", exact: true, component: <ShiftRoster /> },
  { path: "/dispatch", exact: true, component: <Dispatch /> },
  { path: "/dashboard", exact: true, component: <Dashboard /> },
  { path: "/stock", exact: true, component: <MaterialStock /> },
  { path: "/geofences", exact: true, component: <Geofences socket={socket} /> },
  { path: "/fms-live", exact: true, component: <FMSLive /> },
  { path: "/telemetry-live", exact: true, component: <TelemetryLive /> },
  { path: "/telemetry", exact: true, component: <Telemetry /> },
  { path: "/ore-tracker", exact: true, component: <OreTracker /> },
  { path: "/map-geofence", exact: true, component: <MapGeofence /> },
  { path: "/fleet-timeline", exact: true, component: <FleetTimeline /> }
];

const publicRoutes = [
  { path: "/login", component: <LoginPage /> },
  { path: "/logout", component: <Logout /> },
  { path: "/forgot-password", component: <ForgotPassword /> },
]
export { authProtectedRoutes, publicRoutes };
