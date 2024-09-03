import React, { useEffect } from "react";
import { Col, Card, CardBody, CardImg, CardImgOverlay, CardTitle, Row } from "reactstrap";
import Chart from "react-apexcharts";

import PC2000 from 'assets/images/equipment/PC2000.png'
import PC1250 from 'assets/images/equipment/PC1250.png'
import HD1500 from 'assets/images/equipment/HD1500.png'
import HD785 from 'assets/images/equipment/HD785.png'
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { dashboardUtilInfo } from "slices/thunk";

const Utilization = ({ roster }) => {

    const dispatch: any = useDispatch();

    useEffect(() => {
        dispatch(dashboardUtilInfo(roster));
    }, [roster]);

    const selectProperties = createSelector(
        (state: any) => state.Events,
        (info) => ({
            data: info.dashboardUtilPercent
        })
    );

    const { data } = useSelector(selectProperties);

    const getUtilPercentColor = (utilPercent: number) => {
        if (utilPercent > 75) {
            return '#F4FF36';
        } else {
            return '#F44336';
        }
    }

    const getFleetImage = (model: string) => {
        let image = HD785
        switch (model) {
            case "PC1250":
                image = PC1250;
                break;
            case "PC2000":
                image = PC2000;
                break;
            case "HD785":
                image = HD785;
                break;
            case "HD1500":
                image = HD1500;
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
                                data &&
                                data.map((model, key) => {
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