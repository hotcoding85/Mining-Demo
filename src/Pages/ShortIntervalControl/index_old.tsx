// import * as React from 'react';
// import { Card, CardBody, Col, Container, Row } from 'reactstrap';
// import { useEffect, useRef, useState } from 'react';
// import { ScheduleComponent, TreeViewArgs, ResourcesDirective, ResourceDirective, ViewsDirective, ViewDirective, ResourceDetails, Inject, TimelineViews, Resize, DragAndDrop, ActionEventArgs, CellClickEventArgs } from '@syncfusion/ej2-react-schedule';
// import { closest, addClass, registerLicense } from '@syncfusion/ej2-base';
// import { DragAndDropEventArgs } from '@syncfusion/ej2-navigations';
// import { TreeViewComponent } from '@syncfusion/ej2-react-navigations';
// import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars';
// import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
// import { getDispatchs, updateDispatch, getAllFleet, getAllUsers, addDispatch, getShiftRosters, getAllBenches, getAllMaterials } from 'slices/thunk';
// import { useDispatch, useSelector } from 'react-redux';
// import { useSearchParams } from 'react-router-dom';
// import Select from 'react-select';
// import { format } from 'date-fns';
// import type { DatePickerProps } from 'antd';
// import { DatePicker, Space } from 'antd';
// import dayjs from "dayjs";
// import { createSelector } from 'reselect';
// import _ from 'lodash';

import React from "react";

// import './dispatch.css';

// const licensekey = "Ngo9BigBOggjHTQxAR8/V1NCaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXhdcHRXRmdfUE1wX0U="
// // Registering Syncfusion license key
// registerLicense(licensekey);

