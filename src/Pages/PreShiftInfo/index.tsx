import React, { useState } from "react";
import { Container } from "reactstrap";
import SideBar from "./sidebar/SideBar";
import { shiftInfoData, sideMenu } from "./data/sampleData";
import List from "./List";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const PreShiftInfo
    = () => {
        document.title = "Pre Shift Info | FMS Live";

        return (
            <React.Fragment>
                <div className="page-content">
                    <DndProvider backend={HTML5Backend}>
                        <Container fluid className="p-0">
                            <div className="pre-shift-main d-flex flex-wrap gap-5 mx-0">
                                <div className="data-section">
                                    <List data={shiftInfoData}/>
                                </div>
                                <div className="sidebar-section p-0">
                                    <SideBar sideMenu={sideMenu} />
                                </div>
                            </div>
                        </Container>
                    </DndProvider>
                </div>
            </React.Fragment >
        )
    }

export default PreShiftInfo;