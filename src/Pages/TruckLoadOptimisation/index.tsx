import React from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";

const TruckLoadOptimisation = (props: any) => {
    document.title = "Truck Load Optimisation | FMS Live";

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Mine Dynamics" breadcrumbItem="Truck Load Optimisation" />
                    <Row>
                        <Col lg="12">

                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    )
}

export default TruckLoadOptimisation;