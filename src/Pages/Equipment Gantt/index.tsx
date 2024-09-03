import React from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";

const EquipmentGantt = (props: any) => {
    document.title = "Equipment Gantt | FMS Live";

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Manager Centre" breadcrumbItem="Equipment Activity Gantt" />
                    <Row>
                        <Col lg="12">

                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    )
}

export default EquipmentGantt;