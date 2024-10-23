import { Col, Table } from "antd"
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {data} from "../data/sampleData";
import { Link } from "react-router-dom";
import '../styles/table.css'
interface PassData {
    tonnes: number;
    time: string;
}
const ProfileTableView = (props) => {
    const maxTotalPasses = useRef<number>(1)
    const [tableData, setTableData] = useState<any>();

    function createHierarchicalData(arrays: any[], models: any[]) {
        const getMaxTotalPasses = (data: any): number => {
            return Math.max(...data[0].map(item => parseInt(item.totalPasses)));
        };
          
        maxTotalPasses.current = getMaxTotalPasses(arrays);
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
                trips: subRow['trips'],
                rowCount: 0, // Initialize row count
              };
            }
    
            // Add subRow to subRows for the corresponding id
            groupedData[id].subRows.push(subRow);
    
            // Increment the row count
            groupedData[id].rowCount += 1;
    
            // Aggregate numeric fields, except the 'trips' field
            let count = 0
            Object.entries(subRow).forEach(([key, value]: [string, any]) => {
              count ++
              if (key === 'id' || key === 'subRows' || key === 'trips' || key === 'truck' || key === 'equipmentName' || key === 'materialType' || key === 'mishaul') {
                if (key === 'truck') {
                  groupedData[id][key] = groupedData[id].rowCount
                }
                else if (key === 'materialType' || key === 'mishaul') {
                  groupedData[id][key] = ''
                }
                else if (key === 'trips') {
                    groupedData[id][key] = count
                }
                return; // Skip 'id', 'subRows', and 'truck'
              }
    
              if (!isNaN(value)) {
                // If the value is numeric, sum it
                groupedData[id][key] = ((groupedData[id][key] || 0) + parseFloat(value)) * 100 / 100;
              } else if (typeof value === 'string' && !groupedData[id][key]) {
                // For non-numeric fields, keep the first encountered value
                groupedData[id][key] = value;
              }
            });
          });
        });
        function parsePass(passString: string): PassData {
            const [tonnesStr, timeStr] = passString.split(" / ");
            const tonnes = parseFloat(tonnesStr.replace("t", ""));
            return { tonnes, time: timeStr };
        }
        function formatPass(passData: PassData): string {
            return `${passData.tonnes.toFixed(2)}t / ${passData.time}`;
        }
        function calculateAveragePass(group: any, maxTotalPasses: number) {
            const passAverages: { [key: string]: PassData } = {};
          
            // Initialize sums and counters for each pass
            const passCounts: { [key: string]: number } = {};
          
            for (let i = 1; i <= maxTotalPasses; i++) {
              const passKey = `pass${i}`;
              passAverages[passKey] = { tonnes: 0, time: "" };
              passCounts[passKey] = 0; // Initialize counter for each pass
            }
          
            // Loop over subRows to calculate total tonnes for each pass
            group.subRows.forEach((subRow: any) => {
              for (let i = 1; i <= maxTotalPasses; i++) {
                const passKey = `pass${i}`;
                if (subRow[passKey]) {
                  const passData = parsePass(subRow[passKey]);
                  passAverages[passKey].tonnes += passData.tonnes;
                  passAverages[passKey].time = passData.time; // Keep the same time for now
                  passCounts[passKey]++; // Increment the count for each pass that exists
                }
              }
            });
          
            // Calculate average for each pass, considering only the subRows with that pass data
            for (let i = 1; i <= maxTotalPasses; i++) {
              const passKey = `pass${i}`;
              const count = passCounts[passKey];
              if (count > 0) { // Only calculate average if there are subRows with data for this pass
                passAverages[passKey].tonnes /= count;
              }
            }
          
            // Replace the parent's pass data with the averages
            for (let i = 1; i <= maxTotalPasses; i++) {
              const passKey = `pass${i}`;
              if (passCounts[passKey] > 0 && passAverages[passKey].tonnes > 0) {
                group[passKey] = formatPass(passAverages[passKey]);
              }
            }
        }
          
        function processGroupedData(groupedData: any) {
            // Loop through each group and calculate the averages
            Object.keys(groupedData).forEach((groupId) => {
              const group = groupedData[groupId];
              calculateAveragePass(group, maxTotalPasses.current);
            });
          
            return groupedData;
        }
        Object.values(groupedData).map(item => {
            const loadings: any = []
            if (item['subRows'].length > 0) {
                for (let i = 0 ; i < item['subRows'].length ; i ++){
                    const _item = item['subRows'][i]
                    _item['equipmentName'] = ''
                    _item['source'] = ''
            
                    loadings.push(_item['loading'])

                }
            }
        
            item['loading'] = calculateAverageTime(loadings)
        })
    
        const convertToNestedFormat = (data) => {
            console.log(data)
            return Object.keys(data).map((key, index) => {
                const item = data[key];
                const parentRow = {
                key: index + 1, // Assign a unique key for each top-level item
                equipmentName: item.equipmentName,
                source: item.source,
                rowCount: item.rowCount,
                trips: item.trips,
                materialType: item.materialType,
                actualTonnes: item.actualTonnes,
                loading: item.loading,
                truck: item.subRows && item.subRows.length > 0 ? item.subRows.length : item.truck,
                children: item.subRows.map((subRow, subIndex) => ({
                    key: `${index + 1}-${subIndex + 1}`, // Assign a unique key for each sub-row
                    equipmentName: subRow.equipmentName,
                    trips: (subIndex + 1),
                    materialType: subRow.materialType,
                    actualTonnes: subRow.actualTonnes,
                    loading: subRow.loading,
                    source: subRow.source,
                    truck: subRow.truck,
                    ...Array.from({ length: maxTotalPasses.current }, (_, passIndex) => ({
                        [`pass${passIndex + 1}`]: subRow[`pass${passIndex + 1}`] || ""
                    })).reduce((acc, cur) => ({ ...acc, ...cur }), {})
                }))
                };

                // Add averaged pass data to the parent row
                for (let i = 1; i <= maxTotalPasses.current; i++) {
                    parentRow[`pass${i}`] = item[`pass${i}`] || "";
                }
            
                return parentRow;
            });
        };
        // Filter the grouped data if models are provided
        const filteredGroupedData = models.length > 0
        ? Object.keys(groupedData).reduce((acc, key) => {
            const group = groupedData[key];
            if (models.includes(group.equipmentName)) {
                acc[key] = group;
            }
            return acc;
        }, {})
        : groupedData;
        // Convert groupedData back to an array format
        return convertToNestedFormat(processGroupedData(filteredGroupedData));
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
      let _models = []; 
      if (props.selectedValues && props.selectedValues['fleet'] &&  props.selectedValues['fleet'].length > 0) {
        _models = props.selectedValues['fleet']
      }
      console.log(_models)
      const _data = JSON.parse(JSON.stringify(data));
      const rowData = createHierarchicalData(_data, _models);
      setTableData(rowData)

      let _columns: any = [
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
              title: "Truck",
              dataIndex: "truck",
              enableColumnFilter: false,
              enableSorting: true,
              render: (text, row) => {
                  return (
                      <>
                      <div className="d-flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
                          {row.children ? <><span>Total</span><span>{text}</span></> : <>{text}</>}
                      </div>
                      </>
                  );
                  },
          },
          {
              title: "Trip sequence",
              dataIndex: "trips",
              enableColumnFilter: false,
              enableSorting: true,
              render: (text, row) => {
                  let value = row.mishaul;
                  let color = value == 'Yes' ? 'red' : 'white'
                  return (
                      <>
                      <div className="d-flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
                          {row.children && row.children.length > 0 ? <></> : text}
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
                      <span className={`font-color-${color}`} style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{row.actualTonnes}</span>
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
                  <span className={`font-color-${color}`} style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{row.materialType}</span>
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
                      <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{row.loading}</span>
                  </div>
                  </>
              );
              },
          },
      ]
      for (let i = 0 ; i < maxTotalPasses.current ; i ++) {
          _columns.push({
              title: "Pass" + (i + 1),
              dataIndex: "pass" + (i + 1),
              enableColumnFilter: false,
              enableSorting: true,
              render: (text, row) => {
              let color = 'white'
              return (text ? 
                  <>
                  <div className="d-flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
                      {row.children && row.children.length > 0 && <span>Average</span>}
                      <div className={`font-color-${color}`} style={{fontSize: '12px', whiteSpace: 'nowrap' }}>{text}</div>
                  </div>
                  </>
                  :
                  <>_</>
              );
              },
          })
      }

      setColumns(_columns)
    }, [props.selectedValues])
    
    const [columns, setColumns] = useState<any>(null);

    return <Fragment>
          <Table
            className="table-responsive profile-table-view"
            columns={columns}
            dataSource={tableData}
          />
    </Fragment>
}

export default ProfileTableView;