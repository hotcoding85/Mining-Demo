import React, { useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import SideBar from "./sidebar/SideBar";
import { Task } from "./interfaces/type";
import { data, sampleTaskLists } from "./data/sampleData";
import List from "./List";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const PreShiftInfo
    = (props: any) => {
        document.title = "Pre Shift Info | FMS Live";
        const [sideMenu, setSideMenu] = useState<Task[]>(sampleTaskLists)

        return (
            <React.Fragment>
                <div className="page-content">
                    <DndProvider backend={HTML5Backend}>
                        <Container fluid className="p-0">
                            {/* <Breadcrumb title="Mine Controle" breadcrumbItem="Pre Shift Info" /> */}
                            <div className="d-flex flex-wrap gap-5 mx-0">
                                <div className="data-section">
                                    <List data={data}/>
                                </div>
                                <div className="sidebar-section p-0">
                                    <SideBar tasks={sideMenu} />
                                </div>
                            </div>
                        </Container>
                    </DndProvider>
                </div>
            </React.Fragment >
        )
    }

export default PreShiftInfo;