// /**
//  * schedule resources group-editing sample
//  */
const Dispatch = () => {
    document.title = "Dispatch | FMS Live";

//     const dispatch: any = useDispatch();

//     const dispatchsProperties = createSelector(
//         (state: any) => state.Dispatch,
//         (dispatchs) => ({
//             dispatchs: dispatchs && dispatchs.data ? dispatchs.data : []
//         })
//     );

//     const benchesProperties = createSelector(
//         (state: any) => state.Benches,
//         (benches) => ({
//             benches: benches && benches.data ? benches.data : []
//         })
//     );

//     const rostersProperties = createSelector(
//         (state: any) => state.ShiftRosters,
//         (rosters) => ({
//             rosters: rosters && rosters.data ? rosters.data : []
//         })
//     );

//     const usersProperties = createSelector(
//         (state: any) => state.Users,
//         (usersState) => ({
//             users: usersState.data
//         })
//     );

//     const fleetProperties = createSelector(
//         (state: any) => state.Fleet,
//         (fleetState) => ({
//             fleet: fleetState.data
//         })
//     );

//     const materialProperties = createSelector(
//         (state: any) => state.Materials,
//         (materialState) => ({
//             materials: materialState ? materialState.data : []
//         })
//     );

//     const { rosters } = useSelector(rostersProperties);
//     const { dispatchs } = useSelector(dispatchsProperties);
//     const { benches } = useSelector(benchesProperties);
//     const { users } = useSelector(usersProperties);
//     const { fleet } = useSelector(fleetProperties);
//     const { materials } = useSelector(materialProperties);

//     const [trucks, setTrucks] = useState<any>();
//     const [startDate, setStartDate] = useState(new Date());
//     const [shift, setShift] = useState<any>('DS');

//     const [searchParams, setSearchParams] = useSearchParams();

//     const crews: any = [
//         { value: 'crewa', label: 'Crew A' },
//         { value: 'crewb', label: 'Crew B' },
//         { value: 'crewc', label: 'Crew C' }
//     ];

//     const shifts: any = [
//         { value: 'DS', label: 'Day Shift', startTime: "06:00", endTime: "18:00", viewInterval: 1 },
//         { value: 'NS', label: 'Night Shift', startTime: "00:00", endTime: "23:59", viewInterval: 2 }
//     ];

//     var operators: any = {};
//     operators = users && users.map(option => {
//         return { value: option.id, "label": option?.['firstName'] + ' ' + option?.['lastName'] }
//     });

//     var locations: any = {};
//     locations = benches && benches.map(option => {
//         return option?.['name'];
//     });

//     var haulers: any = {};
//     haulers = trucks && trucks.map(option => {
//         return option?.['name'];
//     });

//     var materialsData: any = {};
//     materialsData = materials && materials.map(option => {
//         return option?.['name'];
//     });

//     var fleetId: string = "";

//     useEffect(() => {
//         dispatch(getDispatchs(format(startDate, 'yyyy-MM-dd') + ':' + shift)); // Dispatch action to fetch data on component mount
//         dispatch(getShiftRosters(format(startDate, 'yyyy-MM-dd') + ':' + shift)); // ShiftRosters action to fetch data on component mount
//     }, [dispatch, shift, startDate]);

//     useEffect(() => {
//         const queryParams = new URLSearchParams(window.location.search)
//         setShift(queryParams.get("shift") ? queryParams.get("shift") : 'DS');
//         setStartDate(queryParams.get("date") ? new Date(queryParams.get("date") || new Date()) : new Date());

//         if (!queryParams.get("shift")) {
//             var params: URLSearchParams = new URLSearchParams({ shift: 'DS', date: format(new Date(), 'yyyy-MM-dd') });
//             setSearchParams(params);
//         }

//         dispatch(getAllUsers()); // Dispatch action to fetch users data on component mount
//     }, [dispatch]);

//     useEffect(() => {
//         dispatch(getAllFleet()); // Dispatch action to fetch fleet data on component mount
//         dispatch(getAllBenches()); // Dispatch action to fetch benches data on component mount
//         dispatch(getAllMaterials()); // Dispatch action to fetch materials data on component mount
//     }, [dispatch]);


//     const fleetTypesData: Record<string, any>[] = [
//         { Text: 'Diggers', Id: 1, Color: '#9e5fff' }
//     ];

//     const getUnix = (date) => {
//         let unixDate = dayjs(date).unix();
//         return unixDate
//     }

//     const getTimestamp = (unixDate) => {
//         // "2024-08-04T10:30:00.000Z",
//         let date = dayjs.unix(unixDate).format('YYYY-MM-DDTHH:mm:ss.000Z')
//         //  + '.000Z';
//         return date
//     }

//     const getResourceData = () => {
//         if (!fleet) {
//             return [];
//         }

//         let diggers = fleet.filter(fleet => fleet.category === "EXCAVATOR");
//         return diggers
//             .map((fl) => {
//                 return {
//                     Text: fl.name,
//                     Id: fl.id,
//                     GroupId: 1,
//                     Color: '#bbdc00'
//                 }
//             })
//     }

//     const getHaulers = () => {
//         if (!fleet) {
//             return [];
//         }

//         return fleet
//             .filter((fl) => fl.category === "DUMP_TRUCK")
//             .map((fl) => {
//                 return fl.name
//             })
//     }

//     const trucksData = _.map(trucks, (truck) => {
//         return { Name: truck.name, Id: truck.id, GroupId: 1, Color: '#bbdc00', Designation: 'Truck' }
//     });

//     const getLocations = (category) => {
//         const locs = _.filter(benches, (bench) => { return bench.category === category })
//         const finalLocs = locs && locs.map(option => {
//             return option?.['name'];
//         });
//         return finalLocs;
//     }

//     const locs = _.filter(benches, (bench) => { return bench.category === 'SOURCE' })
//     const benchesData = _.map(locs, (bench) => {
//         return { Name: bench.name, Id: bench.id, GroupId: 1, Color: '#bbdc00', Designation: 'Bench' }
//     });

//     let scheduleObj: any = useRef<ScheduleComponent>(null);
//     let treeObj = useRef<TreeViewComponent>(null);
//     let isTreeItemDropped: boolean = false;
//     let draggedItemId: string = '';
//     const allowDragAndDrops: boolean = true;
//     const truckList: Record<string, any> = { dataSource: trucksData, id: 'Id', text: 'Source' };
//     const benchList: Record<string, any> = { dataSource: benchesData, id: 'Id', text: 'Source' };

//     const getFleetName = (value: ResourceDetails | TreeViewArgs): string => {
//         return (value as ResourceDetails).resourceData[(value as ResourceDetails).resource.textField!] as string;
//     }

//     const resourceHeaderTemplate = (props: any) => {
//         return (
//             <div className="template-wrap">
//                 <div className="fleetType-category">
//                     {/* <div className={"fleetType-image " + getConsultantImage(props)}></div> */}
//                     <div className="fleetType-name"> {getFleetName(props)}</div>
//                     {/* <div className="fleetType-designation">{getConsultantDesignation(props)}</div> */}
//                 </div>
//             </div>
//         );
//     }

//     const treeTemplate = (props: any) => {
//         return (
//             <div id="waiting">
//                 {/* <div id="waitdetails"> */}
//                 <div id="waitcategory">{props.Name}</div>
//                 {/* <div id="waitcategory">{props.DepartmentName} - {props.Description}</div> */}
//                 {/* </div> */}
//             </div>
//         );
//     }

//     const onItemSelecting = (args: any): void => {
//         args.cancel = true;
//     }

//     const onTreeDrag = (event: any): void => {
//         if (scheduleObj.current!.isAdaptive) {
//             let classElement: HTMLElement = scheduleObj.current!.element.querySelector('.e-device-hover')!;
//             if (classElement) {
//                 classElement.classList.remove('e-device-hover');
//             }
//             if (event.target.classList.contains('e-work-cells')) {
//                 addClass([event.target], 'e-device-hover');
//             }
//         }
//     }

//     const onEventClick = (event: ActionEventArgs): void => {
//         isTreeItemDropped = true;
//     }
//     const onPopupOpen = (event: ActionEventArgs): void => {
//         isTreeItemDropped = true;
//         fleetId = event!.data!['FleetId'];
//     }

//     const onPopupClose = (event: ActionEventArgs): void => {
//         console.log(event);
//     }

//     const getFleetId = (name): string => {
//         return fleet.filter((item: any) => item.name === name)[0].id;
//     }
//     const getBenchId = (name): string => {
//         return benches.filter((item: any) => item.name === name)[0].id;
//     }
//     const getMaterialId = (name): string => {
//         return materials.filter((item: any) => item.name === name)[0].id;
//     }

//     const onActionComplete = (event: ActionEventArgs): void => {
//         if ((event.requestType === 'eventCreate' || event.requestType === 'eventCreated') && isTreeItemDropped) {
//             isTreeItemDropped = false;
//             const record = event.addedRecords![0];
//             let treeviewData: Record<string, any>[] = treeObj.current!.fields.dataSource as Record<string, any>[];
//             const sourceData: Record<string, any>[] = treeviewData.filter((item: any) => item.Name === record.Source);

//             const index = scheduleObj.current!.getIndexFromResourceId(record.FleetId ? record.FleetId : fleetId);
//             let resourceDetails: ResourceDetails = scheduleObj.current!.getResourcesByIndex((index && index != -1) ? index : record.Id);

//             scheduleObj.current!.addEvent({
//                 Source: sourceData[0].Name,
//                 Destination: record.Destination,
//                 Material: record.Material,
//                 Trucks: record.Trucks,
//                 Tonnes: record.Tonnes,
//                 StartTime: record.StartTime,
//                 EndTime: record.EndTime,
//                 FleetTypeId: resourceDetails.resourceData.GroupId,
//                 FleetId: resourceDetails.resourceData.Id
//             });

//             const planData = {
//                 vehicleId: resourceDetails.resourceData.Id,
//                 sourceId: getBenchId(sourceData[0].Name),
//                 destinationId: getBenchId(record.Destination),
//                 materialId: getMaterialId(record.Material),
//                 roster: format(startDate, 'yyyy-MM-dd') + ':' + shift,
//                 startTime: getUnix(record.StartTime),
//                 endTime: getUnix(record.EndTime),
//                 tonnes: record.Tonnes,
//                 supporting: [getFleetId(record.Trucks)],
//             };
//             dispatch(addDispatch(planData))
//             dispatch(getDispatchs(format(startDate, 'yyyy-MM-dd') + ':' + shift));
//             // let treeViewData: Record<string, any>[] = treeObj.current!.fields.dataSource as Record<string, any>[];
//             // const filteredPeople: Record<string, any>[] = treeViewData.filter((item: any) => item.Id !== parseInt(draggedItemId, 10));
//             // treeObj.current!.fields.dataSource = filteredPeople;
//             // let elements: NodeListOf<HTMLElement> = document.querySelectorAll('.e-drag-item.treeview-external-drag');
//             // for (let i: number = 0; i < elements.length; i++) {
//             //     remove(elements[i]);
//             // }
//         }
//         if ((event.requestType === 'eventChange' || event.requestType === 'eventChanged') && isTreeItemDropped) {
//             isTreeItemDropped = false;
//             const record = event.changedRecords![0];
//             let treeviewData: Record<string, any>[] = treeObj.current!.fields.dataSource as Record<string, any>[];
//             const sourceData: Record<string, any>[] = treeviewData.filter((item: any) => item.Name === record.Source);

//             const index = scheduleObj.current!.getIndexFromResourceId(record.FleetId ? record.FleetId : fleetId);
//             let resourceDetails: ResourceDetails = scheduleObj.current!.getResourcesByIndex((index && index != -1) ? index : 1);

//             // scheduleObj.current!.saveEvent({
//             //     DocId: record.DocId,
//             //     Source: sourceData[0].Name,
//             //     Destination: record.Destination,
//             //     Material: record.Material,
//             //     Trucks: record.Trucks,
//             //     Tonnes: record.Tonnes,
//             //     StartTime: record.StartTime,
//             //     EndTime: record.EndTime,
//             //     FleetTypeId: resourceDetails.resourceData.GroupId,
//             //     FleetId: resourceDetails.resourceData.Id
//             // }, "EditOccurrence");
//             const planData = {
//                 vehicleId: resourceDetails.resourceData.Id,
//                 sourceId: getBenchId(sourceData[0].Name),
//                 destinationId: getBenchId(record.Destination),
//                 materialId: getMaterialId(record.Material),
//                 roster: format(startDate, 'yyyy-MM-dd') + ':' + shift,
//                 startTime: getUnix(record.StartTime),
//                 endTime: getUnix(record.EndTime),
//                 tonnes: record.Tonnes,
//                 supporting: [getFleetId(record.Trucks)],
//             };

//             dispatch(updateDispatch(record.DocId, planData));
//             dispatch(getDispatchs(format(startDate, 'yyyy-MM-dd') + ':' + shift));
//         }
//     }
//     const onActionBegin = (event: ActionEventArgs): void => {
//         if (event.requestType === 'eventChange' || event.requestType === 'eventChanged') {
//             const record = event.changedRecords![0];
//             if (record && record.Id) {
//                 isTreeItemDropped = true;
//                 return;
//             }
//         } else if (event.requestType === 'eventCreate' || event.requestType === 'eventCreate') {
//             const record = event.addedRecords![0];
//             if (record && !record.FleetId) {
//                 isTreeItemDropped = true;
//                 return;
//             }
//         }
//         isTreeItemDropped = false;
//     }

//     const onTreeDragStop = (event: DragAndDropEventArgs): void => {
//         let treeElement: Element = closest(event.target, '.e-treeview');
//         // let classElement: HTMLElement = scheduleObj.current!.element.querySelector('.e-device-hover')!;
//         // if (classElement) {
//         //     classElement.classList.remove('e-device-hover');
//         // }
//         if (!treeElement) {
//             event.cancel = true;
//             let scheduleElement: Element = closest(event.target, '.e-content-wrap');
//             if (scheduleElement) {
//                 let treeviewData: Record<string, any>[] = treeObj.current!.fields.dataSource as Record<string, any>[];
//                 if (event.target.classList.contains('e-work-cells')) {
//                     const filteredData: Record<string, any>[] = treeviewData.filter((item: any) => item.Id === event.draggedNodeData.id);
//                     let cellData: CellClickEventArgs = scheduleObj.current!.getCellDetails(event.target);
//                     let resourceDetails: ResourceDetails = scheduleObj.current!.getResourcesByIndex(cellData.groupIndex!);

//                     let eventData: Record<string, any> = {
//                         Source: filteredData[0].Name,
//                         Destination: undefined,
//                         Material: undefined,
//                         Trucks: undefined,
//                         Tonnes: undefined,
//                         StartTime: cellData.startTime,
//                         EndTime: cellData.endTime,
//                         FleetTypeId: resourceDetails.resourceData.GroupId,
//                         FleetId: resourceDetails.resourceData.Id
//                     };



//                     scheduleObj.current!.openEditor(eventData, 'Add', true, 0);
//                     isTreeItemDropped = true;
//                     draggedItemId = event.draggedNodeData.id as string;
//                 }
//             }
//         }
//         document.body.classList.remove('e-disble-not-allowed');
//     }

//     const onTreeDragStart = () => {
//         document.body.classList.add('e-disble-not-allowed');
//     }

//     const data: Record<string, any>[] = [
//         {
//             "Source": "New",
//             "Destination": "New",
//             "Trucks": "New",
//             "Tonnes": "69696",
//             "StartTime": "2024-08-04T10:30:00.000Z",
//             "EndTime": "2024-08-04T11:30:00.000Z",
//             "FleetTypeId": 1,
//             "FleetId": "d381e8f9-897b-4e6c-8160-b153512feb64"
//         }
//     ]

//     const getDatasource = () => {

//         const data = dispatchs.map(option => {
//             return {
//                 DocId: (option && option.id) ? option.id : '',
//                 Source: (option && option.source) ? option.source.name : '',
//                 Destination: (option && option.destination) ? option.destination.name : '',
//                 Trucks: (option && option.supporting) ? option.supporting.name : '',
//                 Material: (option && option.material) ? option.material.name : '',
//                 Tonnes: option.tonnes,
//                 StartTime: getTimestamp(option.startTime),
//                 EndTime: getTimestamp(option.endTime),
//                 FleetTypeId: 1,
//                 FleetId: (option && option.vehicle) ? option.vehicle.id : '',
//             }
//         });
//         return data;
//     }
//     var eventSettings = {
//         dataSource: getDatasource(),
//         fields: {
//             subject: { title: 'Source', name: 'Source' },
//             destination: { title: 'Destination', name: 'Destination' },
//             material: { title: 'Material', name: 'Material' },
//             startTime: { title: "Start", name: "StartTime" },
//             endTime: { title: "End", name: "EndTime" }
//         }
//     }

//     const editorTemplate = (props) => {
//         return (props !== undefined ?
//             <table className="custom-event-editor" style={{ width: '100%', padding: '5' }}>
//                 <tbody>
//                     <tr><td className="e-textlabel">Source</td><td colSpan={4}>
//                         <DropDownListComponent id="Source" placeholder='Select Source' data-name="Source" className="e-field" style={{ width: '100%' }} dataSource={getLocations('SOURCE')} value={props.Source || null}></DropDownListComponent>
//                     </td></tr>
//                     <tr><td className="e-textlabel">Destination</td><td colSpan={4}>
//                         <DropDownListComponent id="Destination" placeholder='Select Destination' data-name="Destination" className="e-field" style={{ width: '100%' }} dataSource={getLocations('DESTINATION')} value={props.Destination || null}></DropDownListComponent>
//                     </td></tr>
//                     <tr><td className="e-textlabel">Material</td><td colSpan={4}>
//                         <DropDownListComponent id="Material" placeholder='Select Material' data-name="Material" className="e-field" style={{ width: '100%' }} dataSource={materialsData} value={props.Material || null}></DropDownListComponent>
//                     </td></tr>
//                     <tr><td className="e-textlabel">From</td><td colSpan={4}>
//                         <DateTimePickerComponent format='dd/MM/yy hh:mm a' id="StartTime" data-name="StartTime" value={new Date(props.StartTime)} className="e-field"></DateTimePickerComponent>
//                     </td></tr>
//                     <tr><td className="e-textlabel">To</td><td colSpan={4}>
//                         <DateTimePickerComponent format='dd/MM/yy hh:mm a' id="EndTime" data-name="EndTime" value={new Date(props.EndTime)} className="e-field"></DateTimePickerComponent>
//                     </td></tr>
//                     <tr><td className="e-textlabel">Tonnes</td><td colSpan={4}>
//                         <input id="Tonnes" type='number' className="e-field e-input" name="Tonnes" style={{ width: '100%', height: '60px !important' }} value={props.Tonnes}></input>
//                     </td></tr>
//                     <tr><td className="e-textlabel">Trucks</td><td colSpan={4}>
//                         <DropDownListComponent id="Trucks" placeholder='Select Trucks' data-name="Trucks" className="e-field" style={{ width: '100%' }} dataSource={getHaulers()} value={props.Trucks ? props.Trucks : undefined}></DropDownListComponent>
//                     </td>
//                     </tr>
//                 </tbody>
//             </table> : <div></div>);
//     }

//     const getShiftTimings = (shifts, shift) => {
//         let filteredShift = _.filter(shifts, (shiftData) => { return (shiftData.value === shift) ? shiftData : undefined })
//         console.log({ startTime: filteredShift[0].startTime, endTime: filteredShift[0].endTime });

//         return { startTime: filteredShift[0].startTime, endTime: filteredShift[0].endTime, viewInterval: filteredShift[0].viewInterval };
//     }

//     const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
//         if (date) {
//             setStartDate(date.toDate());
//             var params: URLSearchParams = new URLSearchParams({ shift: shift, date: format(date.toDate(), 'yyyy-MM-dd') });
//             setSearchParams(params);
//         }
//     };

//     const onShiftChange = (shiftInfo) => {
//         setShift(shiftInfo.value);
//         var params: URLSearchParams = new URLSearchParams({ shift: shiftInfo.value, date: format(startDate, 'yyyy-MM-dd') });
//         setSearchParams(params);
//         updateScheduler(shiftInfo.value);
//     }

//     // TimeLine Header UI
//     // const instance = new Internationalization();
//     // const majorSlotTemplate = (props) => {
//     //     return (<div>{instance.formatDate(props.date, { skeleton: 'hm' })}</div>);
//     // }
//     // const minorSlotTemplate = (props) => {
//     //     return (<div>{instance.formatDate(props.date, { skeleton: 'ms' }).replace(':00', '')}</div >);
//     // }
//     const timeScale = {
//         enable: true, interval: 60, slotCount: 2,
//         // majorSlotTemplate: majorSlotTemplate.bind(this),
//         // minorSlotTemplate: minorSlotTemplate.bind(this)
//     };

//     // const workHours = {
//     //     start: '11:00', end: '16:00'
//     // };

//     const today = new Date();
//     const initialDate = new Date(today.setHours(18, 0, 0));
//     const tomorrow = new Date(today);
//     tomorrow.setDate(today.getDate() + 1);


//     // Define the start and end of the custom timeline
//     const twoDaysLater = new Date(today);
//     twoDaysLater.setDate(today.getDate() + 2);

//     // Initialize the date range
//     const initialStart = today;
//     const initialEnd = twoDaysLater;

//     const startDateTemp = new Date();
//     startDateTemp.setHours(12, 0, 0, 0); // Start from 6 AM today


//     const schedulerScrollTo = (time: string): void => {
//         if (scheduleObj && scheduleObj.current) {
//             scheduleObj.current!.scrollTo('18:00');
//         }
//     }

//     const updateScheduler = (shiftValue: string) => {
//         if (!scheduleObj.current) {
//             return;
//         }

//         let shiftTimings = getShiftTimings(shifts, shiftValue ?? shift);
//         if (shiftTimings.startTime > shiftTimings.endTime) {
//             scheduleObj.current.startHour = "00:00";
//             scheduleObj.current.endHour = "23:59";
//             scheduleObj.current.viewOptions.timelineDay.interval = 2;
//             scheduleObj.current.scrollTo('18:00', new Date(2024, 7, 4));
//         } else {
//             scheduleObj.current.startHour = shiftTimings.startTime;
//             scheduleObj.current.endHour = shiftTimings.endTime;
//             scheduleObj.current.viewOptions.timelineDay.interval = 1;
//         }
//     }

    return (
        <React.Fragment>
             <div className="page-content">

            </div>
        </React.Fragment>
    );
}
export default Dispatch;