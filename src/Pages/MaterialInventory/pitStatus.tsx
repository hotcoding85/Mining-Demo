import TableContainer from "Components/Common/TableContainer";
import { getPitStatusByCategory } from "Helpers/api_materials_helper";
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardTitle, Table } from "reactstrap";

const PitStatus = ({ shiftDate, shift }) => {

    const [data, setData] = useState([]);
    const [materialCategories, setMaterialCategories] = useState([]);

    const columns = useMemo(() => {
        return [
            {
                header: "Pit",
                accessorKey: 'locationName',
                enableColumnFilter: false,
                enableSorting: true
            },
            {
                header: "Material",
                columns: [
                    {
                        header: 'Target',
                        accessorKey: 'target',
                        enableColumnFilter: false,
                        enableSorting: true
                    },
                    {
                        header: 'Actual',
                        accessorKey: 'materialName',
                        enableColumnFilter: false,
                        enableSorting: true
                    }
                ]
            },
            ...materialCategories.map((category) => {
                return {
                    header: category,
                    columns: [
                        {
                            header: 'Target',
                            accessorKey: 'target',
                            enableColumnFilter: false,
                            enableSorting: true
                        },
                        {
                            header: 'Actual',
                            accessorKey: category,
                            enableColumnFilter: false,
                            enableSorting: true
                        }
                    ]
                }
            })
        ]
    }, [materialCategories]);

    useEffect(() => {
        getPitStatusByCategory(`${shiftDate}:${shift}`)
            // getPitStatusByCategory("2024-08-05:NS")
            .then((response) => {
                setMaterialCategories(response.materialCategories);
                setData(response.data);
            })
    }, [shiftDate, shift]);

    return (
        <React.Fragment>
            <Card>
                <CardBody>
                    <CardTitle className="h4">Pit Status</CardTitle>
                    <div className="table-responsive">
                        <TableContainer
                            columns={columns}
                            data={data || []}
                        />
                    </div>
                </CardBody>
            </Card>
        </React.Fragment>
    )
}

export default PitStatus;