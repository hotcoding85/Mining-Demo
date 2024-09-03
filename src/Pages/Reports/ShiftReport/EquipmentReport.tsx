import TableContainer, { TableColumn } from "Components/Common/TableContainer"
import { map, round } from "lodash";
import { useMemo } from "react";
import { msToTime } from "utils/common";

const EquipmentReport = ({ materialCategories, reportData }) => {

    const columns: TableColumn[] = useMemo(
        () => {
            let categoryHeaders = map(materialCategories, (category) => {
                return {
                    header: category,
                    accessorKey: category,
                    enableColumnFilter: false,
                    enableSorting: true
                }
            })
            return [
                {
                    header: "Vehicle",
                    accessorKey: "vehicleName",
                    enableColumnFilter: false,
                    enableSorting: true
                },
                {
                    header: "Operator",
                    accessorKey: "operatorName",
                    enableColumnFilter: false,
                    enableSorting: true
                },
                {
                    header: "Passes",
                    accessorKey: "passes",
                    enableColumnFilter: false,
                    enableSorting: true
                },
                ...categoryHeaders,
                {
                    header: "Avg. Payload",
                    accessorKey: "avgPayload",
                    enableColumnFilter: false,
                    enableSorting: true
                },
                {
                    header: "Operating",
                    accessorKey: "operating",
                    enableColumnFilter: false,
                    enableSorting: true
                },
                {
                    header: "Standby",
                    accessorKey: "standby",
                    enableColumnFilter: false,
                    enableSorting: true
                },
                {
                    header: "Delay",
                    accessorKey: "delay",
                    enableColumnFilter: false,
                    enableSorting: true
                }
            ]
        },
        [materialCategories]);

    const formatShiftReportData = () => {
        reportData.forEach((item) => {
            item.avgPayload = item.passes ? round(item.payload / item.passes, 2) : 0;
            item.operating = msToTime(item.operating, true);
            item.delay = msToTime(item.delay, true);
            item.standby = msToTime(item.standby, true);

            materialCategories.forEach((category) => {
                item[category] = round(item[category], 2);
            })
        });

        return reportData;
    }

    return (
        <>
            <TableContainer
                columns={columns}
                data={formatShiftReportData()}
            />
        </>
    )
}

export default EquipmentReport;