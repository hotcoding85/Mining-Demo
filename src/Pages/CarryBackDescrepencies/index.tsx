import React from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";

const CarryBackDescrepencies = (props: any) => {
    document.title = "Pre Starts | FMS Live";

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Dynamic Dispatch" breadcrumbItem="Carryback Descrepencies" />
                    <Row>
                        <Col lg="12">

                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    )
}

export default CarryBackDescrepencies;