import React, { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import List from './List';
import { getAllFleet } from 'slices/fleet/thunk';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { cloneDeep, groupBy } from 'lodash';

const data = [
    {
        "stateInfo": [
            {
                "hours": 0.31,
                "state": "ACTIVE"
            }
        ],
        "payload": 67.36,
        "tripCount": 1,
        "fleet": "DT102",
        "model": "785-7",
        "id": "8a00-1045cfe86f86-6b16e9e3-36f7-4b49"
    },
    {
        "stateInfo": [
            {
                "hours": 0.35,
                "state": "ACTIVE"
            }
        ],
        "payload": 80.69,
        "tripCount": 1,
        "operator": "Support User",
        "fleet": "DT107",
        "model": "to8toi",
        "id": "1045c-8a00-6b16e9e3-36f7-4b49fe86f86"
    },
    {
        "stateInfo": [
            {
                "hours": 0.31,
                "state": "ACTIVE"
            }
        ],
        "payload": 66.45,
        "tripCount": 1,
        "operator": "76858 9yoyy",
        "fleet": "HT0002",
        "model": "YIYY",
        "id": "d3895483-a398-434e-bba3-8154d890a213"
    }
]

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
        dispatch(getAllFleet()); // Dispatch action to fetch data on component mount
    }, [dispatch]);

    const getFleet = (type: string) => {
        const groupedData: any = groupBy(data, 'fleet');
        return (cloneDeep(fleetList)).filter((fl) => {
            if (fl.category === type) {
                if (groupedData[fl.name]) {
                    fl.data = groupedData[fl.name][0];
                }
                return true;
            } else {
                return false;
            }
        });
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Dashboards" breadcrumbItem="FMS" />
                    {/* <List data={getFleet("EXCAVATOR")} /> */}
                    <List data={getFleet("DUMP_TRUCK")} />
                </Container>
            </div>
        </React.Fragment >
    );
}

export default FMS;