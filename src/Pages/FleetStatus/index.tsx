import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import FleetList from './FleetList';
import { getAllFleet, getTargetsByRoster, vehicleLatestState } from 'slices/thunk';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import _, { cloneDeep, groupBy } from 'lodash';
import { Segmented, Space } from 'antd';
import { fleetInfo } from 'slices/thunk';
import { getTarget, shiftTimings } from 'utils/common';
import { EventsState } from 'slices/events/reducer';

const FMS = () => {
    document.title = "Fleet Status | FMS Live";

    const dispatch = useDispatch<any>();

    const selectProperties = createSelector(
        (state: any) => state.Fleet,
        (fleetState) => ({
            fleetList: fleetState.data,
            loading: fleetState.loading
        })
    );

    const fleetInfoSelect = createSelector(
        (state: any) => state.Events,
        (info: any) => ({
            fleetUtilInfo: info.fleetUtilInfo
        })
    )

    const targetProperties = createSelector(
        (state: any) => state.Target,
        (targetState) => ({
            targets: targetState.data,
            loading: targetState.loading
        })
    );

    const vehicleLatestStateProperties = createSelector(
        (state: any) => state.Events,
        (info: EventsState) => ({
            groupVehicleState: groupBy(info.vehicleLatestState, 'truckId')
        })
    )

    const [filter, setFilter] = useState<string>('All Equipment');
    const { fleetList, loading } = useSelector(selectProperties);
    const { fleetUtilInfo } = useSelector(fleetInfoSelect);
    const { targets } = useSelector(targetProperties);
    const { groupVehicleState } = useSelector(vehicleLatestStateProperties);
    const [isLoading, setLoading] = useState<boolean>(loading);

    useEffect(() => {
        dispatch(getAllFleet(1, 50)); // Dispatch action to fetch data on component mount

        const shiftDetails = shiftTimings();
        dispatch(fleetInfo(`${shiftDetails.shiftDate}:${shiftDetails.shift}`));
        dispatch(getTargetsByRoster(`${shiftDetails.shiftDate}:${shiftDetails.shift}`));
        dispatch(vehicleLatestState())
    }, [dispatch]);

    const getLoadsAndTonnes = (id, category, capacity) => {

        let tonnes, loads;
        const targetInfo = targets?.filter((target) => { return target.vehicleId === id });
        if (targetInfo && targetInfo[0]) {
            loads = targetInfo[0].data && targetInfo[0].data.loads ? targetInfo[0].data.loads : 0;
            tonnes = targetInfo[0].data && targetInfo[0].data.loads ? targetInfo[0].data.loads : 0;
        }

        if (!loads || !tonnes) {
            const shiftDetails = shiftTimings();
            const target = getTarget(category, capacity, 'SHIFT', shiftDetails.shiftDate, shiftDetails.shift)
            loads = target.loads;
            tonnes = target.tonnes;
        }

        return { tonnes, loads };
    }

    const getFleet = (type: string) => {
        const groupData = groupBy(fleetUtilInfo, 'fleet');
        const filteredData = (cloneDeep(fleetList)).filter((fl) => {
            const { tonnes, loads } = getLoadsAndTonnes(fl.id, fl.category, fl.capacity);
            fl.plannedTonnes = tonnes;
            fl.plannedLoads = loads;
            if (fl.category === type) {
                if (groupData[fl.name]) {
                    fl.data = _.cloneDeep(groupData[fl.name][0]);
                }

                if (groupVehicleState[fl.id]) {
                    fl.latestState = groupVehicleState[fl.id][0].state;
                }

                return true;
            } else {
                return false;
            }
        });
        return _.sortBy(filteredData, 'name')
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Dashboards" breadcrumbItem="Fleet Status" />
                    <Row>
                        <Col md="12" className='mb-4 d-flex flex-row-reverse'>
                            <Space>
                                <Segmented className="customSegmentLabel customSegmentBackground" value={filter} onChange={(e) => setFilter(e)} options={['All Equipment', { label: 'Excavators', value: 'EXCAVATOR' }, { label: 'Trucks', value: 'DUMP_TRUCK' }, { label: 'Loaders', value: 'LOADER' }, { label: 'Drillers', value: 'DRILLER' }, { label: 'Dozers', value: 'DOZER' }]} />
                                {/* <Segmented className="customSegmentLabel customSegmentBackground" options={['BCM', 'Tonnes']} /> */}
                            </Space>
                        </Col>
                    </Row>
                    {
                        filter === 'All Equipment' && ["EXCAVATOR", "DUMP_TRUCK", "LOADER", "DOZER", "DRILLER", "WATER CART", "LV"].map((model: string) => (
                            <FleetList data={getFleet(model)} key={model} className="mb-3" />
                        ))
                    }
                    {
                        (filter != 'All Equipment') && (<FleetList className="mb-3" data={getFleet(filter)} key={"ALL_EQUIPMENT"} />)
                    }

                </Container>
            </div>
        </React.Fragment >
    );
}

export default FMS;