import React from 'react';
import { useDraggable } from '@dnd-kit/core';

function Draggable(props) {
    const Element = props.element || 'div';
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: props.id,
        data: {
            type: 'type1',
        },
    });

    return (
        <Element ref={setNodeRef} {...listeners} {...attributes}>
            {props.children}
        </Element>
    );
}

export default Draggable;