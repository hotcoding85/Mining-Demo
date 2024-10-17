import { TextColor } from "Components/Charts/interfaces/general";
import { Card, CardTitle } from "reactstrap"
import { LineGraph } from "./LineGraph";

export const TruckingExecutionPlan = (props) => {

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
        { text: "Plan", color: "#0050b3d1" },
        { text: "Actual", color: "#e2e2e2" },
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
                borderColor: "#0050b3d1",
                backgroundColor: "#0050b300",
                fill: true,
                tension: 0,
                pointRadius: 4,
            },
            {
                label: "Actual",
                data: [21, 18, 14, 20, 19, 22, 19, 13, 18, 9, 3, 3],
                borderColor: "#e2e2e2",
                backgroundColor: "#e2e2e200",
                fill: true,
                tension: 0,
                pointRadius: 4,
            },
        ],
    };

    return (
        <Card className="trucking-trip-summary-cards">
            <LineGraph
                header="Current Trucking Execution Plan"
                data={lineData}
                options={lineOptions}
                widthVal={'100%'}
                textColor={textColor2}
                backgroundCol={"#24314D"}
            />
        </Card>
    )
}