import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { Col, Card, CardBody, Row, Badge } from "reactstrap"
import { createSelector } from "reselect";
import { dashboardMaterialTons } from "slices/thunk";

const Materials = ({ roster }) => {

    const dispatch: any = useDispatch();

    useEffect(() => {
        dispatch(dashboardMaterialTons(roster));
    }, [roster]);

    const selectProperties = createSelector(
        (state: any) => state.Events,
        (info) => ({
            data: info.dashboardMaterialTons
        })
    );

    const { data } = useSelector(selectProperties);

    return (
        <React.Fragment>
            <Row>
                {data &&
                    data.map((item, key) => {
                        return (
                            <Col sm={6} key={key}>
                                <Card className="mini-stats-wid">
                                    <CardBody>
                                        <div className="d-flex">
                                            <div className="me-3 align-self-center">
                                                {/* mdi mdi-${item.icon} */}
                                                <i className={`h2 text-${item.category} mb-0`} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <h4 className="text-muted mb-2">{item.category}</h4>
                                                <h5>
                                                    {item.payload.toFixed(2)}{" "}
                                                    <span className={"badge ms-1 align-bottom " + (item.isBadgeNegative ? 'bg-danger' : 'bg-success')}>
                                                        {item.isBadgeNegative ? '-' : '+'}{item.badgeValue}%
                                                    </span>
                                                </h5>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        )
                    })
                }
            </Row>
        </React.Fragment>
    )
}

export default Materials