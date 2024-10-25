import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardBody, Col, Container, Form, Input, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import TableContainer, { TableColumn } from '../../Components/Common/TableContainer';
import { getTargetsByRosterAndCategory, getAllFleet, addTargets } from 'slices/thunk';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import type { DatePickerProps } from 'antd';
import { DatePicker, Segmented, Space, Select, Button } from 'antd';
import dayjs, { Dayjs } from "dayjs";
import { round2Two, roundOff, shiftDuration, shifts, shiftsInFormat } from "../../utils/common";
import _ from 'lodash';
import { CloudUploadOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import './index.scss'
import { FleetSelector, TargetSelector } from 'selectors';

const Target = (props: any) => {
  document.title = "Targets";

  const dispatch: any = useDispatch();

  const { targets } = useSelector(TargetSelector);
  const { fleet } = useSelector(FleetSelector);

  const [startDate, setStartDate] = useState(new Date());
  const [shift, setShift] = useState<any>('DS');
  const [hideShiftSelect, setHideShiftSelect] = useState<any>(false);
  const [pickerType, setPickerType] = useState<string>('month');
  const [pickerFormat, setPickerFormat] = useState<any>('YYYY-MM-DD');

  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<any>([]);
  const [summary, setSummary] = useState<any>({});
  const [selectedTargetType, setSelectedTargetType] = useState<any>('SHIFT');

  const truckColumns: TableColumn[] = useMemo(
    () => [
      {
        header: "Equipment Name",
        accessorKey: "truckModel",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row, getValue }) => {
          return (
            <div style={{ fontSize: '14px' }}>
              {row.getCanExpand() ? (
                <button {...{
                  onClick: row.getToggleExpandedHandler(),
                  style: { cursor: 'pointer', border: 'none', backgroundColor: 'transparent', borderRadius: '4px', justifyContent: 'center', justifyItems: 'center' },
                }}>
                  {row.getIsExpanded() ?
                    <DownOutlined className='dropDownArrow' /> : <RightOutlined className='dropDownArrow' />}
                </button>
              ) : (
                ''
              )}
              {getValue()}
            </div>
          )
        }
      },
      {
        header: "Planned Loads",
        accessorKey: "loads",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Avg. Load",
        accessorKey: "avgLoad",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Avg. Trip Time",
        accessorKey: "avgTime",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Planned Tonnes",
        accessorKey: "tonnes",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Availability (Mins)",
        accessorKey: "availability",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Availability (%)",
        accessorKey: "availablePer",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Standby (Mins)",
        accessorKey: "standby",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Standby (%)",
        accessorKey: "standbyPer",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Utilisation (Mins)",
        accessorKey: "utilization",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Utilisation (%)",
        accessorKey: "utilizationPer",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      // {
      //   header: "Loads",
      //   accessorKey: "loads",
      //   enableColumnFilter: false,
      //   enableSorting: true,
      //   cell: ({ getValue, row, column }) => {
      //     return (
      //       <Input type='number' style= {{color: 'black'}} onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()}  value={getValue()}> </Input>
      //     );
      //   }
      // },

      // {
      //   header: "Actions",
      //   enableColumnFilter: false,
      //   accessorKey: "",
      //   enableSorting: false,
      //   cell: (cellProps: any) => {
      //     const name = `${cellProps.row.original.name}`
      //     const id = cellProps.row.original.id
      //     return (
      //       <div className="d-flex gap-3">
      //         <Link
      //           to="#!"
      //           className="text-success"
      //           onClick={(event: any) => {
      //             event.preventDefault();
      //             const benchData = cellProps.row.original;
      //             handleOnEdit(benchData);
      //           }}
      //         >
      //           <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
      //         </Link>
      //         <DeleteButton item={name} onDelete={() => handleOnDelete(id)} />
      //       </div>
      //     );
      //   },
      // },
    ],
    []
  );

  const [currentTruckColumns, setCurrentTruckColumns] = useState(truckColumns);

  const avgTripTime: number = 15;
  const avgLoadTime: number = 3;
  const targetsConfig = {

    SHIFT: {
      availablePer: 80,
      standbyPer: 10
    },
    DAILY: {
      availablePer: 80,
      standbyPer: 10
    },
    WEEKLY: {
      availablePer: 80,
      standbyPer: 10
    },
    MONTHLY: {
      availablePer: 80,
      standbyPer: 10
    }
  }

  const targetTypes = [
    { value: 'SHIFT', label: 'SHIFT' },
    { value: 'DAILY', label: 'DAILY' },
    { value: 'WEEKLY', label: 'WEEKLY' },
    { value: 'MONTHLY', label: 'MONTHLY' }];


  useEffect(() => {
    updateDataOnDateChange(selectedTargetType);
  }, [dispatch, shift, startDate]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    setShift(queryParams.get("shift") ? queryParams.get("shift") : 'DS');
    setStartDate(queryParams.get("date") ? new Date(queryParams.get("date") || new Date()) : new Date());

    if (!queryParams.get("shift")) {
      var params: URLSearchParams = new URLSearchParams({ shift: 'DS', date: format(new Date(), 'yyyy-MM-dd') });
      setSearchParams(params);
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllFleet(1, 100)); // Dispatch action to fetch fleet data on component mount
  }, [dispatch]);

  useEffect(() => {
    setData(generateData());
    updateSummary();
  }, [targets]);

  const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
    if (date) {
      setStartDate(date.toDate());
      var params: URLSearchParams = new URLSearchParams({ shift: shift, date: format(date.toDate(), 'yyyy-MM-dd') });
      setSearchParams(params);
    }
  };

  const onShiftChange = (shiftInfo) => {
    setShift(shiftInfo);
    var params: URLSearchParams = new URLSearchParams({ shift: shiftInfo, date: format(startDate, 'yyyy-MM-dd') });
    setSearchParams(params);
  }

  const onTargetTypeChange = (targetType) => {
    setSelectedTargetType(targetType);

    updateView(targetType);
  };

  const updateDataOnDateChange = (targetType) => {
    switch (targetType) {
      case 'SHIFT':
        dispatch(getTargetsByRosterAndCategory(JSON.stringify([format(startDate, 'yyyy-MM-dd') + ':' + shift]), targetType));
        break;
      case 'DAILY':
        let rosters: any[] = [];
        shifts.map((shift) => {
          rosters.push(format(startDate, 'yyyy-MM-dd') + ':' + shift.name)
        })

        dispatch(getTargetsByRosterAndCategory(JSON.stringify(rosters), targetType));
        break;
      case 'WEEKLY':

        let weekRosters: any[] = [];
        shifts.map((shift) => {
          const startOfWeek = dayjs(startDate).startOf('week');
          const date = startOfWeek.format('YYYY-MM-DD');
          weekRosters.push(date + ':' + shift.name)
        })

        dispatch(getTargetsByRosterAndCategory(JSON.stringify(weekRosters), targetType));
        break;
      case 'MONTHLY':

        let monthRosters: any[] = [];
        shifts.map((shift) => {
          const startOfMonth = dayjs(startDate).startOf('month');
          const date = startOfMonth.format('YYYY-MM-DD');
          monthRosters.push(date + ':' + shift.name)
        })

        dispatch(getTargetsByRosterAndCategory(JSON.stringify(monthRosters), targetType));
        break;

      default:
        break;
    }
  }

  const updateView = (targetType) => {
    switch (targetType) {
      case 'SHIFT':
        setHideShiftSelect(false);
        setPickerType('date')
        setPickerFormat('YYYY-MM-DD')

        dispatch(getTargetsByRosterAndCategory(JSON.stringify([format(startDate, 'yyyy-MM-dd') + ':' + shift]), targetType));
        break;
      case 'DAILY':
        setHideShiftSelect(true);
        setPickerType('date')
        setPickerFormat('YYYY-MM-DD')

        let rosters: any[] = [];
        shifts.map((shift) => {
          rosters.push(format(startDate, 'yyyy-MM-dd') + ':' + shift.name)
        })

        dispatch(getTargetsByRosterAndCategory(JSON.stringify(rosters), targetType));
        break;
      case 'WEEKLY':
        setHideShiftSelect(true);
        setPickerType('week')
        setPickerFormat('wo MMM YYYY')

        let weekRosters: any[] = [];
        shifts.map((shift) => {
          const startOfWeek = dayjs(startDate).startOf('week');
          const date = startOfWeek.format('YYYY-MM-DD');
          weekRosters.push(date + ':' + shift.name)
        })

        dispatch(getTargetsByRosterAndCategory(JSON.stringify(weekRosters), targetType));
        break;
      case 'MONTHLY':
        setHideShiftSelect(true);
        setPickerType('month')
        setPickerFormat('MMM YYYY')

        let monthRosters: any[] = [];
        shifts.map((shift) => {
          const startOfMonth = dayjs(startDate).startOf('month');
          const date = startOfMonth.format('YYYY-MM-DD');
          monthRosters.push(date + ':' + shift.name)
        })

        dispatch(getTargetsByRosterAndCategory(JSON.stringify(monthRosters), targetType));
        break;

      default:
        break;
    }
  }

  const generateData = () => {

    let targetsData: [any] = [{
      truckId: undefined,
      truckCategory: undefined,
      truckModel: undefined,
      availablePer: undefined,
      availability: undefined,
      standby: undefined,
      utilization: undefined,
      loads: undefined,
      tonnes: undefined
    }];
    fleet && fleet.map((truck) => {
      let vehicleTargetData = _.filter(targets, (target) => { return target && target.vehicleId === truck.id });
      var target = _.cloneDeep(targetsConfig[selectedTargetType]);
      if (vehicleTargetData && vehicleTargetData[0] && vehicleTargetData[0].data) target = _.cloneDeep(vehicleTargetData[0].data);
      if (vehicleTargetData && vehicleTargetData[0] && vehicleTargetData[0].id) target.id = (vehicleTargetData[0]).id;


      if (target.availability) {
        if (selectedTargetType === 'SHIFT') {
          const duration = shiftDuration(shifts, shift);
          target['availablePer'] = _.round((target.availability / (duration * 60)) * 100, 0);
          target['standbyPer'] = _.round((target.standby / target.availability) * 100, 0);
        } else if (selectedTargetType === 'DAILY') {
          target['availablePer'] = _.round((target.availability / (24 * 60)) * 100, 0);
          target['standbyPer'] = _.round((target.standby / target.availability) * 100, 0);
        } else if (selectedTargetType === 'WEEKLY') {
          target['availablePer'] = _.round((target.availability / (7 * 24 * 60)) * 100, 0);
          target['standbyPer'] = _.round((target.standby / target.availability) * 100, 0);
        } else if (selectedTargetType === 'MONTHLY') {
          const daysInMonth = dayjs(startDate).daysInMonth();
          target['availablePer'] = _.round((target.availability / (daysInMonth * 24 * 60)) * 100, 0);
          target['standbyPer'] = _.round((target.standby / target.availability) * 100, 0);
        }
      } else if (target.availablePer) {
        if (selectedTargetType === 'SHIFT') {
          const duration = shiftDuration(shifts, shift);
          target.availability = _.round((target['availablePer'] * duration) * 60 / 100, 0);
          target.standby = _.round((target['standbyPer'] * target.availability) / 100, 0);
        } else if (selectedTargetType === 'DAILY') {
          target.availability = _.round((target['availablePer'] * 24 * 60) / 100, 0);
          target.standby = _.round((target['standbyPer'] * target.availability) / 100, 0);
        } else if (selectedTargetType === 'WEEKLY') {
          target.availability = _.round((target['availablePer'] * (7 * 24 * 60)) / 100, 0);
          target.standby = _.round((target['standbyPer'] * target.availability) / 100, 0);
        } else if (selectedTargetType === 'MONTHLY') {
          const daysInMonth = dayjs(startDate).daysInMonth();
          target.availability = _.round((target['availablePer'] * daysInMonth * 24 * 60) / 100, 0);
          target.standby = _.round((target['standbyPer'] * target.availability) / 100, 0);
        }
      }

      target.utilization = _.round(target.availability - target.standby, 0);
      target.utilizationPer = _.round((target.utilization / target.availability) * 100, 0);
      target.avgLoad = target.avgLoad ? target.avgLoad : truck.capacity;
      target.avgTime = target.avgTime ? target.avgTime : truck.category === 'DUMP_TRUCK' ? avgTripTime : avgLoadTime;

      if (target.standby && target.standby != 0 && (!target.utilization || target.utilization === 0)) {
        target.utilization = _.round(target.availability - target.standby, 0);
      }

      target.loads = target.loads ? target.loads : _.round((target.utilization / target.avgTime), 0);
      target.tonnes = target.tonnes ? target.tonnes : _.round(target.loads * target.avgLoad, 2);

      if (!targetsData || !targetsData[0] || !targetsData[0].truckId) {
        targetsData = [{ truckId: truck.id, truckName: truck.name, truckModel: truck.name, truckCategory: truck.category, groupModel: truck.model, availablePer: target.availablePer, availability: target.availability, standby: target.standby, standbyPer: target.standbyPer, utilization: target.utilization, utilizationPer: target.utilizationPer, loads: target.loads, tonnes: target.tonnes, avgLoad: target.avgLoad, avgTime: target.avgTime, id: target.id }]
      } else {
        targetsData.push({ truckId: truck.id, truckName: truck.name, truckModel: truck.name, truckCategory: truck.category, groupModel: truck.model, availablePer: target.availablePer, availability: target.availability, standby: target.standby, standbyPer: target.standbyPer, utilization: target.utilization, utilizationPer: target.utilizationPer, loads: target.loads, tonnes: target.tonnes, avgLoad: target.avgLoad, avgTime: target.avgTime, id: target.id })
      }

    })

    var targetsByModel: [any] = [{
      truckId: undefined,
      truckModel: undefined,
      truckName: undefined,
      truckCategory: undefined,
      availablePer: undefined,
      availability: undefined,
      standby: undefined,
      utilization: undefined,
      loads: undefined,
      tonnes: undefined
    }
    ];

    _.mapKeys(_.groupBy(targetsData, 'groupModel'), (targets, model) => {

      var target = _.cloneDeep(targetsConfig[selectedTargetType]);
      if (selectedTargetType === 'SHIFT') {
        const duration = shiftDuration(shifts, shift);
        target.availability = _.round((target['availablePer'] * duration) * 60 / 100, 0);
        target.standby = _.round((target['standbyPer'] * target.availability) / 100, 0);
      } else if (selectedTargetType === 'DAILY') {
        target.availability = _.round((target['availablePer'] * 24 * 60) / 100, 0);
        target.standby = _.round((target['standbyPer'] * target.availability) / 100, 0);
      } else if (selectedTargetType === 'WEEKLY') {
        target.availability = _.round((target['availablePer'] * (7 * 24 * 60)) / 100, 0);
        target.standby = _.round((target['standbyPer'] * target.availability) / 100, 0);
      } else if (selectedTargetType === 'MONTHLY') {
        const daysInMonth = dayjs(startDate).daysInMonth();
        target.availability = _.round((target['availablePer'] * daysInMonth * 24 * 60) / 100, 0);
        target.standby = _.round((target['standbyPer'] * target.availability) / 100, 0);
      }
      target.utilization = _.round(target.availability - target.standby, 0);
      target.utilizationPer = _.round((target.utilization / target.availability) * 100, 0);
      target.avgLoad = getCapacity(targets[0].groupModel);

      target.avgTime = targets[0].truckCategory === 'DUMP_TRUCK' ? avgTripTime : avgLoadTime;

      target.loads = target.loads ? target.loads : _.round((target.utilization / target.avgTime), 0);
      target.tonnes = target.tonnes ? target.tonnes : _.round(target.loads * target.avgLoad, 2);
      target.truckCategory = targets[0].truckCategory;
      target.truckModel = model;
      target.subRows = targets;
      if (!targetsByModel || !targetsByModel[0] || !targetsByModel[0].truckModel) {
        targetsByModel = [target]
      } else {
        targetsByModel.push(target)
      }
    })

    return _.groupBy(targetsByModel, 'truckCategory');
  };

  const updateTargetData = (columnId, target, depth, duration) => {

    if (columnId === 'availablePer' || columnId === 'availability' || columnId === 'standbyPer' || columnId === 'standby') {

      if (columnId === 'availablePer') {
        target.availability = _.round((target['availablePer'] * duration) / 100, 0);
      }
      if (columnId === 'availability') {
        target.availablePer = _.round((target.availability / duration) * 100, 2)
      }

      if (columnId === 'standby') {
        target.standbyPer = _.round((target.standby / target.availability) * 100, 0);
      } else {
        target.standby = _.round((target['standbyPer'] * target.availability) / 100, 0);
      }

      target.utilization = _.round(target.availability - target.standby, 0);
      target.utilizationPer = _.round((target.utilization / target.availability) * 100, 0);

      //TODO: UNCOMMENT FOR AUTO CALCULATION
      // target.loads = _.round((target.utilization / target.avgTime), 0);
      // target.tonnes = _.round(target.loads * target.avgLoad, 2);
    } else if (columnId === 'utilizationPer' || columnId === 'utilization') {

      if (columnId === 'utilizationPer') {
        target.utilization = _.round((target['utilizationPer'] * target.availability) / 100, 0);
      }
      if (columnId === 'utilization') {
        target.utilizationPer = _.round((target.utilization / target.availability) * 100, 0);
      }

      target.standby = _.round(target.availability - target.utilization, 0);
      target.standbyPer = _.round((target.standby / target.availability) * 100, 0);

      //TODO: UNCOMMENT FOR AUTO CALCULATION
      // target.loads = _.round((target.utilization / target.avgTime), 0);
      // target.tonnes = _.round(target.loads * target.avgLoad, 2);
    } else {
      //TODO: UNCOMMENT FOR AUTO CALCULATION
      // target.loads = _.round((target.utilization / target.avgTime), 0);
      // target.tonnes = _.round(target.loads * target.avgLoad, 2);
    }

    if (depth === 0) {
      let updatedSubTargets: any = [];
      target.subRows.map((subtarget) => {
        updatedSubTargets.push(_.merge(subtarget, {
          availability: target.availability,
          availablePer: target.availablePer,
          standby: target.standby,
          standbyPer: target.standbyPer,
          utilization: target.utilization,
          utilizationPer: target.utilizationPer,
          avgLoad: target.avgLoad,
          avgTime: target.avgTime,
          loads: target.loads,
          tonnes: target.tonnes
        }));
      });
      target.subRows = updatedSubTargets;
    }
    return target;
  }

  const getCapacity = (model) => {

    let capacity;
    const modelVehicles = fleet.filter((vehicle) => { return vehicle.model === model });
    if (modelVehicles && modelVehicles[0]) {
      capacity = modelVehicles[0].capacity ? modelVehicles[0].capacity : 55;
    }
    return capacity;
  }

  const onFieldChange = (row, columnId, value) => {

    const rowIndex = row.index;
    const rowData = row.original;

    if (columnId === 'avgLoad') {
      const capacity = getCapacity(rowData.truckModel);
      if (value > capacity) {
        return true;
      }
    }

    let duration: number;
    setSelectedTargetType((prevState) => {
      const targetType = _.cloneDeep(prevState);
      switch (targetType) {
        case 'SHIFT':
          duration = shiftDuration(shifts, shift) * 60;
          break;
        case 'DAILY':
          duration = 24 * 60;
          break;
        case 'WEEKLY':
          duration = 7 * 24 * 60;
          break;
        case 'MONTHLY':
          const daysInMonth = dayjs(startDate).daysInMonth();
          duration = daysInMonth * 24 * 60;
          break;
        default:
          break;
      }
      return targetType;
    })

    setData((prevState) => {
      const newData = _.cloneDeep(prevState);


      let tempData = newData[rowData.truckCategory]
      if (row.depth === 0) {
        tempData[rowIndex] = {
          ...tempData[rowIndex],
          [columnId]: parseInt(value)
        };
        newData[rowData.truckCategory][rowIndex] = updateTargetData(columnId, tempData[rowIndex], row.depth, duration);

      } else {
        tempData[row.parentId].subRows[rowIndex] = {
          ...tempData[row.parentId].subRows[rowIndex],
          [columnId]: parseInt(value)
        };
        newData[rowData.truckCategory][row.parentId].subRows[rowIndex] = updateTargetData(columnId, tempData[row.parentId].subRows[rowIndex], row.depth, duration);
      }
      return newData;
    })

    updateSummary();
  };

  const updateSummary = () => {

    setData((prevState) => {
      const data = _.cloneDeep(prevState);

      const allData = _.flattenDeep(Object.values(data));
      const allTargets = allData.map((target: any) => { return target.subRows });
      let targets = _.flattenDeep(allTargets);

      let trucksData = _.filter(targets, (target) => { return target && target.truckCategory === 'DUMP_TRUCK' });
      let diggersData = _.filter(targets, (target) => { return target && target.truckCategory === 'EXCAVATOR' });

      setSummary({
        truckTonnes: _.sumBy(trucksData, 'tonnes'),
        truckLoads: _.sumBy(trucksData, 'loads'),
        diggerTonnes: _.sumBy(diggersData, 'tonnes'),
        diggerLoads: _.sumBy(diggersData, 'loads')
      })

      return data;
    });
  }

  const submit = () => {
    const productionData = getProductionData();
    dispatch(addTargets(productionData))
  }

  const getProductionData = () => {
    var productionData: any = [];

    let roster: string;
    setSelectedTargetType((prevState) => {
      const targetType = _.cloneDeep(prevState);
      switch (targetType) {
        case 'SHIFT':
          roster = format(startDate, 'yyyy-MM-dd') + ':' + shift;
          break;
        case 'DAILY':
          roster = format(startDate, 'yyyy-MM-dd') + ':' + shifts[0].name;
          break;
        case 'WEEKLY':
          const startOfWeek = dayjs(startDate).startOf('week');
          roster = startOfWeek.format('YYYY-MM-DD') + ':' + shifts[0].name;
          break;
        case 'MONTHLY':
          const startOfMonth = dayjs(startDate).startOf('month');
          roster = startOfMonth.format('YYYY-MM-DD') + ':' + shifts[0].name;
          break;
        default:
          break;
      }
      return targetType;
    })


    setData((prevState) => {
      const data = _.cloneDeep(prevState);

      const allData = _.flattenDeep(Object.values(data));
      const allTargets = allData.map((target: any) => { return target.subRows });

      _.flattenDeep(allTargets).filter((item) => item.truckCategory ==="DUMP_TRUCK" || item.truckCategory ==="EXCAVATOR").map((targetData: any) => {

        var target: any = {};

        if (targetData.id) target.id = targetData.id;
        target.data = _.pick(targetData, ['availability', 'standby', 'utilization', 'loads', 'tonnes', 'avgTime', 'avgLoad']);
        target.roster = roster;
        target.category = selectedTargetType;
        target.status = "ACTIVE";

        delete target._type;
        delete target.createdAt;
        delete target.updatedAt;
        delete target._id;
        delete target.vehicle;
        // delete target.id;
        target.vehicleId = _.cloneDeep(targetData.truckId);

        productionData.push(target);

      })
      return data
    })

    return productionData;
  }


  const diggerColumns: TableColumn[] = useMemo(
    () => [
      {
        header: "Equipment Name",
        accessorKey: "truckModel",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row, getValue }) => {
          return (
            <div style={{ fontSize: '14px' }}>
              {row.getCanExpand() ? (
                <button {...{
                  onClick: row.getToggleExpandedHandler(),
                  style: { cursor: 'pointer', border: 'none', backgroundColor: 'transparent' },
                }}>
                  {row.getIsExpanded() ?
                    <DownOutlined className='dropDownArrow' /> : <RightOutlined className='dropDownArrow' />}
                </button>
              ) : (
                ''
              )}
              {getValue()}
            </div>
          )
        }
      },
      {
        header: "Planned Truck Loads",
        accessorKey: "loads",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Planned Tonnes",
        accessorKey: "tonnes",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Avg Truck Loading Time",
        accessorKey: "avgTime",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Availability (Mins)",
        accessorKey: "availability",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Availability (%)",
        accessorKey: "availablePer",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Standby (Mins)",
        accessorKey: "standby",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Standby (%)",
        accessorKey: "standbyPer",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Utilisation (Mins)",
        accessorKey: "utilization",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      {
        header: "Utilisation (%)",
        accessorKey: "utilizationPer",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue, row, column }) => {
          return (
            <Input type='number' className='targets-input-control' onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()} value={getValue()}> </Input>
          );
        }
      },
      // {
      //   header: "Loads",
      //   accessorKey: "loads",
      //   enableColumnFilter: false,
      //   enableSorting: true,
      //   cell: ({ getValue, row, column }) => {
      //     return (
      //       <Input type='number' style= {{color: 'black'}} onChange={(event) => onFieldChange(row, column.id, event.target.value)} onWheel={event => event.currentTarget.blur()}  value={getValue()}> </Input>
      //     );
      //   }
      // },

      // {
      //   header: "Actions",
      //   enableColumnFilter: false,
      //   accessorKey: "",
      //   enableSorting: false,
      //   cell: (cellProps: any) => {
      //     const name = `${cellProps.row.original.name}`
      //     const id = cellProps.row.original.id
      //     return (
      //       <div className="d-flex gap-3">
      //         <Link
      //           to="#!"
      //           className="text-success"
      //           onClick={(event: any) => {
      //             event.preventDefault();
      //             const benchData = cellProps.row.original;
      //             handleOnEdit(benchData);
      //           }}
      //         >
      //           <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
      //         </Link>
      //         <DeleteButton item={name} onDelete={() => handleOnDelete(id)} />
      //       </div>
      //     );
      //   },
      // },
    ],
    []
  );

  const handleDragStart = (e, columnIndex) => {
    e.dataTransfer.setData('columnIndex', columnIndex);
  };

  const handleDragOver = (e, columnIndex) => {
    e.preventDefault();
    // const dragIndex = e.dataTransfer.getData('columnIndex');
    // if (dragIndex !== columnIndex) {
    //   const newColumns = [...truckColumns];
    //   const [draggedColumn] = newColumns.splice(dragIndex, 1);
    //   newColumns.splice(columnIndex, 0, draggedColumn);
    //   // setCurrentColumns(newColumns);
    // }
  };
  const handleDrop = (e, columnIndex) => {
    e.preventDefault();
    const dragIndex = e.dataTransfer.getData('columnIndex');
    if (parseInt(dragIndex) !== columnIndex) {
      const newColumns = [...currentTruckColumns];
      const [draggedColumn] = newColumns.splice(dragIndex, 1);
      newColumns.splice(columnIndex, 0, draggedColumn);
      // setCurrentColumns(newColumns);
      setCurrentTruckColumns(newColumns);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid className="full-height">
          <Breadcrumb breadcrumbItem="Production Targets" title="Operations" />

          <Row className="static-rows">
            <Col lg="12">
              <Form>
                <Row>
                  <Col className='d-flex flex-row-reverse'>
                    <Space>
                      <Select
                        className="basic-single"
                        id="TargetType"
                        showSearch
                        placeholder="Target Type"
                        // styles={customStyles}
                        style={{ width: '110px' }}
                        options={targetTypes}
                        value={selectedTargetType} // set selected value
                        onChange={onTargetTypeChange}
                      />
                      <DatePicker allowClear={false} value={dayjs(startDate)} format={pickerFormat} type={pickerType} onChange={onDateChange} />
                      <Segmented hidden={hideShiftSelect} className="customSegmentLabel customSegmentBackground" value={shift} onChange={onShiftChange} options={shiftsInFormat(shifts)} />
                      <Button icon={<CloudUploadOutlined />} onClick={submit} >Publish to Production</Button>
                    </Space>
                  </Col>

                </Row>
                <Row> <Card></Card></Row>
                <Row>
                  {/* TRUCK SUMMARY */}
                  <Col xs={6}>
                    <Row>
                      <Col xs={6}>
                        <Card>
                          <Col xs={6} style={{ width: '100%' }}>
                            <CardBody >
                              <Row>
                                <h4 style={{ textAlign: 'center', }} className='coolContainer'>Total Truck Planned Tonnes</h4>
                                <h3 style={{ textAlign: 'center', color: 'green' }}>{`${round2Two(summary.truckTonnes)}t` || 0}</h3>
                              </Row>
                            </CardBody>
                          </Col>
                        </Card>
                      </Col>
                      <Col xs={6}>
                        <Card>
                          <Col xs={6} style={{ width: '100%' }}>
                            <CardBody>
                              <Row>
                                <h4 style={{ textAlign: 'center', }}>Total Truck Planned Loads</h4>
                                <h3 style={{ textAlign: 'center', color: 'green' }}>{`${roundOff(summary.truckLoads)}` || 0}</h3>
                              </Row>
                            </CardBody>
                          </Col>
                        </Card>
                      </Col>
                    </Row>
                  </Col>

                  {/* EXCAVATOR SUMMARY */}
                  <Col xs={6}>
                    <Row>
                      <Col xs={6}>
                        <Card>
                          <Col xs={6} style={{ width: '100%' }}>
                            <CardBody>
                              <Row>
                                <h4 style={{ textAlign: 'center', }}>Total Excavator Tonnes</h4>
                                <h3 style={{ textAlign: 'center', color: 'green' }}>{`${round2Two(summary.diggerTonnes)}t` || 0}</h3>
                              </Row>
                            </CardBody>
                          </Col>
                        </Card>
                      </Col>
                      <Col xs={6}>
                        <Card>
                          <Col xs={6} style={{ width: '100%' }}>
                            <CardBody>
                              <Row>
                                <h4 style={{ textAlign: 'center', }}>Total Excavator Loads</h4>
                                <h3 style={{ textAlign: 'center', color: 'green' }}>{`${roundOff(summary.diggerLoads)}` || 0}</h3>
                              </Row>
                            </CardBody>
                          </Col>
                        </Card>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                {/* <Row>
                  <Col>
                    <p>  </p>
                    <div className="text-center">
                      <Button type="submit" color="success" className="save-device"> {"Save"}  </Button>
                    </div>
                  </Col>
                </Row> */}
              </Form>
            </Col>
          </Row>
          <Row className="flex-grow-1 scrollable-rows">
            <Col lg="12" style={{ height: '60vh' }}>
              <Card style={{ height: '100%', overflow: 'auto' }}>
                <CardBody>
                  <h2>Excavators</h2>
                  <TableContainer
                    columns={diggerColumns}
                    data={data && data['EXCAVATOR'] ? data['EXCAVATOR'] : []}
                    total={data && data['EXCAVATOR'] ? data['EXCAVATOR'].length : 0}
                    theadClass="theadCenterAlign"
                    isGlobalFilter={false}
                    isBordered={false}
                    isPagination={false}
                    isAddButton={false}
                  />
                </CardBody>
                <CardBody>
                  <h2>Trucks</h2>
                  <TableContainer
                    columns={currentTruckColumns}
                    data={data && data['DUMP_TRUCK'] ? data['DUMP_TRUCK'] : []}
                    total={data && data['DUMP_TRUCK'] ? data['DUMP_TRUCK'].length : 0}
                    theadClass="theadCenterAlign"
                    isGlobalFilter={false}
                    isPagination={false}
                    isAddButton={false}
                    isDraggable={true}
                    isBordered={false}
                    handleOnDragStart={handleDragStart}
                    handleOnDragOver={handleDragOver}
                    handleOnDrop={handleDrop}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container >
      </div >
    </React.Fragment >
  );
}

export default Target;
