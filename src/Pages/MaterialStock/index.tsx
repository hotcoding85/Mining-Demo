import React from "react";
import { Col, Container, Row } from "reactstrap";

import Breadcrumb from 'Components/Common/Breadcrumb';
import RomStatus from "./romStatus";
import RomGraph from "./romGraph";
import PitStatus from "./pitStatus";

const MaterialStock = (props: any) => {
    document.title = "Material Stock";
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Dashboard" breadcrumbItem="Material Stock" />
                    <Row>
                        <Col md={6}>
                            <RomStatus />
                        </Col>
                        <Col md={6}>
                            <RomGraph />
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <PitStatus />
                        </Col>
                    </Row>

                </Container>
            </div>
        </React.Fragment>
    )
}
export default MaterialStock;