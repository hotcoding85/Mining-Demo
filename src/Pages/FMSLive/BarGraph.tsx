import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from 'apexcharts';
import { Card, CardBody, CardTitle } from "reactstrap";

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