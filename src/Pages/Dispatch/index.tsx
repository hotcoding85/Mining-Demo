import React, { forwardRef, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { DndContext, DragOverlay } from '@dnd-kit/core';
import Draggable from "./Draggable";
import Droppable from "./Droppable";

const Dispatch = () => {
    document.title = "Dispatch | FMS Live";
    const [isDragging, setIsDragging] = useState(false);

    function handleDragStart() {
        setIsDragging(true);
    }

    function handleDragEnd(event) {
        setIsDragging(false);

    }

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <Row>
                            <Col xs={2}>
                                <Draggable id="my-draggable-element">
                                    <span>Operator</span>
                                </Draggable>

                                <DragOverlay>
                                    {isDragging ? (
                                        <span>Operator drgging</span>
                                    ) : null}
                                </DragOverlay>
                            </Col>
                            <Col xs={10} style={{background: '#fff', height: '80vh'}}>
                                <Droppable />
                            </Col>
                        </Row>
                    </DndContext>
                </Container>
            </div>
        </React.Fragment>
    );
}
export default Dispatch;