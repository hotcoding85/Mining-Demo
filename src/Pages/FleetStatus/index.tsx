import React, { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import List from './List';
import { getAllFleet } from 'Slices/fleet/thunk';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import _, { cloneDeep, groupBy } from 'lodash';

const FMS = () => {
    document.title = "Dashboards";

    const dispatch = useDispatch<any>();

    const selectProperties = createSelector(
        (state: any) => state.Fleet,
        (fleetState) => ({
            fleetList: fleetState.data,
            loading: fleetState.loading
        })
    );

    const { fleetList, loading } = useSelector(selectProperties);
    const [isLoading, setLoading] = useState<boolean>(loading);

    useEffect(() => {
        dispatch(getAllFleet(1, 50)); // Dispatch action to fetch data on component mount
    }, [dispatch]);

    const getFleet = (type: string) => {
        // const groupedData: any = groupBy(data, 'fleet');
        const filteredData = (cloneDeep(fleetList)).filter((fl) => {
            if (fl.category === type) {
                if (fleetList[fl.name]) {
                    fl.data = fleetList[fl.name][0];
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
                    <List data={getFleet("EXCAVATOR")} />
                    <List data={getFleet("DUMP_TRUCK")} />
                    <List data={getFleet("LOADER")} />
                    <List data={getFleet("DOZER")} />
                    <List data={getFleet("DRILLER")} />
                    <List data={getFleet("WATER CART")} />
                    <List data={getFleet("LV")} />
                </Container>
            </div>
        </React.Fragment >
    );
}

export default FMS;