import React from 'react'
import { Col, Container, Row } from 'reactstrap'

//Import Breadcrumb
import Breadcrumbs from "Components/Common/Breadcrumb";
import Utilization from './utilization';
import ScoreBoard from './scoreboard';
import TonnesGraph from './tonnes';
import Materials from './materials';
import { shiftTimings } from 'utils/common';

const Dashboard = () => {
    document.title = "Dashboards | FMS Live";

    const shiftDetails = shiftTimings();

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Dashboards" breadcrumbItem="Default" />
                    <Row>
                        <Utilization roster={shiftDetails ? shiftDetails.shiftDate + ':' + shiftDetails.shift : ''} />
                    </Row>
                    <Row>
                        <Col md={6}>
                            <ScoreBoard roster={shiftDetails ? shiftDetails.shiftDate + ':' + shiftDetails.shift : ''} />
                        </Col>
                        <Col md={6}>
                            <Materials roster={shiftDetails ? shiftDetails.shiftDate + ':' + shiftDetails.shift : ''} />
                            <TonnesGraph roster={shiftDetails ? shiftDetails.shiftDate + ':' + shiftDetails.shift : ''} />
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    )
}

export default Dashboard
