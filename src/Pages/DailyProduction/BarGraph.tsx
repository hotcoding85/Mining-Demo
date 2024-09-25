import React from "react";
import Chart from "react-apexcharts";
import { Card, CardBody } from "reactstrap";

const BarGraph = (props: any) => {
    return (
            <Card style={{minHeight: '200px'}}>
                <CardBody>
                    <Chart
                        options={props.options}
                        series={props.series}
                        type="bar"
                    />
                </CardBody>
            </Card>
    )
}

export default BarGraph;