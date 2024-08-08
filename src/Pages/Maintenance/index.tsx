import React from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";

const Maintenance = (props: any) => {
    document.title = "Maintenance Planner | FMS Live";

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Planner" breadcrumbItem="Maintenance" />
                    <Row>
                        <Col lg="12">

                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    )
}

export default Maintenance;