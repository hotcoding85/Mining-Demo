import React from "react";
import { Col, Card, CardBody, CardImg, CardImgOverlay, CardTitle, Row } from "reactstrap";
import Chart from "react-apexcharts";

import { hd785, hd1500, pc1250, pc2000 } from "assets/images/equipment";

const Utilization = (props: any) => {

    const utilizationByModel: { model: string, utilPercent: number }[] = [
        {
            "model": "H270",
            "utilPercent": 75.55
        },
        {
            "model": "785-7",
            "utilPercent": 55.52
        }

    ];

    const getUtilPercentColor = (utilPercent: number) => {
        if (utilPercent > 75) {
            return '#F4FF36';
        } else {
            return '#F44336';
        }
    }

    const getFleetImage = (model: string) => {
        let image = hd785
        switch (model) {
            case "PC1250":
                image = pc1250;
                break;
            case "PC2000":
                image = pc2000;
                break;
            case "HD785":
                image = hd785;
                break;
            case "HD1500":
                image = hd1500;
                break;
        }

        return image;
    }

    return (
        <React.Fragment>
            <Col>
                <Card>
                    <CardBody>
                        <CardTitle tag="h4" className="mb-3">Utilization by model</CardTitle>
                        <Row>
                            {
                                utilizationByModel.map((model, key) => {
                                    const options = {
                                        plotOptions: {
                                            radialBar: {
                                                startAngle: -130,
                                                endAngle: 130,
                                                dataLabels: {
                                                    name: {
                                                        fontSize: '16px',
                                                        color: '#fff',
                                                    },
                                                    value: {
                                                        fontSize: '22px',
                                                        color: '#fff',
                                                        formatter: function (val) {
                                                            return val + "%";
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        fill: {
                                            colors: [getUtilPercentColor(model.utilPercent)]
                                        },
                                        stroke: {
                                            dashArray: 3
                                        },
                                        labels: ['Utilization'],
                                    };

                                    return (
                                        <Col lg={3} md={4} sm={6}>
                                            <Card>
                                                <CardBody>
                                                    <CardImg
                                                        alt="image"
                                                        src={getFleetImage(model.model)}
                                                        style={{
                                                            opacity: 0.1
                                                        }}
                                                        width="100%"
                                                    />
                                                    <CardImgOverlay>
                                                        <CardTitle tag="h4" className="mb-3">{model.model}</CardTitle>
                                                        <Chart
                                                            options={options}
                                                            series={[model.utilPercent]}
                                                            type="radialBar"
                                                            key={key}
                                                        />
                                                    </CardImgOverlay>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    )
                                })
                            }
                        </Row>
                    </CardBody>
                </Card>
            </Col>
        </React.Fragment>
    )
}

export default Utilization;