import React from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";

const DiggingDashboard = (props: any) => {
    document.title = "Digging Plan vs Actual | FMS Live";

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Dashboards" breadcrumbItem="Digging Plan vs Actual" />
                    <Row>
                        <Col lg="12">

                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    )
}

export default DiggingDashboard;