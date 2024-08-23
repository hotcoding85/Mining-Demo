import React, { useEffect, useState } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { Col, Container, Row } from 'reactstrap';
import { createSelector } from 'reselect';
import { useDispatch, useSelector } from 'react-redux';
import { getShiftRosters, updateShiftRoster, getAllFleet, getAllUsers, addShiftRoster } from 'slices/thunk';
import _ from 'lodash';
import { Button, DatePicker, DatePickerProps, Segmented, Space } from 'antd';
import dayjs from "dayjs";
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';

function DraggablePerson({ id, name, disabled, onDragStart }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                transform: CSS.Transform.toString(transform),
                padding: '8px',
                margin: '4px',
                backgroundColor: disabled ? '#d0d0d0' : '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: disabled ? 'not-allowed' : 'move',
                opacity: disabled ? 0.5 : 1,
            }}
            onDragStart={disabled ? (e) => e.preventDefault() : onDragStart}
        >
            {name}
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
                backgroundColor: isOver ? '#e0ffe0' : '#fafafa',
                marginBottom: '20px',
            }}
        >
            {children}
        </div>
    );
}

const Dispatch = () => {
    document.title = "Dispatch | FMS Live";

    const dispatch: any = useDispatch();

    const rostersProperties = createSelector(
        (state: any) => state.ShiftRosters,
        (rosters) => ({
            shiftrosters: rosters.data
        })
    );

    const usersProperties = createSelector(
        (state: any) => state.Users,
        (usersState) => ({
            users: usersState.data
        })
    );

    const fleetProperties = createSelector(
        (state: any) => state.Fleet,
        (fleetState) => ({
            fleet: fleetState.data
        })
    );

    const { shiftrosters } = useSelector(rostersProperties);
    const { users } = useSelector(usersProperties);
    const { fleet } = useSelector(fleetProperties);

    const [operators, setOperators] = useState<any>([]);
    const [trucks, setTrucks] = useState<any>([]);
    const [diggers, setDiggers] = useState<any>([]);

    const [startDate, setStartDate] = useState(new Date());
    const [shift, setShift] = useState<any>('DS');

    const [searchParams, setSearchParams] = useSearchParams();

    const shifts: any = [
        { value: 'DS', label: 'DS', startTime: "06:00", endTime: "18:00" },
        { value: 'NS', label: 'NS', startTime: "18:00", endTime: "06:00" }
    ];

    useEffect(() => {
        dispatch(getAllUsers()); // Dispatch action to fetch users data on component mount
        dispatch(getAllFleet()); // Dispatch action to fetch fleet data on component mount

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
        setTimeout(() => {
            updateUsedOperatorsAndTrucks();
        }, 1000);
    }, [fleet]);

    useEffect(() => {
        setOperators(_.filter(users, (user) => { return user.role === 'OPERATOR' }));
        setTimeout(() => {
            updateUsedOperatorsAndTrucks();
        }, 1000);
    }, [users]);

    useEffect(() => {
        setTimeout(() => {
            updateUsedOperatorsAndTrucks();
        }, 1000);
    }, [shiftrosters]);

    const getOperators = (excavatorId: string) => {

        let shiftRoster = shiftrosters.find(roster => roster.vehicleId === excavatorId);
        return shiftRoster && shiftRoster.operators ? shiftRoster.operators : [];
    };

    const getTrainers = (excavatorId: string) => {

        let shiftRoster = shiftrosters.find(roster => roster.vehicleId === excavatorId);
        return shiftRoster && shiftRoster.trainers ? shiftRoster.trainers : [];
    };

    const getTrucks = (excavatorId: string) => {

        let shiftRoster = shiftrosters.find(roster => roster.vehicleId === excavatorId);
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

    const updateUsedOperatorsAndTrucks = () => {

        var updatedPersons: Array<any> = [];
        var updatedTrucks: Array<any> = [];


        const rosterOperators = shiftrosters.map((roster) => {
            return roster.operators && roster.operators[0] ? roster.operators[0].id : undefined;
        });
        const rosterTrainers = shiftrosters.map((roster) => {
            return roster.trainers && roster.trainers[0] ? roster.trainers[0].id : undefined;
        });
        const rosterTrucks = shiftrosters.map((roster) => {
            return roster.trucks && roster.trucks[0] ? roster.trucks[0].id : undefined;
        });

        // Disable the person after being dropped
        updatedPersons = operators.map(p =>
            (rosterOperators.includes(p.id) || rosterTrainers.includes(p.id)) ? { ...p, disabled: true } : { ...p, disabled: false }
        );

        // Disable the person after being dropped
        updatedTrucks = trucks.map(p =>
            rosterTrucks.includes(p.id) ? { ...p, disabled: true } : { ...p, disabled: false }
        );

        if (updatedPersons && updatedPersons[0] && updatedPersons[0].id) {
            setOperators(updatedPersons)
        };
        if (updatedTrucks && updatedTrucks[0] && updatedTrucks[0].id) {
            setTrucks(updatedTrucks)
        };
    };

    const removeOperator = (event) => {
        const deleteData = (event.target.parentElement.id).split('::');
        let shiftRoster = _.cloneDeep(shiftrosters.find(roster => roster.vehicleId === deleteData[0]));
        const rosterId = shiftRoster.id;
        delete shiftRoster._type;
        delete shiftRoster.createdAt;
        delete shiftRoster.updatedAt;
        delete shiftRoster.id;
        delete shiftRoster._id;
        delete shiftRoster.vehicle;
        shiftRoster['operators'] = [];
        dispatch(updateShiftRoster(rosterId, shiftRoster));
    }

    const removeTrainer = (event) => {
        const deleteData = (event.target.parentElement.id).split('::');
        let shiftRoster = _.cloneDeep(shiftrosters.find(roster => roster.vehicleId === deleteData[0]));
        const rosterId = shiftRoster.id;
        delete shiftRoster._type;
        delete shiftRoster.createdAt;
        delete shiftRoster.updatedAt;
        delete shiftRoster.id;
        delete shiftRoster._id;
        delete shiftRoster.vehicle;
        shiftRoster['trainers'] = [];
        dispatch(updateShiftRoster(rosterId, shiftRoster));
    }

    const removeTruck = (event) => {
        const deleteData = (event.target.parentElement.id).split('::');
        let shiftRoster = _.cloneDeep(shiftrosters.find(roster => roster.vehicleId === deleteData[0]));
        let trucks = _.filter(shiftRoster.trucks, (truck) => { return truck.id != deleteData[1] })
        const rosterId = shiftRoster.id;
        delete shiftRoster._type;
        delete shiftRoster.createdAt;
        delete shiftRoster.updatedAt;
        delete shiftRoster.id;
        delete shiftRoster._id;
        delete shiftRoster.vehicle;
        shiftRoster['trucks'] = trucks;
        dispatch(updateShiftRoster(rosterId, shiftRoster));
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
            // Add person to the new excavator 
            const userData = overId.split('::');

            if (person && !person.disabled) {

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

                let excavator = diggers.find(key => key.id === userData[0]);

                if (excavator) {

                    // Update the person in shiftRoster
                    let shiftRoster = _.cloneDeep(shiftrosters.find(roster => roster.vehicleId === userData[0]));
                    // let updatedShiftRosters;

                    if (shiftRoster && shiftRoster.id) {

                        // updatedShiftRosters = shiftrosters.map(roster =>
                        //     roster.vehicleId === userData[0] ? roster[userType] = [person] : roster
                        // );
                        const rosterId = shiftRoster.id;
                        delete shiftRoster._type;
                        delete shiftRoster.createdAt;
                        delete shiftRoster.updatedAt;
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
                if (userData[1] === 'truck') {

                    // Disable the truck after being dropped
                    const updatedTrucks = trucks.map(p =>
                        p.id === activeId ? { ...p, disabled: true } : p
                    );

                    let excavator = diggers.find(key => key.id === userData[0]);
                    if (excavator) {
                        // Update the person in shiftRoster
                        let shiftRoster = _.cloneDeep(shiftrosters.find(roster => roster.vehicleId === userData[0]));
                        // let updatedShiftRosters;

                        if (shiftRoster && shiftRoster.id) {

                            // updatedShiftRosters = shiftrosters.map(roster =>
                            //     roster.vehicleId === userData[0] ? roster['trucks'] = [truck] : roster
                            // );
                            const rosterId = shiftRoster.id;
                            delete shiftRoster._type;
                            delete shiftRoster.createdAt;
                            delete shiftRoster.updatedAt;
                            delete shiftRoster.id;
                            delete shiftRoster._id;
                            delete shiftRoster.vehicle;
                            shiftRoster['trucks'].push(truck);
                            dispatch(updateShiftRoster(rosterId, shiftRoster));
                        } else {
                            var newShiftRoster: any = {};
                            newShiftRoster['trucks'] = [truck];
                            newShiftRoster.vehicleId = userData[0];
                            dispatch(addShiftRoster(newShiftRoster));
                        }

                        //setShiftRosters(updatedShiftRosters);
                        setTrucks(updatedTrucks);
                    }
                }
            }
        }
    };

    return (
        < React.Fragment >
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb breadcrumbItem="Shift Roster" title="Operations" />
                    <Row className='mb-3'>
                        <Col className='d-flex flex-row-reverse'>
                            <Space>
                                <DatePicker allowClear={false} value={dayjs(startDate)} onChange={onDateChange} />
                                <Segmented className="customSegmentLabel customSegmentBackground" value={shift} onChange={onShiftChange} options={[{ value: 'DS', label: 'DS' }, { value: 'NS', label: 'NS' }]} />
                            </Space>
                        </Col>
                    </Row>
                    <DndContext onDragEnd={handleDragEnd}>
                        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
                            <Col xs={2}>
                                <h3>OPERATORS</h3>
                                <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                                    {operators.map(person => (
                                        <DraggablePerson
                                            key={person.id}
                                            id={person.id}
                                            name={person.firstName + " " + person.lastName}
                                            disabled={person.disabled}
                                            onDragStart={() => { }}
                                        />
                                    ))}
                                </div>
                            </Col>
                            <Col xs={6}>
                                <h3>EXCAVATORS</h3>
                                {diggers.map(excavator => (
                                    <div style={{
                                        width: '100%', backgroundColor: '', padding: '8px',
                                        margin: '4px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                    }}>
                                        <h3>{excavator.name}</h3>
                                        <Row>
                                            <Col xs={1}></Col>
                                            <Col xs={3}>
                                                <DropTarget key={excavator.id} id={excavator.id + '::operator'}>
                                                    {getOperators(excavator.id).map(person => (
                                                        <><div
                                                            key={person.id}
                                                            style={{
                                                                padding: '8px',
                                                                margin: '4px',
                                                                backgroundColor: '#e0e0e0',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                            }}
                                                        >
                                                            <Row>
                                                                <Col xs={10}>
                                                                    {person.firstName + " " + person.lastName}
                                                                </Col>
                                                                <Col xs={2}>
                                                                    <Button color="danger" id={excavator.id + '::' + person.id} onClick={removeOperator} className="save-device"> {"X"}  </Button>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                        </>
                                                    ))}
                                                </DropTarget>
                                            </Col>
                                            <Col xs={1}></Col>
                                            <Col xs={3}>
                                                <DropTarget key={excavator.id} id={excavator.id + '::trainer'}>
                                                    {getTrainers(excavator.id).map(person => (
                                                        <><div
                                                            key={person.id}
                                                            style={{
                                                                padding: '8px',
                                                                margin: '4px',
                                                                backgroundColor: '#e0e0e0',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                            }}
                                                        >
                                                            <Row>
                                                                <Col xs={10}>
                                                                    {person.firstName + " " + person.lastName}
                                                                </Col>
                                                                <Col xs={2}>
                                                                    <Button color="danger" id={excavator.id + '::' + person.id} onClick={removeTrainer} className="save-device"> {"X"}  </Button>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                        </>
                                                    ))}
                                                </DropTarget>
                                            </Col>
                                            <Col xs={1}></Col>
                                            <Col xs={3}>
                                                <DropTarget key={excavator.id} id={excavator.id + '::truck'}>
                                                    {getTrucks(excavator.id).map(truck => (
                                                        <><div
                                                            key={truck.id}
                                                            style={{
                                                                padding: '8px',
                                                                margin: '4px',
                                                                backgroundColor: '#e0e0e0',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                            }}
                                                        >
                                                            <Row>
                                                                <Col xs={10}>
                                                                    {truck.name}
                                                                </Col>
                                                                <Col xs={2}>
                                                                    <Button color="danger" id={excavator.id + '::' + truck.id} onClick={removeTruck} className="save-device"> {"X"}  </Button>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                        </>
                                                    ))}
                                                </DropTarget>
                                            </Col>
                                        </Row>


                                    </div>
                                ))}
                            </Col>
                            <Col xs={2}>
                                <h3>TRUCKS</h3>
                                <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                                    {trucks.map(truck => (
                                        <DraggablePerson
                                            key={truck.id}
                                            id={truck.id}
                                            name={truck.name}
                                            disabled={truck.disabled}
                                            onDragStart={() => { }}
                                        />
                                    ))}
                                </div>
                            </Col>
                        </div>
                    </DndContext>
                </Container>
            </div >
        </React.Fragment >
    );
}
export default Dispatch;