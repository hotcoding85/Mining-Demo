import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import List from './List';
import { getAllFleet } from 'slices/fleet/thunk';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import _, { cloneDeep, groupBy } from 'lodash';
import { Radio, Segmented } from 'antd';

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

    const [filter, setFilter] = useState<string>('All Equipment');
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
                    <Row>
                        <Col md="12" className='mb-4 d-flex flex-row-reverse'>
                            <Segmented className="customSegmentLabel customSegmentBackground" value={filter} onChange={(e) => setFilter(e)} options={['All Equipment', { label: 'Excavators', value: 'EXCAVATOR' }, { label: 'Trucks', value: 'DUMP_TRUCK' }, { label: 'Loaders', value: 'LOADER' }, { label: 'Drillers', value: 'DRILLER' }, { label: 'Dozers', value: 'DOZER' }]}/>
                        </Col>
                    </Row>
                    {
                        (filter == 'All Equipment') && (
                            <>
                                <List data={getFleet("EXCAVATOR")} />
                                <List data={getFleet("DUMP_TRUCK")} />
                                <List data={getFleet("LOADER")} />
                                <List data={getFleet("DOZER")} />
                                <List data={getFleet("DRILLER")} />
                                <List data={getFleet("WATER CART")} />
                                <List data={getFleet("LV")} />
                            </>
                        )

                    }
                    {
                        (filter != 'All Equipment') && (<List data={getFleet(filter)} />)
                    }

                </Container>
            </div>
        </React.Fragment >
    );
}

export default FMS;