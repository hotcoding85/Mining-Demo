import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import TaskItem from './TaskItem';
import { Task } from '../interfaces/type';
import '../styles/TimelineCell.css';

interface TimeLineRowProps {
  resourceId: string;
  tasks: Task[];
  updateTask: (updatedTask: Task) => void;
  addTask: (resourceId: string, startTime: Date, task?: Task) => void;
  zoomSize: number;
  endSlotTime : Date;
  startSlotTime : Date;
  rowHeight : number;
  openModal: (task?: Task) => void;
}

const TimeLineRow: React.FC<TimeLineRowProps> = ({
  resourceId,
  tasks,
  updateTask,
  addTask,
  zoomSize,
  endSlotTime,
  startSlotTime,
  rowHeight,
  openModal
}) => {


    const assignedTasks = tasks.filter((task, index) => (
        task.resourceId == resourceId && task.startTime >= startSlotTime && task.startTime <= endSlotTime
    ));

    const mousePosition = useRef({ x: 0, y: 0 });
    const rowRef = useRef<HTMLDivElement>(null);

    const handleDragOver = (e: MouseEvent) => {
        if(rowRef.current){
            mousePosition.current.x = e.pageX - rowRef.current.getBoundingClientRect().left;
            mousePosition.current.y = e.pageY - rowRef.current.getBoundingClientRect().top;
        }
        
    };

    const handleClick = (e: MouseEvent) => {
        if(rowRef.current){
            const xPos = e.pageX - rowRef.current.getBoundingClientRect().left;
            const deltaMinutes = Math.round(
                xPos / 100 * zoomSize
            );
            const slotDateTime = new Date(startSlotTime.getTime() + deltaMinutes * 60 * 1000);
            const filteredTasks = tasks.filter((task) => (task.resourceId == resourceId && task.startTime <= slotDateTime && task.endTime >= slotDateTime));
            if(filteredTasks.length == 0) {
                addTask(resourceId, slotDateTime);
            }

        }
    };

    useEffect(() => {
        if (rowRef.current) {
            rowRef.current.addEventListener('dragover', handleDragOver);
            rowRef.current.addEventListener('mousedown', handleClick);
        }
        return () => {
            if (rowRef.current) {
                rowRef.current.removeEventListener('dragover', handleDragOver);
                rowRef.current.removeEventListener('mousedown', handleClick);
            }
        };
    }, [rowRef.current, tasks]);


    const [{ isOver, canDrop }, drop] = useDrop({
        accept: 'TASK',
        drop: (draggedTask: Task & { fromList?: boolean }) => {
            const deltaMinutes = Math.round(
                mousePosition.current.x / 100 * zoomSize
            );
            const slotDateTime = new Date(startSlotTime.getTime() + deltaMinutes * 60 * 1000);

            if (draggedTask.fromList) {
                addTask(resourceId, slotDateTime, draggedTask);
            } else {
                const durationMinutes =
                (draggedTask.endTime.getTime() - draggedTask.startTime.getTime()) /
                (60 * 1000);
                const newStartTime = new Date(slotDateTime);
                const newEndTime = new Date(newStartTime.getTime() + durationMinutes * 60 * 1000);
                const newTask = {
                    ...draggedTask,
                    resourceId,
                    startTime: newStartTime,
                    endTime: newEndTime,
                    span: draggedTask.span,
                };
                updateTask(newTask);
            }
        },
        collect: (monitor) => ({
          isOver: !!monitor.isOver(),
          canDrop: !!monitor.canDrop(),
        }),
    });
    
    return (
        <div
        ref={drop} 
        className='chat-timeline-items-row' style={{height: rowHeight}}>
            <div ref={rowRef} className="row-inner">
            {
                assignedTasks.map((task, index) => (
                    <TaskItem
                        task={task}
                        startSlotTime={startSlotTime}
                        endSlotTime={endSlotTime}
                        zoomSize={zoomSize}
                        updateTask={updateTask}
                        addTask={addTask}
                        openModal={openModal}
                    />
                ))
            }
            </div>
            
        </div>
    )
};

export default TimeLineRow;
