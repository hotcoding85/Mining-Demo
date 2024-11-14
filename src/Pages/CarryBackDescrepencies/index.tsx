import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { TextColor } from "Components/Charts/interfaces/general";
import { LineGraph } from "Components/Charts/LineGraph";
import HierarchycalTable, { HierarchycalTableColumn } from "Components/Common/HierchycalTable";
import _ from "lodash";
import { updateDataWithRandomValues, data } from "./sampleData";
const CarryBackDescrepencies = (props: any) => {

  const [bench, setBench] = useState<any>();

  const [modal, setModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [importCsvModal, setImportFileModal] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any>();

  document.title = "Pre Starts | FMS Live";
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "#9CA3B1",
          lineWidth: 0.2,
        },
      },
      y: {
        grid: {
          display: true,
          color: "#9CA3B1",
          lineWidth: 0.2,
        },
      },
    },
  };

  const textColor2: TextColor[] = [
    { text: "With Discrepency", color: "#CF1322" },
    { text: "Actual", color: "#389E0D" },
  ];

  const lineData = {
    labels: [
      "DT01",
      "DT02",
      "DT03",
      "DT04",
      "DT05",
      "DT06",
      "DT07",
      "DT08",
      "DT09",
      "DT10",
      "DT11",
      "DT12",
    ],
    datasets: [
      {
        label: "Plan",
        data: [23, 21, 15, 18, 20, 21, 23, 15, 20, 13, 5, 3],
        borderColor: "#CF1322",
        backgroundColor: "rgba(24, 144, 255, 0.2)",
        fill: true,
        tension: 0,
        pointRadius: 4,
      },
      {
        label: "Actual",
        data: [21, 18, 14, 20, 19, 22, 19, 13, 18, 9, 3, 3],
        borderColor: "#389E0D",
        backgroundColor: "rgba(0, 80, 179, 0.2)",
        fill: true,
        tension: 0,
        pointRadius: 4,
      },
    ],
  };
  const parseBenchData = (doc) => {
    return {
      id: (doc && doc.id) || "",
      name: (doc && doc.name) || "",
      category: (doc && doc.category) || "",
      elevation: (doc && doc.elevation) || "",
      status: (doc && doc.status) || "ACTIVE",
    };
  };

  const importCsvModalToggle = useCallback(() => {
    setImportFileModal(!importCsvModal);
  }, [importCsvModal]);

  const toggle = useCallback(() => {
    setModal(!modal);
  }, [modal]);

  const handleOnEdit = useCallback(
    (arg: any) => {
      // reading the row data from table
      const bench = parseBenchData(arg);
      // saving to state
      setBench(bench);
      // setting the dialog to show as edit
      setIsEdit(true);
      // show dialog
      toggle();
    },
    [toggle]
  );

  // const handleOnDelete = useCallback(
  //     (arg: string) => {
  //         dispatch(removeBench(arg));
  //         onPaginationPageChange(1);
  //     },
  //     [dispatch]
  // );

  const calculateSum = (key: any) => {
    if (key === 'equipmentName' || key === 'loadsCompleted' || key === 'trips' || key === 'materialType') return ''
    let value = tableData?.reduce((sum: any, item: any) => sum + (item[key] || 0), 0);
    return typeof value === 'string' ? "" : value
  };

  const columns: HierarchycalTableColumn[] = useMemo(
    () => [
      {
        header: "Model",
        accessorKey: "model",
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
              <span className="me-2">{row.original.model}</span>
              {row.getCanExpand() ? `${row.getIsExpanded() ? "▼" : "▶"}` : ""}
            </button>
          );
        },
        footer: "Total"
      },
      {
        header: "Loads Completed",
        accessorKey: "loadsCompleted",
        enableColumnFilter: false,
        enableSorting: true,
        footer: calculateSum("loadsCompleted")
      },
      {
        header: "Material Type",
        accessorKey: "materialType",
        enableColumnFilter: false,
        enableSorting: true,
        footer: calculateSum("materialType")
      },
      {
        header: "Actual(Tonnes)",
        accessorKey: "actual",
        enableColumnFilter: false,
        enableSorting: true,
        footer: calculateSum("actual")
      },
      {
        header: "Planned (Tonnes)",
        accessorKey: "planned",
        enableColumnFilter: false,
        enableSorting: true,
        footer: calculateSum("planned")
      },
      {
        header: "Tonnes Indicated",
        accessorKey: "tonnesIndicated",
        enableColumnFilter: false,
        enableSorting: true,
        footer: calculateSum("tonnesIndicated")
      },
      {
        header: "Avg Load Carried Back",
        accessorKey: "avgLoadCarriedBack",
        enableColumnFilter: false,
        enableSorting: true,
        footer: calculateSum("avgLoadCarriedBack")
      },
      {
        header: "Actual Tonnes",
        accessorKey: "actualTonnes",
        enableColumnFilter: false,
        enableSorting: true,
        footer: calculateSum("actualTonnes")
      },
    ],
    // [handleOnEdit, handleOnDelete]
    [tableData]
  );

  const handleOnAdd = () => {
    // setting as it is not edit
    setIsEdit(false);
    // clearing the resource state if previous value is set
    setBench("");
    // show dialog
    toggle();
  };

  const handleOnImport = () => {
    // setting as it is not edit
    setIsEdit(false);
    // clearing the resource state if previous value is set
    setBench("");
    // show import csv dialog
    importCsvModalToggle();
  };

  function createHierarchicalData(arrays) {
    return arrays.map((subArray: any) => {
      const result = {
        id: "1",
        subRows: subArray
      };

      subArray.reduce((acc, subRow) => {
        Object.entries(subRow).forEach(([key, value]: any) => {
          if (key === 'id' || key === 'subRows') {
            result[key] = value;
          } else if (key === 'equipmentName' || key === 'loadsCompleted' || key === 'trips' || key === 'materialType') {
            result[key] = '';
          }
          else if (!isNaN(value)) {
            result[key] = (result[key] || 0) + parseFloat(value);
          } else {
            result[key] = value;
          }
        });
        return acc;
      }, result);
      return result;
    });
  }

  useEffect(() => {
    const _data = updateDataWithRandomValues(data)
    const rowData = createHierarchicalData(_data);
    setTableData(rowData)
  }, [])

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Dynamic Dispatch" breadcrumbItem="Carryback Descrepencies" />
          <Row>
            <Col lg="12">
              <Card className="descrepencies-wrapper">
                <CardBody>
                  <HierarchycalTable
                    divClassName={"descrepencies-wrapper"}
                    columns={columns}
                    data={tableData || []}
                    // total={total || 0}
                    isGlobalFilter={true}
                    handleOnAddClick={handleOnAdd}
                    handleOnImportClick={handleOnImport}
                    isPagination={false}
                    isAddButton={true}
                    buttonName="New Bench"
                    isImportButton={true}
                    SearchPlaceholder={"Quick Search"}
                    importButtonName="Import Benches"
                  />
                </CardBody>
              </Card>
            </Col>
            <Col lg="6">
              <div>
                <LineGraph
                  header="ROM Discrepancies"
                  data={lineData}
                  options={lineOptions}
                  widthVal={'100%'}
                  textColor={textColor2}
                  backgroundCol={"#24314D"}
                />
              </div>
            </Col>
            <Col lg="6">
              <div>
                <LineGraph
                  header="Waste Discrepancies"
                  data={lineData}
                  options={lineOptions}
                  widthVal={'100%'}
                  textColor={textColor2}
                  backgroundCol={"#24314D"}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment >
  )
}

export default CarryBackDescrepencies;