import { combineReducers } from "redux";
import { Reducer } from "@reduxjs/toolkit";

// Front
import LayoutReducer, { LayoutState } from "./layouts/reducer";
import ProfileReducer, { ProfileState } from "./profile/reducer";
import FleetReducer, { FleetState } from './fleet/reducer';
import UsersReducer, { UsersState } from './users/reducer';
import BenchesReducer, { BenchesState } from './benches/reducer';
import MaterialsReducer, { MaterialsState } from './materials/reducer';
import DevicesReducer, { DevicesState } from './devices/reducer';
import ShiftRosterReducer, { ShiftRosterState } from './shiftroster/reducer';
import GeoFenceReducer, { GeoFenceState } from './geofences/reducer';
import DispatchReducer, { DispatchState } from './dispatch/reducer';
import EventsReducer, { EventsState } from './events/reducer';

export interface RootState {
  Layout: Reducer<LayoutState> | undefined;
  Auth: Reducer<ProfileState> | undefined;
  Fleet: Reducer<FleetState> | undefined;
  Users: Reducer<UsersState> | undefined;
  Benches: Reducer<BenchesState> | undefined;
  Devices: Reducer<DevicesState> | undefined;
  Materials: Reducer<MaterialsState> | undefined;
  ShiftRosters: Reducer<ShiftRosterState> | undefined;
  GeoFence: Reducer<GeoFenceState> | undefined;
  Dispatch: Reducer<DispatchState> | undefined;
  Events: Reducer<DispatchState> | undefined;
  // Add other slices as needed
}

const rootReducer = combineReducers<Partial<RootState>>({
  Layout: LayoutReducer,
  Auth: ProfileReducer,
  Fleet: FleetReducer,
  Users: UsersReducer,
  Benches: BenchesReducer,
  Devices: DevicesReducer,
  Materials: MaterialsReducer,
  ShiftRosters: ShiftRosterReducer,
  GeoFence: GeoFenceReducer,
  Dispatch: DispatchReducer,
  Events: EventsReducer
});

export default rootReducer;