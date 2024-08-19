import { useDroppable } from '@dnd-kit/core';
import React from 'react';
import { Card, CardBody } from 'reactstrap';

function Droppable(props) {
    const { active, isOver, over, setNodeRef } = useDroppable({
        id: 'droppable',
    });

    return (
        <div ref={setNodeRef} >
            <Card style={{ backgroundColor: isOver ? 'green' : 'red', height: 100 }}>
                <CardBody>
                    {isOver}
                </CardBody>
            </Card>
            {props.children}
        </div>
    );
}
export default Droppable 