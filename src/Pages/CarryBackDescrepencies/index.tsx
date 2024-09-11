import React, { useCallback, useMemo, useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { TextColor } from "Components/Charts/interfaces/general";
import { LineGraph } from "Components/Charts/LineGraph";
import TableContainer, { TableColumn } from "Components/Common/TableContainer";
import { round2Two } from "utils/common";
import { createSelector } from "reselect";
import { useSelector } from "react-redux";

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
    const { data } = useSelector(selectProperties);
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


    const columns: TableColumn[] = useMemo(
        () => [
            {
                header: "Name",
                accessorKey: "name",
                enableColumnFilter: false,
                enableSorting: true,
            },
            {
                header: "Block ID",
                accessorKey: "blockId",
                enableColumnFilter: false,
                enableSorting: true,
            },
            {
                header: "Source",
                accessorKey: "source",
                enableColumnFilter: false,
                enableSorting: true,
            },
            {
                header: "Category",
                accessorKey: "category",
                enableColumnFilter: false,
                enableSorting: true,
                cell: (cellProps: any) => {
                    return (
                        <div className="badge badge-soft-primary font-size-11 m-1">
                            {cellProps.row.original.category}
                        </div>
                    );
                },
            },
            {
                header: "Grade",
                accessorKey: "augt",
                enableColumnFilter: false,
                enableSorting: true,
                cell: (cellProps: any) => {
                    const augt = cellProps.row.original.augt as number
                    return (
                        <div style={{ textAlign: 'right' }}>{round2Two(augt)}</div>
                    )
                }
            },
            {
                header: "Density",
                accessorKey: "density",
                enableColumnFilter: false,
                enableSorting: true,
                cell: (cellProps: any) => {
                    const density = cellProps.row.original.density as number
                    return (
                        <div style={{ textAlign: 'right' }}>{round2Two(density)}</div>
                    )
                }
            },
            {
                header: "Tonnes",
                accessorKey: "tonnes",
                enableColumnFilter: false,
                enableSorting: true,
                cell: (cellProps: any) => {
                    const tonnes = cellProps.row.original.tonnes as number
                    return (
                        <div style={{ textAlign: 'right' }}>{round2Two(tonnes)}</div>
                    )
                }
            },
            {
                header: "Volume",
                accessorKey: "volume",
                enableColumnFilter: false,
                enableSorting: true,
                cell: (cellProps: any) => {
                    const volume = cellProps.row.original.volume as number
                    return (
                        <div style={{ textAlign: 'right' }}>{round2Two(volume)}</div>
                    )
                }
            },
            {
                header: "Status",
                accessorKey: "status",
                enableColumnFilter: false,
                enableSorting: true,
                cell: (cellProps: any) => {
                    return (
                        <div className="badge badge-soft-primary font-size-11 m-1">
                            {cellProps.row.original.status}
                        </div>
                    );
                },
            },
            {
                header: "Actions",
                enableColumnFilter: false,
                accessorKey: "",
                enableSorting: false,
                // cell: (cellProps: any) => {
                //   const name = `${cellProps.row.original.name}`;
                //   const id = cellProps.row.original.id;
                //   return (
                //     <div className="d-flex gap-3">
                //       <Link
                //         to="#!"
                //         className="text-success"
                //         onClick={(event: any) => {
                //           event.preventDefault();
                //           const benchData = cellProps.row.original;
                //           handleOnEdit(benchData);
                //         }}
                //       >
                //         <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
                //       </Link>
                //       <DeleteButton item={name} onDelete={() => handleOnDelete(id)} />
                //     </div>
                //   );
                // },
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
                                <CardBody>
                                    <TableContainer
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