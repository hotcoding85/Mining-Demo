import React, { useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import SideBar from "./sidebar/SideBar";
import { Task } from "./interfaces/type";
import { data, sampleTaskLists } from "./data/sampleData";
import List from "./List";

const PreShiftInfo
    = (props: any) => {
        document.title = "Pre Shift Info | FMS Live";
        const [sideMenu, setSideMenu] = useState<Task[]>(sampleTaskLists)

        return (
            <React.Fragment>
                <div className="page-content">
                    <Container fluid>
                        {/* <Breadcrumb title="Mine Controle" breadcrumbItem="Pre Shift Info" /> */}
                        <Row>
                            <Col lg="9">
                                <List data={data}/>
                            </Col>
                            <Col lg="3">
                                <SideBar tasks={sideMenu} />
                            </Col>
                        </Row>
                    </Container>
                </div>
            </React.Fragment >
        )
    }

export default PreShiftInfo;