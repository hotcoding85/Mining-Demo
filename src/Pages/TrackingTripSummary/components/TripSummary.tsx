import { Card, CardBody, CardTitle } from "reactstrap"
import { useEffect, useMemo, useState } from "react";
import data from "../sampleData/sampleData.json";
import HierarchycalTable, { HierarchycalTableColumn } from "./HierarchycalTable";
import _ from "lodash";
export const TripSummary = (props) => {

  const [tableData, setTableData] = useState<any>();

  const calculateSum = (key: any) => {
    let value = tableData?.reduce((sum: any, item: any) => sum + (item[key] || 0), 0);
    return typeof value === 'string' ? "" : value
  };

  function createHierarchicalData(arrays: any[]) {

    const myGroupedData = _.reduce(data[0], (acc, item) => {
      console.log(item)
      const key = `${item['equipmentName']}|${item['source']}|${item['destination']}`;
      
      if (!acc[key]) {
        acc[key] = [];
      }
      
      acc[key].push(item);
      return acc;
    }, {});

    console.log(myGroupedData)
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
        item['subRows'].map(_item => {
          _item['equipmentName'] = ''
          _item['source'] = ''
          _item['destination'] = ''

          travellings.push(_item['travelling'])
          queuings.push(_item['queuing'])
          loadings.push(_item['loading'])
          haulings.push(_item['hauling'])
          dumpings.push(_item['dumping'])
        })
      }
      item['travelling'] = calculateAverageTime(travellings)
      item['queuing'] = calculateAverageTime(queuings)
      item['loading'] = calculateAverageTime(loadings)
      item['hauling'] = calculateAverageTime(haulings)
      item['dumping'] = calculateAverageTime(dumpings)
    })
    // Convert groupedData back to an array format
    return Object.values(groupedData);
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
    const rowData = createHierarchicalData(data);
    setTableData(rowData)
  }, [])

  const columns: HierarchycalTableColumn[] = useMemo(
    () => [
      {
        header: "Equipment Name",
        accessorKey: "equipmentName",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }: any) => {
          return (
            <button
              {...{
                onClick: row.getToggleExpandedHandler(),
                style: { cursor: "pointer" },
              }}
            >
              <span className="me-2">{row.original.equipmentName}</span>
              {row.getCanExpand() ? `${row.getIsExpanded() ? "▼" : "▶"}` : ""}
            </button>
          );
        },
      },
      {
        header: "Source",
        accessorKey: "source",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Destination",
        accessorKey: "destination",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Trip",
        accessorKey: "trips",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }: any) => {
          return (
            <>
              <div className="d-flex" style={{ flexDirection: 'column' }}>
                {row.subRows.length > 0 && <span>Total</span>}
                <span>{row.original.trips}</span>
              </div>
            </>
          );
        },
      },
      {
        header: "Tonnes",
        accessorKey: "actualTonnes",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }: any) => {
          return (
            <>
              <div className="d-flex" style={{ flexDirection: 'column' }}>
                {row.subRows.length > 0 && <span>Total</span>}
                <span>{row.original.actualTonnes}</span>
              </div>
            </>
          );
        },
      },
      {
        header: "Material",
        accessorKey: "materialType",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Travelling",
        accessorKey: "travelling",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }: any) => {
          return (
            <>
              <div className="d-flex" style={{ flexDirection: 'column' }}>
                {row.subRows.length > 0 && <span>Average</span>}
                <span>{row.original.travelling}</span>
              </div>
            </>
          );
        },
      },
      {
        header: "Queuing",
        accessorKey: "queuing",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }: any) => {
          return (
            <>
              <div className="d-flex" style={{ flexDirection: 'column' }}>
                {row.subRows.length > 0 && <span>Average</span>}
                <span>{row.original.queuing}</span>
              </div>
            </>
          );
        },
      },
      {
        header: "Loading",
        accessorKey: "loading",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }: any) => {
          return (
            <>
              <div className="d-flex" style={{ flexDirection: 'column' }}>
                {row.subRows.length > 0 && <span>Average</span>}
                <span>{row.original.loading}</span>
              </div>
            </>
          );
        },
      },
      {
        header: "Hauling",
        accessorKey: "hauling",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }: any) => {
          return (
            <>
              <div className="d-flex" style={{ flexDirection: 'column' }}>
                {row.subRows.length > 0 && <span>Average</span>}
                <span>{row.original.hauling}</span>
              </div>
            </>
          );
        },
      },
      {
        header: "Dumping",
        accessorKey: "dumping",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }: any) => {
          return (
            <>
              <div className="d-flex" style={{ flexDirection: 'column' }}>
                {row.subRows.length > 0 && <span>Average</span>}
                <span>{row.original.dumping}</span>
              </div>
            </>
          );
        },
      },
      {
        header: "Mishaul?",
        accessorKey: "mishaul",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }: any) => {
          let value = row.original.mishaul;
          return (
            <>
              <span style={{ color: value == 'Yes' ? 'red' : 'white' }}>{value}</span>
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
        <HierarchycalTable
          divClassName={"descrepencies-wrapper"}
          columns={columns}
          data={tableData || []}
          // total={total || 0}
          isGlobalFilter={false}
          isPagination={true}
          isAddButton={false}
          isImportButton={true}
        />
      </CardBody>
    </Card>
  )
}