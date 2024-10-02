import { createSelector } from "reselect";
import { RootState } from "slices";
import { BenchesState } from "slices/benches/reducer";
import { EventsState } from "slices/events/reducer";
import { FleetState } from "slices/fleet/reducer";
import { GeoFenceState } from "slices/geofences/reducer";
import { LayoutState } from "slices/layouts/reducer";
import { MaterialsState } from "slices/materials/reducer";
import { ProfileState } from "slices/profile/reducer";
import { ShiftRosterState } from "slices/shiftroster/reducer";
import { VehicleStateReasonState } from "slices/stateReasons/reducer";
import { TargetState } from "slices/target/reducer";
import { TrackersState } from "slices/trackers/reducer";
import { UsersState } from "slices/users/reducer";
import { VehicleRoutesState } from "slices/vehicleRoutes/reducer";

export const LayoutSelector = createSelector(
    (state: RootState) => state.Layout,
    (layoutState: LayoutState) => ({
        isSideMenuOpen: layoutState.sideMenuOpen,
        units: layoutState.units,
        layoutModeType: layoutState.layoutModeTypes,
        layoutTypes: layoutState.layoutTypes
    })
)

export const ProfileSelector = createSelector(
    (state: RootState) => state.Auth,
    (profileState: ProfileState) => ({
        user: profileState.user,
        token: profileState.token,
        error: profileState.error,
        errorMsg: profileState.errorMsg,
        isUserLogout: profileState.isUserLogout,
    })
)

export const FleetSelector = createSelector(
    (state: RootState) => state.Fleet,
    (fleetState: FleetState) => ({
        fleet: fleetState.data,
        loading: fleetState.loading,
        totalFleet: fleetState.total
    })
)

export const UserSelector = createSelector(
    (state: RootState) => state.Users,
    (usersState: UsersState) => ({
        users: usersState.data,
        loading: usersState.loading,
        totalUsers: usersState.total
    })
)

export const BenchSelector = createSelector(
    (state: RootState) => state.Benches,
    (benchesState: BenchesState) => ({
        benches: benchesState.data,
        loading: benchesState.loading,
        totalBenches: benchesState.total
    })
)

export const TrackerSelector = createSelector(
    (state: RootState) => state.Trackers,
    (trackersState: TrackersState) => ({
        trackers: trackersState.data,
        loading: trackersState.loading,
        totalTrackers: trackersState.total
    })
)

export const MaterialSelector = createSelector(
    (state: RootState) => state.Materials,
    (materialsState: MaterialsState) => ({
        materials: materialsState.data,
        loading: materialsState.loading,
        totalMaterials: materialsState.total
    })
)

export const RosterSelector = createSelector(
    (state: RootState) => state.ShiftRosters,
    (rostersState: ShiftRosterState) => ({
        rosters: rostersState.data,
        loading: rostersState.loading,
        totalRosters: rostersState.total
    })
)

export const FenceSelector = createSelector(
    (state: RootState) => state.GeoFences,
    (fencesState: GeoFenceState) => ({
        fences: fencesState.data,
        loading: fencesState.loading,
        totalFences: fencesState.total
    })
)

export const EventSelector = createSelector(
    (state: RootState) => state.Events,
    (eventsState: EventsState) => ({
        events: eventsState.data,
        loading: eventsState.loading,
        totalEvents: eventsState.total,
        fleetUtilInfo: eventsState.fleetUtilInfo,
        latestStates: eventsState.vehicleLatestState
    })
)

export const TargetSelector = createSelector(
    (state: RootState) => state.Targets,
    (targetsState: TargetState) => ({
        targets: targetsState.data,
        loading: targetsState.loading,
        totalTargets: targetsState.total
    })
)

export const VehicleRouteSelector = createSelector(
    (state: RootState) => state.VehicleRoutes,
    (vehicleRoutesState: VehicleRoutesState) => ({
        vehicleRoutes: vehicleRoutesState.data,
        loading: vehicleRoutesState.loading,
        totalRoutes: vehicleRoutesState.total
    })
)

export const StateReasonsSelector = createSelector(
    (state: RootState) => state.VehicleStateReasons,
    (stateReasonsState: VehicleStateReasonState) => ({
        reasons: stateReasonsState.data,
        loading: stateReasonsState.loading,
        totalReasons: stateReasonsState.total
    })
)

export const dispatchState = (state: RootState) => state.Dispatch;