import React from "react";
import { Breadcrumb, Card, CardBody, Col, Container, Row } from "reactstrap";

const Reports = (props: any) => {
    document.title = "Reports";

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Resources" breadcrumbItem="Materials" />
                    <Row>
                        <Col lg="12">
                            <Card>
                                <CardBody>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    )
}

export default Reports;