import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Task } from '../interfaces/type';
import '../styles/TimelineCell.css';

interface TimelineCellProps {
  resourceId: string;
  label: string;
  slotTime: string;
  slotDate: string;
  selectedDate: Date;
  tasks: Task[];
  updateTask: (updatedTask: Task) => void;
  addTask: (resourceId: string, startTime: Date, task?: Task) => void;
  slotIndex: number;
  totalSlots: number;
}

const TimelineCell: React.FC<TimelineCellProps> = ({
  resourceId,
  label,
  slotTime,
  slotDate,
  selectedDate,
  tasks,
  updateTask,
  addTask,
  slotIndex,
  totalSlots,
}) => {
  const slotDateTime = new Date(slotDate);
  const [hours, minutes] = slotTime.split(':').map(Number);
  slotDateTime.setHours(hours, minutes, 0, 0);

  const taskForSlot = tasks.find(
    (task) =>
      task.resourceId === resourceId &&
      task.startTime <= slotDateTime &&
      task.endTime > slotDateTime
  );

  const isTaskStartSlot = taskForSlot && taskForSlot.startTime.getTime() === slotDateTime.getTime();

  const [isResizing, setIsResizing] = useState(false);
  const [initialX, setInitialX] = useState<number | null>(null);
  const [initialStartTime, setInitialStartTime] = useState<Date | null>(null);
  const [initialEndTime, setInitialEndTime] = useState<Date | null>(null);
  const [resizeDirection, setResizeDirection] = useState<'left' | 'right' | null>(null);

  const taskElementRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (taskElementRef.current) {
      const taskElementRect = taskElementRef.current.getBoundingClientRect();
      const isOnRightEdge = e.clientX >= taskElementRect.right - 10 && e.clientX <= taskElementRect.right;
      const isOnLeftEdge = e.clientX >= taskElementRect.left && e.clientX <= taskElementRect.left + 10;

      if (isOnRightEdge || isOnLeftEdge) {
        setIsResizing(true);
        setInitialX(e.clientX);
        setInitialStartTime(taskForSlot?.startTime || null);
        setInitialEndTime(taskForSlot?.endTime || null);
        setResizeDirection(isOnRightEdge ? 'right' : 'left');
        e.stopPropagation();
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing && initialX !== null && initialStartTime && initialEndTime) {
      const deltaX = e.clientX - initialX;
      const deltaMinutes = Math.round(
        (deltaX / (taskElementRef.current?.offsetWidth || 1)) * 60
      );

      if (resizeDirection === 'right') {
        const newEndTime = new Date(
          initialEndTime.getTime() + deltaMinutes * 60 * 1000
        );
        if (newEndTime > initialStartTime) {
          updateTask({ ...taskForSlot!, endTime: newEndTime });
        }
      } else if (resizeDirection === 'left') {
        const newStartTime = new Date(
          initialStartTime.getTime() + deltaMinutes * 60 * 1000
        );
        if (newStartTime < initialEndTime) {
          updateTask({ ...taskForSlot!, startTime: newStartTime });
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false);
      setInitialX(null);
      setInitialStartTime(null);
      setInitialEndTime(null);
      setResizeDirection(null);
    }
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    if (taskElementRef.current) {
      const taskElementRect = taskElementRef.current.getBoundingClientRect();
      const isOnRightEdge = e.clientX >= taskElementRect.right - 10 && e.clientX <= taskElementRect.right;
      const isOnLeftEdge = e.clientX >= taskElementRect.left && e.clientX <= taskElementRect.left + 10;

      if (isOnRightEdge || isOnLeftEdge) {
        taskElementRef.current.style.cursor = 'ew-resize'; // Change cursor to resize when near either edge
      } else {
        taskElementRef.current.style.cursor = 'grab'; // Change cursor to grab when inside the task
      }
    }
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleClick = (e: React.MouseEvent<HTMLTableCellElement>) => {
    if (!isResizing && !taskForSlot) {
      addTask(resourceId, slotDateTime);
    }
  };

  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { ...taskForSlot, slotIndex, totalSlots },
    canDrag: !!taskForSlot && !isResizing,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'TASK',
    drop: (draggedTask: Task & { fromList?: boolean }) => {
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

  const setRefs = (node: HTMLDivElement | null) => {
    taskElementRef.current = node;
    drag(node);
  };

  return (
    <td
      ref={drop}
      style={{
        backgroundColor: isOver && canDrop ? 'lightblue' : taskForSlot ? 'green' : 'white',
        borderRight: taskForSlot ? '0px' : '1px solid #ddd',
        borderLeft: taskForSlot ? '0px' : '1px solid #ddd',
        cursor: taskForSlot ? (isResizing ? 'ew-resize' : 'pointer') : 'default',
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
      }}
      onClick={handleClick}
      colSpan={isTaskStartSlot ? taskForSlot?.span || 1 : 1}
    >
      {taskForSlot && (
        <div
          ref={setRefs}
          className="task"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseOver}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          {isTaskStartSlot && 
            <div style={{ textAlign: 'center' }}>
              <p className='list-item-span bold'>{taskForSlot.label}</p>
              <span className='list-item-span'>{taskForSlot.name}</span>
            </div>
          }
        </div>
      )}
    </td>
  );
};

export default TimelineCell;
