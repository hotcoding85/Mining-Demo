import React, { useCallback, useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { TextColor } from "Components/Charts/interfaces/general";
import { LineGraph } from "Components/Charts/LineGraph";
import { round2Two } from "utils/common";
import { createSelector } from "reselect";
import { useSelector } from "react-redux";
import HierarchycalTable, { HierarchycalTableColumn } from "Components/Common/HierchycalTable";
const CarryBackDescrepencies = (props: any) => {

    const [bench, setBench] = useState<any>();

    const [modal, setModal] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [importCsvModal, setImportFileModal] = useState<boolean>(false);


    const selectProperties = createSelector(
        (state: any) => state.Benches,
        (benches) => ({
            data: benches.data,
            total: benches.total,
            loading: benches.loading,
        })
    );
    // const { data } = useSelector(selectProperties);

    const data: any = [
        {
          "id": "1",
          "model": "HD1500",
          "equipmentName": "DT101",
          "loadsCompleted": "9/35",
          "trips": "Trip1",
          "materialType": "Waste",
          "actual": "38,125",
          "planned": "35,000",
          "tonnesIndicated": "84.2",
          "avgLoadCarriedBack": "1.4",
          "actualTonnes": "82.8",
          "subRows": [
            {
                "id": "1a",
              "model": "HD1500",
              "equipmentName": "DT101",
              "loadsCompleted": "9/35",
              "trips": "Trip1",
              "materialType": "Waste",
              "actual": "38,125",
              "planned": "35,000",
              "tonnesIndicated": "84.2",
              "avgLoadCarriedBack": "1.4",
              "actualTonnes": "82.8"
            },
            {
                "id": "1b",
              "model": "HD1500",
              "equipmentName": "DT101",
              "loadsCompleted": "9/35",
              "trips": "Trip1",
              "materialType": "Waste",
              "actual": "38,125",
              "planned": "35,000",
              "tonnesIndicated": "84.2",
              "avgLoadCarriedBack": "1.4",
              "actualTonnes": "82.8"
            }
          ]
        },
        {
           "id": "2",
          "model": "HD1500",
          "equipmentName": "DT101",
          "loadsCompleted": "9/35",
          "trips": "Trip1",
          "materialType": "Waste",
          "actual": "38,125",
          "planned": "35,000",
          "tonnesIndicated": "84.2",
          "avgLoadCarriedBack": "1.4",
          "actualTonnes": "82.8",
          "subRows": [
            {
              "id": "2a",
              "model": "HD1500",
              "equipmentName": "DT101",
              "loadsCompleted": "9/35",
              "trips": "Trip1",
              "materialType": "Waste",
              "actual": "38,125",
              "planned": "35,000",
              "tonnesIndicated": "84.2",
              "avgLoadCarriedBack": "1.4",
              "actualTonnes": "82.8"
            },
            {
              "id": "2b",
              "model": "HD1500",
              "equipmentName": "DT101",
              "loadsCompleted": "9/35",
              "trips": "Trip1",
              "materialType": "Waste",
              "actual": "38,125",
              "planned": "35,000",
              "tonnesIndicated": "84.2",
              "avgLoadCarriedBack": "1.4",
              "actualTonnes": "82.8"
            }
          ]
        },
        {
          "id": "3",
          "model": "HD1500",
          "equipmentName": "DT101",
          "loadsCompleted": "9/35",
          "trips": "Trip1",
          "materialType": "Waste",
          "actual": "38,125",
          "planned": "35,000",
          "tonnesIndicated": "84.2",
          "avgLoadCarriedBack": "1.4",
          "actualTonnes": "82.8",
          "subRows": [
            {
              "id": "3a",
              "model": "HD1500",
              "equipmentName": "DT101",
              "loadsCompleted": "9/35",
              "trips": "Trip1",
              "materialType": "Waste",
              "actual": "38,125",
              "planned": "35,000",
              "tonnesIndicated": "84.2",
              "avgLoadCarriedBack": "1.4",
              "actualTonnes": "82.8"
            },
            {
              "id": "3a",
              "model": "HD1500",
              "equipmentName": "DT101",
              "loadsCompleted": "9/35",
              "trips": "Trip1",
              "materialType": "Waste",
              "actual": "38,125",
              "planned": "35,000",
              "tonnesIndicated": "84.2",
              "avgLoadCarriedBack": "1.4",
              "actualTonnes": "82.8"
            }
          ]
        }
      ];

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
        { text: "Plan", color: "#CF1322" },
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
                {row.getCanExpand() ? `${row.getIsExpanded() ? "▼" : "▶"}` : ""}
                <span className="ms-2">{row.original.model}</span>
              </button>
            );
          },
        },
        {
          header: "Equipment Name",
          accessorKey: "equipmentName",
          enableColumnFilter: false,
          enableSorting: true,
        },
        {
          header: "Loads Completed",
          accessorKey: "loadsCompleted",
          enableColumnFilter: false,
          enableSorting: true,
        },
        {
          header: "Trips",
          accessorKey: "trips",
          enableColumnFilter: false,
          enableSorting: true,
        },
        {
          header: "Material Type",
          accessorKey: "materialType",
          enableColumnFilter: false,
          enableSorting: true,
        },
        {
          header: "Actual(Tonnes)",
          accessorKey: "actual",
          enableColumnFilter: false,
          enableSorting: true,
        },
        {
          header: "Planned (Tonnes)",
          accessorKey: "planned",
          enableColumnFilter: false,
          enableSorting: true,
        },
        {
          header: "Tonnes Indicated",
          accessorKey: "tonnesIndicated",
          enableColumnFilter: false,
          enableSorting: true,
        },
        {
          header: "Avg Load Carried Back",
          accessorKey: "avgLoadCarriedBack",
          enableColumnFilter: false,
          enableSorting: true,
        },
      ],
      // [handleOnEdit, handleOnDelete]
      []
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

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Dynamic Dispatch" breadcrumbItem="Carryback Descrepencies" />
                    <Row>
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
                        <Col lg="12">
                            <Card>
                                <CardBody className="descrepencies-wrapper">
                                    <HierarchycalTable
                                        columns={columns}
                                        data={data || []}
                                        // total={total || 0}
                                        isGlobalFilter={true}
                                        handleOnAddClick={handleOnAdd}
                                        handleOnImportClick={handleOnImport}
                                        isPagination={true}
                                        isAddButton={true}
                                        buttonName="New Bench"
                                        isImportButton={true}
                                        SearchPlaceholder={"Quick Search"}
                                        importButtonName="Import Benches"
                                    />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    )
}

export default CarryBackDescrepencies;