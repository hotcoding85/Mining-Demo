import { useDroppable } from '@dnd-kit/core';
import React from 'react';

function Droppable(props) {
    const { setNodeRef } = useDroppable({
        id: 'droppable',
        data: {
            accepts: ['type1', 'type2'],
        },
    });

    return (
        <div ref={setNodeRef} style={{borderWidth: 1, borderColor: 'white'}}>
            {props.children}
        </div>
    );
}
export default Droppable