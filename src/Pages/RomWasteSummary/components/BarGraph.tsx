import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from 'apexcharts';
import { Card, CardBody, CardTitle } from "reactstrap";
import { CustomLegend } from "./CustomLegent";

const BarGraph = (props: any) => {
    return (
            <Card style={{minHeight: '200px', marginBottom: '0px'}}>
                <CardBody>
                    <Chart
                        options={props.options}
                        series={props.series}
                        type="bar"
                        height={800}
                    />
                    <CustomLegend legends={props.legends} />
                    <div style={{textAlign: 'center'}}>
                        Locations
                    </div>
                </CardBody>
            </Card>
    )
}

export default BarGraph;