import React from 'react';
import { useDraggable } from '@dnd-kit/core';

function Draggable({ data, children }) {
    const { id, ...otherProperties } = data;
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: id,
        data: otherProperties,
    });

    return (
        <div ref={setNodeRef} {...listeners} {...attributes}>
            {children}
        </div>
    );
}

export default Draggable;