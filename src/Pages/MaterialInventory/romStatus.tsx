import TableContainer from "Components/Common/TableContainer";
import { getROMStatus } from "Helpers/api_materials_helper";
import React, { useEffect, useState } from "react";
import { Card, CardBody, CardTitle } from "reactstrap";

const columns = [
    {
        header: "Name",
        accessorKey: "materialName",
        enableColumnFilter: false,
        enableSorting: true
    },
    {
        header: "Grade",
        accessorKey: "materialGrade",
        enableColumnFilter: false,
        enableSorting: true
    },
    {
        header: "From Pit",
        accessorKey: "fromPit",
        enableColumnFilter: false,
        enableSorting: true
    },
    {
        header: "Into Crusher",
        accessorKey: "intoCrusher",
        enableColumnFilter: false,
        enableSorting: true
    },
    {
        header: "Current Stock",
        accessorKey: "currentStock",
        enableColumnFilter: false,
        enableSorting: true
    }
]

const RomStatus = ({ shiftDate, shift }) => {

    const [data, setData] = useState([]);

    useEffect(() => {
        getROMStatus(`${shiftDate}:${shift}`)
            // getROMStatus("2024-08-05:NS")
            .then((response) => {
                setData(response.data);
            })
            .catch((error) => {
                console.error(error);
            })
    }, [shiftDate, shift]);

    return (
        <React.Fragment>
            <Card>
                <CardBody>
                    <CardTitle className="h4">ROM Status</CardTitle>
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

export default RomStatus;