import TableContainer from "Components/Common/TableContainer"

const VehicleReasons = ({ data, title }) => {
    const columns: any = [
        {
            header: "Vehicle",
            accessorKey: "vehicleName",
            enableColumnFilter: false,
            enableSorting: true,
            size: 40
        },
        {
            header: "Reason",
            accessorKey: "reason",
            enableColumnFilter: false,
            enableSorting: true
        }
    ]

    const getFormattedData = () => {
        return data.map((item) => {
            item.reason = typeof item.reason === 'string' ? item.reason : item.reason.join(', ');
            return item;
        })
    }

    return (
        <>
            <h5>{title}</h5>
            <TableContainer
                columns={columns}
                data={getFormattedData()}
            />
        </>
    )
}

export default VehicleReasons;