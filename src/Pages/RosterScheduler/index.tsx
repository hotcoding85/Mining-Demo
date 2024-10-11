import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, CardBody, CardTitle, Progress, Row, Col } from 'reactstrap';
import { Button } from 'antd'
import Chart from 'react-apexcharts';
import { hd1500 } from 'assets/images/equipment';
import Breadcrumb from 'Components/Common/Breadcrumb';
import {Scheduler, SchedulerData, ViewType, DATE_FORMAT} from './modules'
import dayjs from "dayjs";
import "react-big-schedule/dist/css/style.css";
import moment from 'moment'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import './style.scss'
import { DatePicker, Input, Segmented, Select, Space } from 'antd';
import { CloudUploadOutlined, SaveFilled, SettingFilled } from '@ant-design/icons';
import { format } from 'date-fns';
import { shifts, shiftsInFormat } from 'utils/common';
import { Employee ,Shift, bgColors } from './types'
import ScheduleModal from './ScheduleModal';
const RosterScheduler = () => {
    document.title = 'Roster Scheduler | FMS Live';
    
    const initialSchedulerData = new SchedulerData(moment().format('YYYY-MM-DD'), ViewType.Week, false, false, {
        views: [
            { viewName: 'Week', viewType: ViewType.Week, showAgenda: false, isEventPerspective: false },
            { viewName: 'Month', viewType: ViewType.Month, showAgenda: false, isEventPerspective: false },
            // { viewName: 'Quarter', viewType: ViewType.Quarter, showAgenda: false, isEventPerspective: false },
        ],
        dayMaxEvents: 2,
        resourceName: 'Employee',
        eventItemPopoverEnabled: true,
    })
    const [schedulerData, setSchedulerData] = useState<any>(initialSchedulerData);
    
    const resources: Employee[] = [
        { id: 'r1', name: '', firstName: 'Bain', lastName: 'Chloe', skills: [], startDate: '2024-10-01', endDate: '2024-12-01', status: 'ACTIVE', role: 'Boilermaker' },
        { id: 'r2', name: '', firstName: 'Banter', lastName: 'Greg', skills: [], startDate: '2024-10-20', endDate: '2024-12-01', status: 'ARCHIVE', role: 'Boilermaker' },
        { id: 'r3', name: '', firstName: 'Wade', lastName: 'Warren', skills: [], startDate: '2024-10-11', endDate: '2024-12-01', status: 'ARCHIVE', role: 'Miner' },
        { id: 'r4', name: '', firstName: 'Dianna', lastName: 'Russell', skills: [], startDate: '2024-10-12', endDate: '2024-12-31', status: 'ARCHIVE', role: 'Miner' },
        { id: 'r5', name: '', firstName: 'Arlene', lastName: 'McCoy', skills: [], startDate: '2024-10-03', endDate: '2024-12-01', status: 'ARCHIVE', role: 'Miner' },
        { id: 'r6', name: '', firstName: 'Jerome', lastName: 'Bell', skills: [], startDate: '2024-10-21', endDate: '2024-12-01', status: 'ARCHIVE', role: 'Driver' },
        { id: 'r7', name: '', firstName: 'Cody', lastName: 'Fisher', skills: [], startDate: '2024-10-29', endDate: '2024-12-31', status: 'ARCHIVE', role: 'Driver' },
        { id: 'r8', name: '', firstName: 'Bessie', lastName: 'Cooper', skills: [], startDate: '2024-10-02', endDate: '2024-12-31', status: 'ARCHIVE', role: 'Officer' },
    ];
    
    const initialEvents = [];
    
    const [events, setEvents] = useState<any>(initialEvents)
    const [shift, setShift] = useState<any>('DS');
    const [hideShiftSelect, setHideShiftSelect] = useState<any>(false);

    const rosterTypes = [
        { value: 'Day', label: 'DAY' },
        { value: 'Week', label: 'WEEK' },
    ]
    const [currentRosterType, setCurrentRosterType] = useState<any>('Day')
    const [workon, setWorkon] = useState(2)
    const [workoff, setWorkoff] = useState(1)

    const [isVisible, setIsVisible] = useState<boolean>(false)
    const [selectedSlot, setSelectedSlot] = useState({ slotId: null, slotName: null, start: null, end: null });

    useEffect(() => {
        schedulerData.setResources(resources);
        schedulerData.setEvents(events);
        schedulerData.setBesidesWidth(360)
    }, [])

    // Define custom popover template using eventItemPopoverTemplateResolver
    const eventItemPopoverTemplateResolver = (
        schedulerData,
        eventItem,
        title,
        start,
        end,
        statusColor
    ) => {
        const evt = events.find(event => event.id === eventItem.id)
        const item = resources.find(res => evt.resourceId === res.id)
        return (
            <div className="custom-scheduler-tooltip">
                <div className="tooltip-container">
                    <div className="tooltip-header">
                        <div className="tooltip-header-shift">
                            <span className="tooltip-shift-type">{item && (item.firstName + ' ' + item.lastName)}</span>
                            <div className="tooltip-header-status">
                                {/* Assuming statusColor is passed for the circle icon */}
                                <div className="status-icon" style={{ backgroundColor: statusColor }}></div>
                            </div>
                        </div>
                    </div>
                    <div className="tooltip-content">
                        <div className="tooltip-row">
                            <span className="tooltip-label">Role / Requirement:</span>
                            <span className="tooltip-value">{item && item.role}</span>
                        </div>
                        <div className="tooltip-row">
                            <span className="tooltip-label">Shift Type:</span>
                            <span className="tooltip-value">{eventItem.title}</span>
                        </div>
                        <div className="tooltip-row">
                            <span className="tooltip-label">Confirmation Status:</span>
                            <span className="tooltip-value">{eventItem.status}</span>
                        </div>
                        <div className="tooltip-row">
                            <span className="tooltip-label">Availability Status:</span>
                            <span className="tooltip-value">{eventItem.availabilityStatus}</span>
                        </div>
                        <div className="tooltip-row">
                            <span className="tooltip-label">Breaches:</span>
                            <span className="tooltip-value">{eventItem.breaches || 'None'}</span>
                        </div>
                        {eventItem.type === 'change' && <button
                            className="header2-text txt-btn-dis"
                            type="button"
                            onClick={() => removeEvent(schedulerData, eventItem)}
                            >
                            {'Remove'}
                        </button>}
                    </div>
                </div>
            </div>
        );
    };

    const removeEvent = (_schedulerData, _eventItem) => {
        // Find the index of the event in the schedulerData events array
        const eventIndex = events.findIndex(event => event.id === _eventItem.id);
        let updateEvents = events
        // If the event is found (eventIndex is not -1)
        if (eventIndex !== -1) {
            // Remove the event from the array
            updateEvents.splice(eventIndex, 1);
    
            // Optionally, trigger a re-render or update your scheduler's state (depending on how your scheduler is implemented)
            // Assuming you have a method to update the scheduler data:
            _schedulerData.setEvents(updateEvents)
            setEvents(updateEvents)
            setSchedulerData(_schedulerData);
            forceRerender()
        }
    };

    const onViewChange = useCallback((_schedulerData, view) => {
        if (!_schedulerData) return
        // Copy the previous schedulerData and update only what's needed
        const updatedSchedulerData: any = new SchedulerData(moment().format('YYYY-MM-DD'), view.viewType, false, false, {
            views: [
              { viewName: 'Week', viewType: ViewType.Week, showAgenda: false, isEventPerspective: false },
              { viewName: 'Month', viewType: ViewType.Month, showAgenda: false, isEventPerspective: false },
            //   { viewName: 'Quarter', viewType: ViewType.Quarter, showAgenda: false, isEventPerspective: false },
            ],
            dayMaxEvents: 2,
            resourceName: 'Employee',
            eventItemPopoverEnabled: true
        });

        updatedSchedulerData.setResources(schedulerData.resources);
        updatedSchedulerData.setEvents(events);
        updatedSchedulerData.setBesidesWidth(360)
        setSchedulerData(updatedSchedulerData);

    }, [schedulerData, events])

    const onChangeDateSegment = useCallback((_schedulerData, type) => {
        if (!_schedulerData) return
        type === 'prev' ? _schedulerData.prev() : _schedulerData.next()
        _schedulerData.setEvents(events);
        setSchedulerData(_schedulerData);
        forceRerender()
    }, [schedulerData, events])

    const onChangeDate = useCallback((_schedulerData, _date) => {
        if (!_schedulerData) return
        _schedulerData.setDate(_date)
        _schedulerData.setEvents(events);
        setSchedulerData(_schedulerData);
        forceRerender()
    }, [schedulerData, events])

    const updateEventStart = useCallback((_schedulerData, _event, newStart) => {

    }, [])

    const updateEventEnd = useCallback((_schedulerData, _event, newEnd) => {

    }, [])

    const moveEvent = useCallback((_schedulerData, _event, slotId, slotName, start, end) => {

    }, [])

    const newEvent = useCallback((_schedulerData, slotId, slotName, start, end, type, item) => {
        setSelectedSlot({ slotId, slotName, start, end });
        setIsVisible(true)
    }, [isVisible])

    useEffect(() => {
        forceRerender()
    }, [schedulerData, events])

    const forceRerender = () => {
        window.dispatchEvent(new Event('resize'));
    };

    const renderCustomResourceView = (resource, slotId) => {
        const employee = resources.find(res => res.id === slotId.slotId)
        return (
          <div className="roster-resource-row">
            <div className="employee-name">{employee && (employee.firstName + ' ' + employee.lastName)}</div>
            <div className="buttons">
              <button onClick={() => handleBaseClick(slotId.slotId)}>Base</button>
              <button onClick={() => handleChangeClick(slotId.slotId)}>Change</button>
            </div>
          </div>
        );
    };

    const handleBaseClick = (resourceId) => {
        console.log("Base clicked for resource:", resourceId);
    };
      
    const handleChangeClick = (resourceId) => {
        console.log("Change clicked for resource:", resourceId);
    };

    const onShiftChange = (shiftInfo) => {
        setShift(shiftInfo);
    }

    const generateSchedule = useCallback(() => {
        let eventList: any = [];
        let eventId = 1;
    
        resources.forEach(resource => {
            let employeeEvents: any = [];
            const startDate = moment(resource.startDate);
            const endDate = moment(resource.endDate);
    
            let currentStartDate = startDate.clone();
            let cycleIndex = 0;  // Tracks the alternating cycle
    
            const shifts = ['DS', 'R&R', 'NS', 'R&R'];  // Cycle: DS -> R&R -> NS -> R&R
    
            // Loop through the range between start and end dates
            while (currentStartDate.isBefore(endDate)) {
                const currentShift = shifts[cycleIndex % shifts.length];  // Determine current cycle phase
    
                // If it's a DS or NS shift, calculate workon period
                if (currentShift === 'DS' || currentShift === 'NS') {
                    const workonPeriod = currentRosterType === 'Day' ? workon : workon * 7;
    
                    // Generate workon (shift) events
                    for (let i = 0; i < workonPeriod; i++) {
                        if (currentStartDate.isAfter(endDate)) break;
    
                        const shiftStart = currentShift === 'DS' ? '09:00' : '21:00';  // Day shift or night shift start time
                        const shiftEnd = currentShift === 'DS' ? '17:00' : '05:00';  // End time for the shift
    
                        let event = {
                            id: eventId++,
                            start: currentStartDate.format(`YYYY-MM-DD ${shiftStart}`),
                            end: currentStartDate.format(`YYYY-MM-DD ${shiftEnd}`),
                            resourceId: resource.id,
                            bgColor: bgColors[currentShift],
                            type: 'base',
                            title: currentShift,  // DS or NS
                        };
    
                        eventList.push(event);
                        employeeEvents.push(event);
                        currentStartDate.add(1, 'days');  // Move to the next day
                    }
                }
                
                // If it's R&R, calculate workoff period
                if (currentShift === 'R&R') {
                    const workoffPeriod = currentRosterType === 'Day' ? workoff : workoff * 7;
    
                    // Generate workoff (R&R) events
                    for (let j = 0; j < workoffPeriod; j++) {
                        if (currentStartDate.isAfter(endDate)) break;
    
                        let rrEvent = {
                            id: eventId++,
                            start: currentStartDate.format('YYYY-MM-DD 00:00'),  // Full day R&R event
                            end: currentStartDate.format('YYYY-MM-DD 23:59'),
                            resourceId: resource.id,
                            bgColor: bgColors['R&R'],
                            type: 'base',
                            title: 'R&R',  // Rest & Recreation
                        };
    
                        eventList.push(rrEvent);
                        employeeEvents.push(rrEvent);
                        currentStartDate.add(1, 'days');  // Move to the next day
                    }
                }
    
                cycleIndex++;  // Move to the next phase in the cycle (DS -> R&R -> NS -> R&R)
            }
    
            resource.shifts = employeeEvents;
        });
    
        // Update the state with the generated events
        setEvents(eventList);
        schedulerData.setEvents(eventList);
        setSchedulerData(schedulerData);
    }, [schedulerData, workon, workoff, currentRosterType, bgColors, resources]);
    
    
    

    const submitRosterSchedule = useCallback(() => {
        // submit logic
        console.log(events)
    }, [events])

    const SaveNewSchedule = useCallback((_type, _slotId) => {
        setIsVisible(false)
        let eventId = 0
        schedulerData.events.forEach(item => {
            if (item.id >= eventId) eventId = item.id + 1;
        });

        const resource = resources.find(res => res.id === _slotId);
        if (!resource) return

        const resourceStartDate = moment(resource.startDate);  // Resource's start date
        const resourceEndDate = moment(resource.endDate);      // Resource's end date
        const scheduleStartDate = moment(selectedSlot.start);  // Scheduler start date
        const scheduleEndDate = moment(selectedSlot.end);      // Scheduler end date

        let eventList = [...schedulerData.events];     // Start with current events in the scheduler

        let currentStartDate = scheduleStartDate.clone();
        while (currentStartDate.isBefore(scheduleEndDate)) {
            // Check if the current date is within the resource's start and end date range
            if (currentStartDate.isBetween(resourceStartDate, resourceEndDate, 'days', '[]')) {
                // Calculate start and end time based on the shift (Day Shift or Night Shift)
                const shiftStart = shift === 'DS' ? '09:00' : '21:00';  // DS start time
                const shiftEnd = shift === 'DS' ? '17:00' : '05:00';    // DS end time
                // Check how many events already exist for this resource on this day
                const eventsOnDay = eventList.filter(event => 
                    event.resourceId === resource.id && 
                    moment(event.start).isSame(currentStartDate, 'day')
                );
                if (eventsOnDay.length < 2) {
                    // Create an event object for each day in the resource's work cycle
                    let event = {
                        id: eventId++, // Auto-increment ID
                        start: currentStartDate.format(`YYYY-MM-DD ${shiftStart}`),  // Format the start time
                        end: currentStartDate.format(`YYYY-MM-DD ${shiftEnd}`),      // Format the end time
                        resourceId: resource.id,  // Resource ID from selectedSlot
                        bgColor: bgColors[_type],  // Set the background color based on shift
                        type: eventsOnDay.length === 0 ? 'base' : 'change',  // Type of the event (you can modify this depending on your logic)
                        title: _type,  // Set title to either "DS" (Day Shift) or "NS" (Night Shift)
                    };
        
                    eventList.push(event);  // Add the new event to the list
                }
            }
            currentStartDate.add(1, 'days');  // Move to the next day
        }

        // Update the scheduler's event list with the new events
        schedulerData.setEvents(eventList);
        setEvents(eventList);  // Update the state to reflect new events
    }, [selectedSlot])

    return (
        <React.Fragment>
            <div className="page-content roster-scheduler">
                <Container fluid>
                    <Breadcrumb title="Mine Control" breadcrumbItem="Roster Scheduler" />  
                    <Row>
                        <Col md={8} xs={12}>
                            <div className='roster-shift-body'>
                                    {/* <Segmented hidden={hideShiftSelect} className="customSegmentLabel customSegmentBackground" value={shift} onChange={onShiftChange} options={shiftsInFormat(shifts)} style={{marginRight: '5px'}} /> */}
                                    <Select
                                        className="basic-single"
                                        id="roster-type"
                                        showSearch
                                        placeholder="Target Type"
                                        style={{ width: '150px' }}
                                        options={rosterTypes}
                                        value={currentRosterType} // set selected value
                                        onChange={(_type) => setCurrentRosterType(_type)}
                                    />
                                    <Input 
                                        placeholder={`Working on ` + currentRosterType} 
                                        type='number'
                                        value={workon}
                                        min={1}
                                        onChange={(e) => setWorkon(parseInt(e.target.value))}  /> 
                                    <span className='slash'>/</span> 
                                    <Input 
                                        placeholder={`Work off ` + currentRosterType} 
                                        type='number'
                                        value={workoff}
                                        min={1}
                                        onChange={(e) => setWorkoff(parseInt(e.target.value))} />
                                    <Button icon={<SettingFilled />} style={{marginLeft: '5px'}} onClick={generateSchedule} >Generate</Button>
                                    <Button icon={<CloudUploadOutlined />} onClick={submitRosterSchedule} style={{marginLeft: '5px'}} >Save</Button>
                            </div>
                        </Col>
                        <Col md={12}>
                            <DndProvider backend={HTML5Backend}>
                                <div className='body-scheduler'>
                                    <Scheduler
                                        schedulerData={schedulerData}
                                        prevClick={(_schedulerData) => onChangeDateSegment(_schedulerData, 'prev')}
                                        nextClick={(_schedulerData) => onChangeDateSegment(_schedulerData, 'next')}
                                        onSelectDate={(_schedulerData, _date) => onChangeDate(_schedulerData, _date)}
                                        onViewChange={(schedulerData, view) => onViewChange(schedulerData, view)}
                                        slotItemTemplateResolver={renderCustomResourceView}
                                        updateEventStart={updateEventStart}
                                        updateEventEnd={updateEventEnd}
                                        moveEvent={moveEvent}
                                        newEvent={newEvent}
                                        eventItemPopoverTemplateResolver={eventItemPopoverTemplateResolver}
                                    />
                                </div>
                            </DndProvider>
                        </Col>
                    </Row>
                    <ScheduleModal 
                        isVisible={isVisible}
                        handleOk={SaveNewSchedule}
                        handleCancel={() => setIsVisible(false)}
                        startTime={selectedSlot.start || ''}
                        slotId={selectedSlot.slotId || ''}
                        endTime={selectedSlot.end || ''} 
                    />
                </Container>
            </div>
        </React.Fragment>
    )
}

export default RosterScheduler;