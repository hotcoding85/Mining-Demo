import { combineReducers } from "redux";

// Front
import LayoutReducer, { LayoutState } from "./layouts/reducer";
import ProfileReducer, { ProfileState } from "./profile/reducer";
import FleetReducer, { FleetState } from './fleet/reducer';
import UsersReducer, { UsersState } from './users/reducer';
import BenchesReducer, { BenchesState } from './benches/reducer';
import MaterialsReducer, { MaterialsState } from './materials/reducer';
import TrackersReducer, { TrackersState } from './trackers/reducer';
import ShiftRosterReducer, { ShiftRosterState } from './shiftroster/reducer';
import GeoFenceReducer, { GeoFenceState } from './geofences/reducer';
import DispatchReducer, { DispatchState } from './dispatch/reducer';
import EventsReducer, { EventsState } from './events/reducer';
import TargetReducer, { TargetState } from './target/reducer';
import VehicleRoutesReducer, { VehicleRoutesState } from "./vehicleRoutes/reducer";
import VehicleStateReasonReducer, { VehicleStateReasonState } from "./stateReasons/reducer";
import MenuSettingReducer, { MenuSettingState } from "./menuSettings/reducer";
import TruckAllocationReducer, { TruckAllocationState } from "./truckAllocation/reducer";
import EventMetaReducer, { EventMetaState } from "./eventMeta/reducer";

export interface RootState {
  Layout: LayoutState;
  Auth: ProfileState;
  Fleet: FleetState;
  Users: UsersState;
  Benches: BenchesState;
  Trackers: TrackersState;
  Materials: MaterialsState;
  ShiftRosters: ShiftRosterState;
  GeoFences: GeoFenceState;
  Dispatch: DispatchState;
  Events: EventsState;
  Targets: TargetState;
  VehicleRoutes: VehicleRoutesState;
  VehicleStateReasons: VehicleStateReasonState;
  MenuSettings: MenuSettingState;
  TruckAllocations: TruckAllocationState;
  EventMetas: EventMetaState;
  // Add other slices as needed
}

const rootReducer = combineReducers({
  Layout: LayoutReducer,
  Auth: ProfileReducer,
  Fleet: FleetReducer,
  Users: UsersReducer,
  Benches: BenchesReducer,
  Trackers: TrackersReducer,
  Materials: MaterialsReducer,
  ShiftRosters: ShiftRosterReducer,
  GeoFences: GeoFenceReducer,
  Dispatch: DispatchReducer,
  Events: EventsReducer,
  Targets: TargetReducer,
  VehicleRoutes: VehicleRoutesReducer,
  VehicleStateReasons: VehicleStateReasonReducer,
  MenuSettings: MenuSettingReducer,
  TruckAllocation: TruckAllocationReducer,
  EventMeta: EventMetaReducer
});

export default rootReducer;

export type RootReducer = ReturnType<typeof rootReducer>;