import React from "react"
import { Col, Card, CardBody, Row, Badge } from "reactstrap"

const Materials = (props: any) => {

    const data = [
        {
            "category": "ORE",
            "payload": 214.5,
            "badgeValue": 0,
            "isBadgeNegative": false
        },
        {
            category: "Ore",
            payload: 8869134.39,
            badgeValue: 8.6,
            "isBadgeNegative": false
        },
        {
            category: "Waste",
            payload: 9679134.39,
            badgeValue: 12.2,
            "isBadgeNegative": true
        }
    ]

    return (
        <React.Fragment>
            <Row>
                {
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
                                                    {item.payload}{" "}
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