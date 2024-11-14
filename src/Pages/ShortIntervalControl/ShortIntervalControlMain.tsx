import React, { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import { createSelector } from 'reselect';
import { useDispatch, useSelector } from 'react-redux';
import { getShiftRosters, updateShiftRoster, getAllFleet, getAllUsers, addShiftRoster } from 'slices/thunk';
import _ from 'lodash';
import { Button, DatePicker, DatePickerProps, Segmented, Select, Space } from 'antd';
import { DeleteOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from "dayjs";
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import ConfirmModal from 'Components/Common/ConfirmModal';
import { shifts, shiftsInFormat } from 'utils/common';
import { pc1250, truckIcon } from 'assets/images/equipment';
import ExcavatorIcon from 'assets/icons/shovel.png';
import './style.scss';
import { FleetSelector, RosterSelector, UserSelector } from 'selectors';

function Draggable({ type, id, name, model, disabled, onDragStart }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className='draggable-btn'
            style={{
                transform: CSS.Translate.toString(transform),
                backgroundColor: disabled ? '#d0d0d0' : 'var(--bg-color)',
                cursor: disabled ? 'not-allowed' : 'move',
                opacity: disabled ? 0.5 : 1,
            }}
            onDragStart={disabled ? (e) => e.preventDefault() : onDragStart}
        >
            {type == "operators" ?
                (<><UserOutlined /><p className='m-0'>{name}</p><span>{model}</span></>)
                :
                (<><img src={truckIcon} alt='Truck' /><p className='m-0'>{name}<span>({model})</span></p></>)
            }
        </div>
    );
}

function DropTarget({ id, children }) {
    const { isOver, setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            style={{
                border: '1px solid #ccc',
                padding: '10px',
                minHeight: '100px',
                backgroundColor: isOver ? '#e0ffe0' : '#2a3042',
                marginBottom: '20px',
                borderStyle: 'dashed'
            }}
        >
            {children}
        </div>
    );
}

const ShortIntervalControlMain = () => {
    document.title = "SIC | FMS Live";

    const dispatch: any = useDispatch();
    const { rosters } = useSelector(RosterSelector);
    const { users } = useSelector(UserSelector);
    const { fleet } = useSelector(FleetSelector);

    const [operators, setOperators] = useState<any>([]);
    const [filteredOperators, setFilteredOperators] = useState<any>([]);
    const [trucks, setTrucks] = useState<any>([]);
    const [diggers, setDiggers] = useState<any>([]);

    const [startDate, setStartDate] = useState(new Date());
    const [shift, setShift] = useState<any>('DS');
    const [confirmModal, setConfirmModal] = useState<any>({ isOpen: false, info: {}, title: '' });

    const [searchParams, setSearchParams] = useSearchParams();

    const [selectedCrew, setSelectedCrew] = useState<any>();

    useEffect(() => {
        dispatch(getAllUsers(1, 100)); // Dispatch action to fetch users data on component mount
        dispatch(getAllFleet(1, 100)); // Dispatch action to fetch fleet data on component mount

        const queryParams = new URLSearchParams(window.location.search)
        setShift(queryParams.get("shift") ? queryParams.get("shift") : 'DS');
        setStartDate(queryParams.get("date") ? new Date(queryParams.get("date") || new Date()) : new Date());

        if (!queryParams.get("shift")) {
            var params: URLSearchParams = new URLSearchParams({ shift: 'DS', date: format(new Date(), 'yyyy-MM-dd') });
            setSearchParams(params);
        }

    }, [dispatch]);

    useEffect(() => {
        dispatch(getShiftRosters(format(startDate, 'yyyy-MM-dd') + ':' + shift)); // Dispatch action to fetch data on component mount

    }, [dispatch, shift, startDate]);

    useEffect(() => {
        setDiggers(fleet.filter(vehicle => vehicle.category === "EXCAVATOR"))
        setTrucks(fleet.filter(vehicle => vehicle.category === "DUMP_TRUCK"))
        // setTimeout(() => {
        updateUsedOperatorsAndTrucks();
        // }, 2000);
    }, [fleet]);

    useEffect(() => {
        setOperators(_.filter(users, (user) => { return user.role === 'OPERATOR' }));
        setFilteredOperators(_.filter(users, (user) => { return user.role === 'OPERATOR' }));
        // setTimeout(() => {
        updateUsedOperatorsAndTrucks();
        // }, 2000);
    }, [users]);

    useEffect(() => {
        // setTimeout(() => {
        updateUsedOperatorsAndTrucks();
        // }, 2000);
    }, [rosters]);

    const getOperators = (excavatorId: string) => {

        let shiftRoster = rosters.find(roster => roster.vehicleId === excavatorId);
        return shiftRoster && shiftRoster.operators ? shiftRoster.operators : [];
    };

    const getTrainers = (excavatorId: string) => {

        let shiftRoster = rosters.find(roster => roster.vehicleId === excavatorId);
        return shiftRoster && shiftRoster.trainers ? shiftRoster.trainers : [];
    };

    const getTrucks = (excavatorId: string) => {

        let shiftRoster = rosters?.find(roster => roster.vehicleId === excavatorId);
        return shiftRoster && shiftRoster.trucks ? shiftRoster.trucks : [];
    };


    const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
        if (date) {
            setStartDate(date.toDate());
            var params: URLSearchParams = new URLSearchParams({ shift: shift, date: format(date.toDate(), 'yyyy-MM-dd') });
            setSearchParams(params);
        }
    };

    const onShiftChange = (shiftInfo) => {
        // alert(JSON.stringify(shiftInfo))
        setShift(shiftInfo);
        var params: URLSearchParams = new URLSearchParams({ shift: shiftInfo, date: format(startDate, 'yyyy-MM-dd') });
        setSearchParams(params);
    }

    const getCrews = () => {

        let crews = operators.map(op => { return { value: op.crew, label: op.crew } });
        crews = _.uniqBy(crews, 'value');

        return crews;
    }

    const onCrewChange = (crew) => {

        setSelectedCrew((prevState) => {
            return crew;
        });
        setFilteredOperators(_.filter(users, (user) => { return user.role === 'OPERATOR' && user.crew === crew }));
        updateUsedOperatorsAndTrucks();
    }

    const updateUsedOperatorsAndTrucks = () => {

        var updatedPersons: Array<any> = [];
        var updatedTrucks: Array<any> = [];


        const rosterOperators = rosters?.map((roster) => {
            return roster.operators && roster.operators[0] ? roster.operators[0].id : undefined;
        });
        const rosterTrainers = rosters?.map((roster) => {
            return roster.trainers && roster.trainers[0] ? roster.trainers[0].id : undefined;
        });
        let rosterTrucks: any = rosters?.map((roster) => {
            return roster.trucks && roster.trucks[0] ? roster.trucks.map(truck => { return truck.id }) : undefined;
        });

        rosterTrucks = _.compact(_.flattenDeep(rosterTrucks));

        // Disable the person after being dropped
        updatedPersons = operators?.map(p =>
            (rosterOperators?.includes(p.id) || rosterTrainers?.includes(p.id)) ? { ...p, disabled: true } : { ...p, disabled: false }
        );

        // Disable the person after being dropped
        updatedTrucks = trucks.map(p =>
            rosterTrucks?.includes(p.id) ? { ...p, disabled: true } : { ...p, disabled: false }
        );

        if (updatedPersons && updatedPersons[0] && updatedPersons[0].id) {
            setOperators(updatedPersons)
            setSelectedCrew((prevState) => {
                const crew = prevState;
                if (crew) {
                    setFilteredOperators(_.filter(updatedPersons, (user) => { return user.crew === crew }));
                } else {
                    setFilteredOperators(updatedPersons);
                }
                return crew;
            });

        };
        if (updatedTrucks && updatedTrucks[0] && updatedTrucks[0].id) {
            setTrucks(updatedTrucks)
        };
    };

    // const removeOperator = (event) => {
    //     const deleteData = (event.currentTarget.id).split('::');
    //     let shiftRoster = _.cloneDeep(rosters.find(roster => roster.vehicleId === deleteData[0]));
    //     const rosterId = shiftRoster.id;
    //     delete shiftRoster._type;
    //     delete shiftRoster.createdAt;
    //     delete shiftRoster.updatedAt;
    //     delete shiftRoster.createdBy;
    //     delete shiftRoster.updatedBy;
    //     delete shiftRoster.id;
    //     delete shiftRoster._id;
    //     delete shiftRoster.vehicle;
    //     shiftRoster['operators'] = [];
    //     dispatch(updateShiftRoster(rosterId, shiftRoster));
    // }

    // const removeTrainer = (event) => {
    //     const deleteData = (event.currentTarget.id).split('::');
    //     let shiftRoster = _.cloneDeep(rosters.find(roster => roster.vehicleId === deleteData[0]));
    //     const rosterId = shiftRoster.id;
    //     delete shiftRoster._type;
    //     delete shiftRoster.createdAt;
    //     delete shiftRoster.updatedAt;
    //     delete shiftRoster.createdBy;
    //     delete shiftRoster.updatedBy;
    //     delete shiftRoster.id;
    //     delete shiftRoster._id;
    //     delete shiftRoster.vehicle;
    //     shiftRoster['trainers'] = [];
    //     dispatch(updateShiftRoster(rosterId, shiftRoster));
    // }

    const removeTruck = (event) => {
        const deleteData = (event.currentTarget.id).split('::');
        let shiftRoster = _.cloneDeep(rosters.find(roster => roster.vehicleId === deleteData[0]));
        let trucks = _.filter(shiftRoster?.trucks, (truck) => { return truck.id != deleteData[1] })
        const rosterId = shiftRoster?.id;
        delete shiftRoster?._type;
        delete shiftRoster?.createdAt;
        delete shiftRoster?.updatedAt;
        delete shiftRoster?.createdBy;
        delete shiftRoster?.updatedBy;
        delete shiftRoster?.id;
        delete shiftRoster?._id;
        delete shiftRoster?.vehicle;
        if (shiftRoster) {
            shiftRoster['trucks'] = trucks;
        }
        if (rosterId) {
            dispatch(updateShiftRoster(rosterId, shiftRoster));
        }
    }
    const handleDragStart = (event: DragEndEvent) => {
        const { active } = event;
        const activeId = active.id as string;

        const person = operators.find(p => p.id === activeId);
        const truck = trucks.find(p => p.id === activeId);
        if ((person && person.disabled) || (truck && truck.disabled)) {

        }
    }
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const activeId = active.id as string;
            const overId = over.id as string;

            // Check if the person is already dropped
            const person = operators.find(p => p.id === activeId);
            const truck = trucks.find(p => p.id === activeId);

            const userData = overId.split('::');

            let shiftRoster = _.cloneDeep(rosters.find(roster => roster.vehicleId === userData[0]));
            if (person && !person.disabled) {
                if (shiftRoster && userData && userData[1] && userData[1] === 'trainer') {
                    if (shiftRoster.trainers && shiftRoster.trainers[0]) {
                        setConfirmModal((prevState) => {
                            return {
                                ...prevState,
                                info: { active, over },
                                isOpen: true,
                                title: 'Trainer is already assigned. Do you want to replace it?'
                            }
                        })
                    } else {
                        processDroppedData(active, over);
                    }
                } else if ((!userData[1] || userData[1] === 'operator')) {
                    if (shiftRoster && shiftRoster.operators && shiftRoster.operators[0]) {
                        setConfirmModal((prevState) => {
                            return {
                                ...prevState,
                                info: { active, over },
                                isOpen: true,
                                title: 'Operator is already assigned. Do you want to replace it?'
                            }
                        })
                    } else {
                        processDroppedData(active, over);
                    }
                }
            }

            if (truck && !truck.disabled) {
                processDroppedData(active, over);
            }
        }
    };

    const handleReplaceDrag = () => {
        const { active, over } = confirmModal.info;
        processDroppedData(active, over)
    }

    const processDroppedData = (active, over) => {
        const activeId = active.id as string;
        const overId = over.id as string;
        const person = operators.find(p => p.id === activeId);
        const truck = trucks.find(p => p.id === activeId);
        // Add person to the new excavator 
        const userData = overId.split('::');

        if (person && !person.disabled) {
            userData.push('operator');

            let userType;

            if (userData[1] === 'operator') {
                userType = 'operators';
            } else if (userData[1] === 'trainer') {
                userType = 'trainers';
            }

            // Disable the person after being dropped
            const updatedPersons = operators.map(p =>
                p.id === activeId ? { ...p, disabled: true } : p
            );

            let excavator = fleet.find(key => key.id === userData[0]);

            if (excavator) {

                // Update the person in shiftRoster
                let shiftRoster = _.cloneDeep(rosters.find(roster => roster.vehicleId === userData[0]));
                // let updatedShiftRosters;

                if (shiftRoster && shiftRoster.id) {

                    // updatedShiftRosters = shiftrosters.map(roster =>
                    //     roster.vehicleId === userData[0] ? roster[userType] = [person] : roster
                    // );
                    const rosterId = shiftRoster.id;
                    delete shiftRoster._type;
                    delete shiftRoster.createdAt;
                    delete shiftRoster.updatedAt;
                    delete shiftRoster.createdBy;
                    delete shiftRoster.updatedBy;
                    delete shiftRoster.id;
                    delete shiftRoster._id;
                    delete shiftRoster.vehicle;
                    shiftRoster[userType] = [person];
                    dispatch(updateShiftRoster(rosterId, shiftRoster));
                } else {
                    var newShiftRoster: any = {};
                    newShiftRoster[userType] = [person];
                    newShiftRoster.vehicleId = userData[0];
                    newShiftRoster.roster = format(startDate, 'yyyy-MM-dd') + ':' + shift
                    dispatch(addShiftRoster(newShiftRoster));
                }

                // setS(updatedShiftRosters);
                setOperators(updatedPersons);
            }

        }

        if (truck && !truck.disabled) {
            userData.push('truck');
            if (userData[1] === 'truck') {

                // Disable the truck after being dropped
                const updatedTrucks = trucks.map(p =>
                    p.id === activeId ? { ...p, disabled: true } : p
                );

                let excavator = fleet.find(key => key.id === userData[0]);
                if (excavator) {
                    // Update the person in shiftRoster
                    let shiftRoster = _.cloneDeep(rosters.find(roster => roster.vehicleId === userData[0]));
                    // let updatedShiftRosters;

                    if (shiftRoster && shiftRoster.id) {

                        // updatedShiftRosters = shiftrosters.map(roster =>
                        //     roster.vehicleId === userData[0] ? roster['trucks'] = [truck] : roster
                        // );
                        const rosterId = shiftRoster.id;
                        delete shiftRoster._type;
                        delete shiftRoster.createdAt;
                        delete shiftRoster.updatedAt;
                        delete shiftRoster.createdBy;
                        delete shiftRoster.updatedBy;
                        delete shiftRoster.id;
                        delete shiftRoster._id;
                        delete shiftRoster.vehicle;
                        if (!shiftRoster['trucks']) { shiftRoster['trucks'] = [] }
                        shiftRoster['trucks'].push(truck);
                        dispatch(updateShiftRoster(rosterId, shiftRoster));
                    } else {
                        var newShiftRoster: any = {};
                        newShiftRoster['trucks'] = [truck];
                        newShiftRoster.vehicleId = userData[0];
                        newShiftRoster.roster = format(startDate, 'yyyy-MM-dd') + ':' + shift
                        dispatch(addShiftRoster(newShiftRoster));
                    }

                    //setShiftRosters(updatedShiftRosters);
                    setTrucks(updatedTrucks);
                }
            }
        }
    }

    return (
        <>
            <DndContext onDragEnd={handleDragEnd}>
                <Row className='d-flex' style={{ justifyContent: 'space-evenly' }}>
                    <Card className='col-9'>
                        <CardBody>
                            <div>
                                <img src={ExcavatorIcon} width={32} />
                                <span style={{ fontSize: '16px', fontWeight: '500' }}>Excavators</span>
                            </div>
                            <div style={{ marginTop: '10px', overflow: 'scroll', height: '100vh' }}>
                                {diggers.map(excavator => (
                                    <DropTarget key={excavator.id} id={excavator.id}>
                                        <span style={{ fontSize: '22px', fontWeight: '500' }}>{excavator.name}<span style={{ fontSize: '16px' }}>({excavator.model})</span></span>
                                        <div style={{
                                            width: '100%', backgroundColor: '', padding: '10px',
                                            margin: '4px',
                                            // border: '1px solid #ddd',
                                            borderRadius: '4px',
                                        }}>
                                            <Row style={{ justifyContent: 'space-around' }}>
                                                <Col xs={11}>
                                                    <span style={{ fontWeight: '500' }}>Assigned Trucks</span>
                                                    <DropTarget key={excavator.id} id={excavator.id + '::truck'}>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                                            {getTrucks(excavator.id).map(truck => (
                                                                <div style={{ justifyContent: 'space-between', padding: '10px', width: 'fit-content', }}>
                                                                    <Card style={{ marginBottom: '0px', border: '1px solid var(--dark-text-color)' }}>
                                                                        <CardBody style={{ padding: '8px 8px' }}>
                                                                            <img width={36} src={truckIcon} />
                                                                            <span style={{ fontSize: '18px' }}>{truck.name}</span>
                                                                            <span style={{ fontSize: '10px', marginLeft: '6px' }}>({truck.model})</span>
                                                                            <Button id={excavator.id + '::' + truck.id} style={{ marginLeft: '10px' }} shape="circle" icon={<DeleteOutlined />} onClick={removeTruck} />
                                                                        </CardBody>
                                                                    </Card>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </DropTarget>
                                                </Col>
                                            </Row>
                                        </div>
                                    </DropTarget>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                    <Card className='col-2 trucks-draggable'>
                        <CardBody>
                            <span className='heading'>Trucks</span>
                            <div className='mt-3'>
                                {trucks.map(truck => (
                                    < Draggable
                                        type="trucks"
                                        key={truck.id}
                                        id={truck.id}
                                        name={truck.name}
                                        model={truck.model}
                                        disabled={truck.disabled}
                                        onDragStart={() => { }}
                                    />
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </Row>
            </DndContext>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                setIsOpen={setConfirmModal}
                title={'Alert'}
                text={confirmModal.title}
                onOK={handleReplaceDrag}
                onCancel={() => { }}
            />
        </>
    );
}
export default ShortIntervalControlMain;