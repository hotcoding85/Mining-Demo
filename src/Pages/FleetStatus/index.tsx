import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { getAllFleet, getShiftRosters, getTargetsByRoster, vehicleLatestState } from 'slices/thunk';
import { useDispatch, useSelector } from 'react-redux';
import _, { cloneDeep, groupBy } from 'lodash';
import { Segmented, Space } from 'antd';
import { fleetInfo } from 'slices/thunk';
import { getTarget, shiftTimings } from 'utils/common';
import { EventSelector, FleetSelector, LayoutSelector, RosterSelector, TargetSelector } from 'selectors';
import Item from './Item';
import './index.scss';
import { ShiftRoster } from 'slices/shiftroster/reducer';

const FMS = () => {
    document.title = "Fleet Status | FMS Live";

    const dispatch = useDispatch<any>();

    const [filter, setFilter] = useState<string>('All Equipment');

    const { fleet } = useSelector(FleetSelector);
    const { units } = useSelector(LayoutSelector);
    const { fleetUtilInfo } = useSelector(EventSelector);
    const { targets } = useSelector(TargetSelector);
    const { rosters } = useSelector(RosterSelector);

    useEffect(() => {
        dispatch(getAllFleet(1, 50)); // Dispatch action to fetch data on component mount

        const shiftDetails = shiftTimings();
        dispatch(fleetInfo(`${shiftDetails.shiftDate}:${shiftDetails.shift}`));
        dispatch(getTargetsByRoster(`${shiftDetails.shiftDate}:${shiftDetails.shift}`));
        dispatch(vehicleLatestState())
        dispatch(getShiftRosters(`${shiftDetails.shiftDate}:${shiftDetails.shift}`)); 
    }, [dispatch]);

    const getLoadsAndTonnes = (id, category, capacity) => {
        let tonnes, loads;
        const targetInfo = targets?.filter((target) => { return target.vehicleId === id });
        if (targetInfo && targetInfo[0]) {
            loads = targetInfo[0].data && targetInfo[0].data.loads ? targetInfo[0].data.loads : 0;
            tonnes = targetInfo[0].data && targetInfo[0].data.tonnes ? targetInfo[0].data.tonnes : 0;
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
        const filteredData = (cloneDeep(fleet)).filter((fl) => {
            const { tonnes, loads } = getLoadsAndTonnes(fl.id, fl.category, fl.capacity);
            fl.plannedTonnes = tonnes;
            fl.plannedLoads = loads;
            if (fl.category === type) {
                if (groupData[fl.name]) {
                    fl.data = _.cloneDeep(groupData[fl.name][0]);
                }
                return true;
            } else {
                return false;
            }
        });
        filteredData.map(vehicle => {
            const roster = rosters.filter(i => i.vehicleId === vehicle.id)
            if(roster != undefined && roster.length > 0) {
                const operator = roster[0].operators[0]
                vehicle['operator'] = operator
                // console.log('operator name', operator.firstName, operator.lastName)
            }
        })
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
                            </Space>
                        </Col>
                    </Row>
                    <Row>
                        {
                            filter === 'All Equipment' && ["EXCAVATOR", "DUMP_TRUCK", "LOADER", "DOZER", "DRILLER", "WATER CART", "LV"].map((model: string) => (
                                <div className='status-cards-container'>
                                    {getFleet(model).map((item: any, key: number) => (
                                        <Item data={item} units={units} key={key} />
                                    ))}
                                </div>
                            ))
                        }
                        {
                            filter != 'All Equipment' && (
                                <div className='status-cards-container'>
                                    {getFleet(filter).map((item: any, key: number) => (
                                        <Item data={item} units={units} key={key} />
                                    ))}
                                </div>
                            )
                        }
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    );
}

export default FMS;