import { Card, CardBody, CardTitle, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap"
import { Fragment, useEffect, useMemo, useState } from "react";
import data from "../sampleData/sampleData.json";
import { Link } from "react-router-dom";
import { Button, Col, Row, Table } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { SearchDropdown } from "../../../Components/Common/Dropdown";
export const TripSummary = (props) => {

  const [tableData, setTableData] = useState<any>();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const filters = {
    model: [
      {
        label: "HD1500",
        value: "HD1500",
      },
      {
        label: "HD785",
        value: "HD785",
      },
    ],
    fleet: [
      {
        label: "Fleet1",
        value: "TD001",
      },
      {
        label: "Fleet2",
        value: "TD002",
      },
      {
        label: "Fleet3",
        value: "TD003",
      },
    ],
  };

  function createHierarchicalData(arrays: any[]) {

    // Create a map to group items by 'id'
    const groupedData: Record<string, any> = {};

    arrays.forEach((subArray: any) => {
      subArray.forEach((subRow: any) => {
        const id = subRow.id;

        if (!groupedData[id]) {
          // Initialize the result object if it doesn't exist for this id
          groupedData[id] = {
            id,
            subRows: [],
            equipmentName: subRow['equipmentName'],
            source: subRow['source'],
            destination: subRow['destination'],
            rowCount: 0, // Initialize row count
          };
        }

        // Add subRow to subRows for the corresponding id
        groupedData[id].subRows.push(subRow);

        // Increment the row count
        groupedData[id].rowCount += 1;

        // Aggregate numeric fields, except the 'trips' field
        Object.entries(subRow).forEach(([key, value]: [string, any]) => {
          if (key === 'id' || key === 'subRows' || key === 'trips' || key === 'equipmentName' || key === 'materialType' || key === 'mishaul') {
            if (key === 'trips') {
              groupedData[id][key] = groupedData[id].rowCount
            }
            else if (key === 'materialType' || key === 'mishaul') {
              groupedData[id][key] = ''
            }
            return; // Skip 'id', 'subRows', and 'trips'
          }

          if (!isNaN(value)) {
            // If the value is numeric, sum it
            groupedData[id][key] = (groupedData[id][key] || 0) + parseFloat(value);
          } else if (typeof value === 'string' && !groupedData[id][key]) {
            // For non-numeric fields, keep the first encountered value
            groupedData[id][key] = value;
          }
        });
      });
    });

    Object.values(groupedData).map(item => {
      const travellings: any = []
      const queuings: any = []
      const loadings: any = []
      const haulings: any = []
      const dumpings: any = []
      const durations: any = []
      if (item['subRows'].length > 0) {
        for (let i = 0 ; i < item['subRows'].length ; i ++){
          const _item = item['subRows'][i]
          _item['equipmentName'] = ''
          _item['source'] = ''
          _item['destination'] = ''

          travellings.push(_item['travelling'])
          queuings.push(_item['queuing'])
          loadings.push(_item['loading'])
          haulings.push(_item['hauling'])
          dumpings.push(_item['dumping'])
        }
      }

      item['travelling'] = calculateAverageTime(travellings)
      item['queuing'] = calculateAverageTime(queuings)
      item['loading'] = calculateAverageTime(loadings)
      item['hauling'] = calculateAverageTime(haulings)
      item['dumping'] = calculateAverageTime(dumpings)
    })

    const convertToNestedFormat = (data) => {
      return Object.keys(data).map((key, index) => {
        const item = data[key];
        return {
          key: index + 1, // Assign a unique key for each top-level item
          equipmentName: item.equipmentName,
          source: item.source,
          destination: item.destination,
          rowCount: item.rowCount,
          loadsCompleted: item.loadsCompleted,
          trips: item.trips,
          materialType: item.materialType,
          actual: item.actual,
          planned: item.planned,
          tonnesIndicated: item.tonnesIndicated,
          avgLoadCarriedBack: item.avgLoadCarriedBack,
          actualTonnes: item.actualTonnes,
          travelling: item.travelling,
          queuing: item.queuing,
          loading: item.loading,
          hauling: item.hauling,
          dumping: item.dumping,
          mishaul: item.mishaul,
          children: item.subRows.map((subRow, subIndex) => ({
            key: `${index + 1}-${subIndex + 1}`, // Assign a unique key for each sub-row
            equipmentName: subRow.equipmentName,
            loadsCompleted: subRow.loadsCompleted,
            trips: subRow.trips,
            materialType: subRow.materialType,
            actual: subRow.actual,
            planned: subRow.planned,
            tonnesIndicated: subRow.tonnesIndicated,
            avgLoadCarriedBack: subRow.avgLoadCarriedBack,
            actualTonnes: subRow.actualTonnes,
            travelling: subRow.travelling,
            queuing: subRow.queuing,
            loading: subRow.loading,
            hauling: subRow.hauling,
            dumping: subRow.dumping,
            mishaul: subRow.mishaul,
            source: subRow.source,
            destination: subRow.destination
          }))
        };
      });
    };
    // Convert groupedData back to an array format
    return convertToNestedFormat(groupedData);
  }

  function calculateAverageTime(times: string[]): string {
    // Check if the input array is empty
    if (times.length === 0) {
      return "00:00:00"; // Return "00:00:00" for empty input
    }

    // Helper function to convert "HH:MM:SS" into total seconds
    const timeToSeconds = (time: string): number => {
      const [hours, minutes, seconds] = time.split(":").map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    };

    // Helper function to convert total seconds back to "HH:MM:SS"
    const secondsToTime = (totalSeconds: number): string => {
      const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
      const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
      const seconds = (totalSeconds % 60).toString().padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    };

    // Convert all times to seconds and sum them
    const totalSeconds = times.reduce((acc, time) => acc + timeToSeconds(time), 0);

    // Calculate the average seconds
    const averageSeconds = totalSeconds / times.length;

    // Convert average seconds back to "HH:MM:SS" format
    return secondsToTime(Math.floor(averageSeconds));
  }



  useEffect(() => {
    const _data = JSON.parse(JSON.stringify(data));
    const rowData = createHierarchicalData(_data);
    setTableData(rowData)
  }, [])

  const columns: any[] = useMemo(
    () => [
      {
        title: "Equipment Name",
        dataIndex: "equipmentName",
        enableColumnFilter: false,
        enableSorting: true,
        render: (text, row) => {
          return (
              <span className="me-2">{text}</span>
          );
        },
      },
      {
        title: "Source",
        dataIndex: "source",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        title: "Destination",
        dataIndex: "destination",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        title: "Trip",
        dataIndex: "trips",
        enableColumnFilter: false,
        enableSorting: true,
        render: (text, row) => {
          return (
            <>
              <div className="d-flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
                {row.children ? <><span>Total</span><span>{text}</span></> : <></>}
              </div>
            </>
          );
        },
      },
      {
        title: "Tonnes",
        dataIndex: "actualTonnes",
        enableColumnFilter: false,
        enableSorting: true,
        render: (text, row) => {
          let value = row.mishaul;
          let color = value == 'Yes' ? 'red' : 'white'
          return (
            <>
              <div className="d-flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
                {row.children && row.children.length > 0 && <span>Total</span>}
                <span className={`font-color-${color}`} style={{ color: `${color} !important` }}>{row.actualTonnes}</span>
              </div>
            </>
          );
        },
      },
      {
        title: "Material",
        dataIndex: "materialType",
        enableColumnFilter: false,
        enableSorting: true,
        render: (text, row) => {
          let value = row.mishaul;
          let color = value == 'Yes' ? 'red' : 'white'
          return (
            <>
              <span className={`font-color-${color}`} style={{ color: `${color} !important` }}>{row.materialType}</span>
            </>
          );
        },
      },
      {
        title: "Travelling",
        dataIndex: "travelling",
        enableColumnFilter: false,
        enableSorting: true,
        render: (text, row) => {
          let value = row.mishaul;
          let color = value == 'Yes' ? 'red' : 'white'
          return (
            <>
              <div className="d-flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
                {row.children && row.children.length > 0 && <span>Average</span>}
                <span className={`font-color-${color}`} style={{ color: `${color} !important` }}>{row.travelling}</span>
              </div>
            </>
          );
        },
      },
      {
        title: "Queuing",
        dataIndex: "queuing",
        enableColumnFilter: false,
        enableSorting: true,
        render: (text, row) => {
          let value = row.mishaul;
          let color = value == 'Yes' ? 'red' : 'white'
          return (
            <>
              <div className="d-flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
                {row.children && row.children.length > 0 && <span>Average</span>}
                <span className={`font-color-${color}`} style={{ color: `${color} !important` }}>{row.queuing}</span>
              </div>
            </>
          );
        },
      },
      {
        title: "Loading",
        dataIndex: "loading",
        enableColumnFilter: false,
        enableSorting: true,
        render: (text, row) => {
          let value = row.mishaul;
          let color = value == 'Yes' ? 'red' : 'white'
          return (
            <>
              <div className="d-flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
                {row.children && row.children.length > 0 && <span>Average</span>}
                <span className={`font-color-${color}`} style={{ color: `${color} !important` }}>{row.loading}</span>
              </div>
            </>
          );
        },
      },
      {
        title: "Hauling",
        dataIndex: "hauling",
        enableColumnFilter: false,
        enableSorting: true,
        render: (text, row) => {
          let value = row.mishaul;
          let color = value == 'Yes' ? 'red' : 'white'
          return (
            <>
              <div className="d-flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
                {row.children && row.children.length > 0 && <span>Average</span>}
                <span className={`font-color-${color}`} style={{ color: `${color} !important` }}>{row.hauling}</span>
              </div>
            </>
          );
        },
      },
      {
        title: "Dumping",
        dataIndex: "dumping",
        enableColumnFilter: false,
        enableSorting: true,
        render: (text, row) => {
          let value = row.mishaul;
          let color = value == 'Yes' ? 'red' : 'white'
          return (
            <>
              <div className="d-flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
                {row.children && row.children.length > 0 && <span>Average</span>}
                <span className={`font-color-${color}`} style={{ color: `${color} !important` }} >{row.dumping}</span>
              </div>
            </>
          );
        },
      },
      {
        title: "Mishaul?",
        dataIndex: "mishaul",
        enableColumnFilter: false,
        enableSorting: true,
        render: (text, row) => {
          let value = row.mishaul;
          let color = value == 'Yes' ? 'red' : 'white'
          return (
            <>
              <span className={`font-color-${color}`} style={{ color: `${color}; !important` }}>{value}</span>
            </>
          );
        },
      },
      {
        title: "Action",
        dataIndex: "",
        enableColumnFilter: false,
        enableSorting: true,
        render: (text, row) => {
          return (
            <>
              {
                row.children ? <></> : <Link to={'/route-replay'}>Review trip</Link>
              }

            </>
          );
        },
      },
    ],
    // [handleOnEdit, handleOnDelete]
    [tableData]
  );

  return (
    <Card>
      <CardBody>
        <Fragment>
          <Row className="px-3 py-3 mx-0 mb-4 align-items-center report-head justify-content-space-between descrepencies-wrapper" style={{justifyContent: 'space-between'}}>
            <Col md={6} className="ps-0">
              <h3 className="report-heading mb-0" style={{fontFamily: "Montserrat", fontWeight: 'bold', fontSize:' large'}}>
                  Trip Summary
              </h3>
            </Col>
            <Col md={6} className="pe-0">
              <div className="d-flex align-items-center gap-3 justify-content-end">
                <SearchDropdown
                  itemsGroup={filters}
                  disableTitle={false}
                  disableDivider={false}
                />

                <div className="export-csv">
                  <Button color="primary">
                    Export CSV
                    <UploadOutlined />
                  </Button>
                </div>
                <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                    <DropdownToggle caret size="md">
                        Show/Hide Columns
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem>Day</DropdownItem>
                        <DropdownItem>Night</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
              </div>
            </Col>
          </Row>
          <Table
            className="table-responsive trucking-trip-summary"
            columns={columns}
            dataSource={tableData}
          />
        </Fragment>
      </CardBody>
    </Card>
  )
}