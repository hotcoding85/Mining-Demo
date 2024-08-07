import React, { useState } from 'react'
import { Col, Container, Row } from 'reactstrap'

//Import Breadcrumb
import Breadcrumbs from "Components/Common/Breadcrumb";
import { useDispatch } from 'react-redux';
import Utilization from './utilization';
import ScoreBoard from './scoreboard';
import TonnesGraph from './tonnes';
import Materials from './materials';

const Dashboard = (props: any) => {
    document.title = "Dashboards";

    const dispatch: any = useDispatch();
    const [util, setUtil] = useState<number>(65)

    setTimeout(() => {
        setUtil(67.2)
    }, 5000)

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Dashboards" breadcrumbItem="Default" />
                    <Row>
                        <Utilization />
                    </Row>
                    <Row>
                        <Col md={6}>
                            <ScoreBoard />
                        </Col>
                        <Col md={6}>
                            <Materials />
                            <TonnesGraph />
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    )
}

export default Dashboard
