import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Row } from "reactstrap";
// import { Space, DatePicker, DatePickerProps } from "antd";
import Select from 'react-select';
import dayjs from "dayjs";
import { format } from 'date-fns';
import { useSearchParams } from "react-router-dom";
import { filter } from "lodash";
// import { ScheduleComponent, ResourcesDirective, ResourceDirective, ViewsDirective, ViewDirective, Inject, ResourceDetails, TimelineViews, TreeViewArgs } from '@syncfusion/ej2-react-schedule'
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { getAllEvents } from 'slices/thunk';
import { shifts } from "utils/common";


const fleetTypesData: Record<string, any>[] = [
    { Text: 'Diggers', Id: 1, Color: '#9e5fff' },
    { Text: 'Trucks', Id: 2, Color: '#9e5fff' }
]

const data: Record<string, any>[] = [
    {
        "StartTime": "2024-08-03T00:30:00.000Z",
        "EndTime": "2024-08-03T00:45:00.000Z",
        "FleetTypeId": 1,
        "FleetId": "d381e8f9-897b-4e6c-8160-b153512feb64",
        "State": "Standby",
        "color": "#FFBF00"
    },
    {
        "StartTime": "2024-08-03T00:45:00.000Z",
        "EndTime": "2024-08-03T01:45:00.000Z",
        "FleetTypeId": 1,
        "FleetId": "d381e8f9-897b-4e6c-8160-b153512feb64",
        "State": "Active",
        "color": "#008000"
    },
    {

        "StartTime": "2024-08-03T01:45:00.000Z",
        "EndTime": "2024-08-03T02:00:00.000Z",
        "FleetTypeId": 1,
        "FleetId": "d381e8f9-897b-4e6c-8160-b153512feb64",
        "State": "Standby",
        "color": "#FFBF00"
    },
    {
        "StartTime": "2024-08-03T02:00:00.000Z",
        "EndTime": "2024-08-03T07:30:00.000Z",
        "FleetTypeId": 1,
        "FleetId": "d381e8f9-897b-4e6c-8160-b153512feb64",
        "State": "Active",
        "color": "#008000"
    },
    {
        "StartTime": "2024-08-03T07:30:00.000Z",
        "EndTime": "2024-08-03T09:30:00.000Z",
        "FleetTypeId": 1,
        "FleetId": "d381e8f9-897b-4e6c-8160-b153512feb64",
        "State": "Down",
        "color": "#FF5733"
    },
    {

        "StartTime": "2024-08-03T09:30:00.000Z",
        "EndTime": "2024-08-03T09:45:00.000Z",
        "FleetTypeId": 1,
        "FleetId": "d381e8f9-897b-4e6c-8160-b153512feb64",
        "State": "Standby",
        "color": "#FFBF00"
    },
    {
        "StartTime": "2024-08-03T09:45:00.000Z",
        "EndTime": "2024-08-03T12:30:00.000Z",
        "FleetTypeId": 1,
        "FleetId": "d381e8f9-897b-4e6c-8160-b153512feb64",
        "State": "Active",
        "color": "#008000"
    }
]

