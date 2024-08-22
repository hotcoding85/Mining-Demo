import React, { useState } from 'react';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Container } from 'reactstrap';

const initialPersons = [
    { id: '1', name: 'Alice', disabled: false },
    { id: '2', name: 'Bob', disabled: false },
    { id: '3', name: 'Charlie', disabled: false },
];

const initialWorkAreas = [
    { id: 'work1', name: 'Work Area 1' },
    { id: 'work2', name: 'Work Area 2' },
    { id: 'work3', name: 'Work Area 3' },
];

function DraggablePerson({ id, name, disabled, onDragStart }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                transform: CSS.Transform.toString(transform),
                padding: '8px',
                margin: '4px',
                backgroundColor: disabled ? '#d0d0d0' : '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: disabled ? 'not-allowed' : 'move',
                opacity: disabled ? 0.5 : 1,
            }}
            onDragStart={disabled ? (e) => e.preventDefault() : onDragStart}
        >
            {name}
        </div>
    );
}

function DropTarget({ id, children }) {
    const { isOver, setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            style={{
                border: '1px solid #ccc',
                padding: '10px',
                minHeight: '100px',
                backgroundColor: isOver ? '#e0ffe0' : '#fafafa',
                marginBottom: '20px',
            }}
        >
            {children}
        </div>
    );
}

const Dispatch = () => {
    document.title = "Dispatch | FMS Live";

    const [persons, setPersons] = useState(initialPersons);
    const [assignedPersons, setAssignedPersons] = useState({
        work1: [],
        work2: [],
        work3: [],
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const activeId = active.id as string;
            const overId = over.id as string;

            // Check if the person is already dropped
            const person = persons.find(p => p.id === activeId);
            if (person && !person.disabled) {
                // Disable the person after being dropped
                const updatedPersons = persons.map(p =>
                    p.id === activeId ? { ...p, disabled: true } : p
                );

                // Add person to the new work area
                const workArea = Object.keys(assignedPersons).find(key => key === overId);
                if (workArea) {
                    const updatedAssignedPersons = {
                        ...assignedPersons,
                        [workArea]: [...assignedPersons[workArea], person],
                    };

                    setAssignedPersons(updatedAssignedPersons);
                    setPersons(updatedPersons);
                }
            }
        }
    };

    return (
        < React.Fragment >
            <div className="page-content">
                <Container fluid>
                    <DndContext onDragEnd={handleDragEnd}>
                        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
                            <div style={{ width: '20%' }}>
                                <h2>Operators</h2>
                                <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                                    {persons.map(person => (
                                        <DraggablePerson
                                            key={person.id}
                                            id={person.id}
                                            name={person.name}
                                            disabled={person.disabled}
                                            onDragStart={() => { }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div style={{ width: '80%' }}>
                                <h2>Diggers</h2>
                                {initialWorkAreas.map(area => (
                                    <DropTarget key={area.id} id={area.id}>
                                        <h3>{area.name}</h3>
                                        {assignedPersons[area.id].map(person => (
                                            <div
                                                key={person.id}
                                                style={{
                                                    padding: '8px',
                                                    margin: '4px',
                                                    backgroundColor: '#e0e0e0',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                }}
                                            >
                                                {person.name}
                                            </div>
                                        ))}
                                    </DropTarget>
                                ))}
                            </div>
                        </div>
                    </DndContext>
                </Container>
            </div >
        </React.Fragment >
    );
}
export default Dispatch;