const FleetTimeline = (props: any) => {
    document.title = "Timeline Utilization Model | FMS Live";
    const dispatch: any = useDispatch();
    const timeScale = {
        enable: true,
        interval: 60,
        slotCount: 2
    }

    const { fleet } = useSelector(createSelector(
        (state: any) => state.Fleet,
        (fleetState) => ({
            fleet: fleetState.data
        })
    ));

    const { events } = useSelector(createSelector(
        (state: any) => state.Events,
        (eventsState) => ({
            events: eventsState.data
        })
    ));
    const timelineRef: any = useRef(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const [startDate, setStartDate] = useState(new Date());
    const [shift, setShift] = useState<any>('DS');

    const onKeyPress = (event) => {
        console.log(event)
    }

    const zoomIn = () => {
        if (timelineRef.current.timeScale.slotCount <= 8) {
            timelineRef.current.timeScale.slotCount += 1;
        }
    };

    const zoomOut = () => {
        if (timelineRef.current.timeScale.slotCount > 2) {
            timelineRef.current.timeScale.slotCount -= 1;
        }
    };

    useEffect(() => {
        setSearchParams({ date: format(startDate, 'yyyy-MM-dd'), shift: shift });
    }, []);

    useEffect(() => {
        dispatch(getAllEvents(format(startDate, 'yyyy-MM-dd') + ':' + shift)); // Dispatch action to fetch data on component mount
    }, [dispatch, shift, startDate]);

    const getResourceData = () => {
        if (!fleet) {
            return [];
        }

        return fleet
            .map((fl) => {
                return {
                    Text: fl.name,
                    Id: fl.id,
                    GroupId: fl.category == "EXCAVATOR" ? 1 : 2,
                    Color: '#bbdc00'
                }
            })
    }

    // const onDateChange: DatePickerProps['onChange'] = (date, dateString): void => {
    //     if (date) {
    //         setStartDate(date.toDate());
    //         let params: URLSearchParams = new URLSearchParams({ date: format(date.toDate(), 'yyyy-MM-dd'), shift: shift });
    //         setSearchParams(params);
    //     }
    // }

    const onShiftChange = (shiftInfo): void => {
        setShift(shiftInfo.value);
        let params: URLSearchParams = new URLSearchParams({ date: format(startDate, 'yyyy-MM-dd'), shift: shiftInfo.value });
        setSearchParams(params);
        updateScheduler(shiftInfo.value);
    }

    const getShiftTimings = (shifts: any, shift: string) => {
        let filteredShift = filter(shifts, (shiftData) => { return (shiftData.value === shift) ? shiftData : undefined })
        return {
            startTime: filteredShift[0].startTime,
            endTime: filteredShift[0].endTime,
            viewInterval: filteredShift[0].viewInterval
        }
    }

    const getColorByState = (state) => {

        let color = "#008000";
        switch (state) {
            case "ACTIVE":
                color = "#008000";
                break;
            case "DELAY":
                color = "#FFBF00";
                break;
            case "STANDBY":
                color = "#FFBF00";
                break;
            case "DOWN":
                color = "#FF5733";
                break;
            default:
                break;
        }
        return color;
    }

    const getTimestamp = (unixDate) => {
        // "2024-08-04T10:30:00.000Z",
        let date = dayjs.unix(unixDate).format('YYYY-MM-DDTHH:mm:ss.000Z')
        //  + '.000Z';
        return date
    }

    const getDatasource = () => {

        const data = events.map(option => {
            return {
                color: getColorByState(option && option.event ? option.event.state : ""),
                State: option && option.event ? option.event.state : "",
                StartTime: option && option.event ? getTimestamp(option.event.startTime) : "",
                EndTime: option && option.event ? getTimestamp(option.event.endTime) : "",
                FleetTypeId: 2,
                FleetId: (option && option.truck) ? option.truck.id : '',
            }
        });
        return data;
    }

    const eventSettings = {
        dataSource: getDatasource(),
        fields: {
            subject: { title: 'Text', name: 'State' },
            startTime: { title: "Start", name: "StartTime" },
            endTime: { title: "End", name: "EndTime" }
        },
        allowEditing: false,
        allowDeleting: false
    };

    const schedulerScrollTo = (time: string): void => {
        if (timelineRef && timelineRef.current) {
            timelineRef.current!.scrollTo('18:00');
        }
    }

    const updateScheduler = (shiftValue: string) => {
        if (!timelineRef.current) {
            return;
        }

        let shiftTimings = getShiftTimings(shifts, shiftValue ?? shift);
        if (shiftTimings.startTime > shiftTimings.endTime) {
            timelineRef.current.startHour = "00:00";
            timelineRef.current.endHour = "23:59";
            timelineRef.current.viewOptions.timelineDay.interval = 2;
            timelineRef.current.scrollTo('18:00', new Date(2024, 7, 4));
        } else {
            timelineRef.current.startHour = shiftTimings.startTime;
            timelineRef.current.endHour = shiftTimings.endTime;
            timelineRef.current.viewOptions.timelineDay.interval = 1;
        }
    }

    const resourceHeaderTemplate = (props: any) => {
        return (
            <div className="template-wrap">
                <div className="fleetType-category">
                    {/* <div className="fleetType-name"> {getFleetName(props)}</div> */}
                </div>
            </div>
        )
    }

    const onEventReneder = (args: any): void => {
        let color = args.data.color;
        args.element.style.backgroundColor = color;
    }

    const onPopupOpen = (args: any): void => {
        let isEmptyCell = args.target.classList.contains('e-work-cells') || args.target.classList.contains('e-header-cells');
        if ((args.type === 'QuickInfo' || args.type === 'Editor') && isEmptyCell) {
            args.cancel = true;
        }
    }

    // const getFleetName = (value: ResourceDetails | TreeViewArgs): string => {
    //     return (value as ResourceDetails).resourceData[(value as ResourceDetails).resource.textField!] as string;
    // }

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Row>
                        <Col lg="12">
                            <Row>
                                <Col xs={6}></Col>
                                <Col xs={2} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button onClick={zoomIn} style={{ marginRight: '10px' }}>Zoom In</Button>
                                    <Button onClick={zoomOut}>Zoom Out</Button>
                                </Col>
                                <Col xs={2} content='right'>
                                    {/* <Space direction="vertical" style={{ width: '100%' }}>
                                        <DatePicker style={{ width: '100%', fontSize: '18px' }} size='large' allowClear={false} variant={'outlined'} value={dayjs(startDate)} onChange={onDateChange} />
                                    </Space> */}
                                </Col>
                                <Col xs={2}>
                                    <Select
                                        className="basic-single"
                                        classNamePrefix="Shifts"
                                        defaultValue={shifts[0]}
                                        value={shifts.filter(shiftInfo => shiftInfo.value === shift)}
                                        isDisabled={false}
                                        isLoading={false}
                                        isClearable={false}
                                        isRtl={false}
                                        isSearchable={true}
                                        name="Shifts"
                                        options={shifts}
                                        onChange={onShiftChange}
                                        styles={{
                                            menu: base => ({
                                                ...base,
                                                zIndex: 100
                                            })
                                        }}
                                    />
                                </Col>
                            </Row>
                            <label></label>
                        </Col>
                    </Row>
                    <Row>
                        <div className='schedule-control-section'>
                            <div className='col-lg-12 control-section'>
                                <div className='control-wrapper drag-sample-wrapper'>
                                    <Row>
                                        <Col lg="12">
                                            <div className="schedule-container">
                                                {/* <ScheduleComponent
                                                    ref={timelineRef}
                                                    cssClass='schedule-drag-drop'
                                                    width='100%' height='100%'
                                                    allowMultiCellSelection={true}
                                                    selectedDate={startDate}
                                                    currentView='TimelineDay'
                                                    startHour={shift === 'DS' ? "06:00" : "00:00"}
                                                    endHour={shift === 'DS' ? "18:00" : "23:59"}
                                                    showHeaderBar={false}
                                                    timeScale={timeScale}
                                                    resourceHeaderTemplate={resourceHeaderTemplate}
                                                    eventSettings={eventSettings}
                                                    showTimeIndicator={true}
                                                    showQuickInfo={true}
                                                    group={{ enableCompactView: false, resources: ['FleetTypes', 'Fleet'] }}
                                                    eventRendered={onEventReneder}
                                                    // actionComplete={updateScheduler}
                                                    popupOpen={onPopupOpen}
                                                    created={updateScheduler}>
                                                    <ResourcesDirective>
                                                        <ResourceDirective field='FleetTypeId' title='Fleet Type' name='FleetTypes' allowMultiple={false} dataSource={fleetTypesData} textField='Text' idField='Id' colorField='Color' />
                                                        <ResourceDirective field='FleetId' title='Fleet' name='Fleet' allowMultiple={true} dataSource={getResourceData()} textField='Text' idField='Id' groupIDField="GroupId" colorField='Color' />
                                                    </ResourcesDirective>
                                                    <ViewsDirective>
                                                        <ViewDirective option='TimelineDay' interval={shift === 'DS' ? 1 : 2} />
                                                    </ViewsDirective>
                                                    <Inject services={[TimelineViews]} />
                                                </ScheduleComponent> */}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </div>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    )
}
export default FleetTimeline;