import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Plan } from '../interfaces/type';
import '../styles/TimelineCell.css';

interface TimelineCellProps {
  resourceId: string;
  label: string;
  slotTime: string;
  slotDate: string;
  selectedDate: Date;
  plans: Plan[];
  updatePlan: (updatedPlan: any) => void;
  addPlan: (resourceId: string, startTime: Date, plan?: Plan) => void;
  slotIndex: number;
  totalSlots: number;
  zoomSize: number;
  endSlotTime : Date;
  startSlotTime : Date;
}

const TimelineCell: React.FC<TimelineCellProps> = ({
  resourceId,
  label,
  slotTime,
  slotDate,
  selectedDate,
  plans,
  updatePlan,
  addPlan,
  slotIndex,
  totalSlots,
  zoomSize,
  endSlotTime,
  startSlotTime,
}) => {
  const slotDateTime = new Date(slotDate);
  const [hours, minutes] = slotTime.split(':').map(Number);
  slotDateTime.setHours(hours, minutes, 0, 0);
  const slotEndDateTime = new Date(
    slotDateTime.getTime() + zoomSize * 60 * 1000
  );

  const taskForSlot = plans.find(
    (plan) =>
      plan.resourceId === resourceId &&
      ((plan.startTime >= slotDateTime && new Date(plan.startTime.getTime() - zoomSize * 60 * 1000) < slotDateTime) ||
      (plan.endTime <= slotEndDateTime && new Date(plan.endTime.getTime()+zoomSize * 60 * 1000) > slotEndDateTime) ||
      (slotDateTime >= plan.startTime && slotDateTime < plan.endTime)
    )
  );
  
  const isPlanStartSlot = (taskForSlot && taskForSlot.startTime.getTime() >= slotDateTime.getTime()) || (taskForSlot && taskForSlot.startTime.getTime() < slotDateTime.getTime() && slotDateTime.getTime() == startSlotTime.getTime());

  let elementPos = 0;
  let elementWidth = 0;
  let colSpan = 1;
  if(taskForSlot) {
      elementPos = (taskForSlot && isPlanStartSlot) ? 100 * (Math.max(taskForSlot.startTime.getTime(),startSlotTime.getTime()) - slotDateTime.getTime()) / (60 * 1000* zoomSize) : 0;
      elementWidth = 100 * (Math.min(endSlotTime.getTime(), taskForSlot.endTime.getTime()) - Math.max(taskForSlot.startTime.getTime(),startSlotTime.getTime())) / (60 * 1000* zoomSize);
      colSpan = (taskForSlot && isPlanStartSlot) ? Math.ceil((Math.min(endSlotTime.getTime(), taskForSlot.endTime.getTime()) - slotDateTime.getTime()) / (60 * 1000 * zoomSize)) : 1;
  }

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
        (deltaX / 100) * zoomSize
      );

      if (resizeDirection === 'right') {
        const newEndTime = new Date(
          initialEndTime.getTime() + deltaMinutes * 60 * 1000
        );
        if (newEndTime > initialStartTime) {
          updatePlan({ ...taskForSlot!, endTime: newEndTime });
        }
      } else if (resizeDirection === 'left') {
        const newStartTime = new Date(
          initialStartTime.getTime() + deltaMinutes * 60 * 1000
        );
        if (newStartTime < initialEndTime) {
          updatePlan({ ...taskForSlot!, startTime: newStartTime });
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
        taskElementRef.current.style.cursor = 'grab'; // Change cursor to grab when inside the plan
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
      addPlan(resourceId, slotDateTime);
    }
  };

  const [{ isDragging }, drag] = useDrag({
    type: 'plan',
    item: { ...taskForSlot, slotIndex, totalSlots },
    canDrag: !!taskForSlot && !isResizing,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'plan',
    drop: (draggedPlan: Plan & { fromList?: boolean }) => {
      if (draggedPlan.fromList) {
        addPlan(resourceId, slotDateTime, draggedPlan);
      } else {
        const durationMinutes =
          (draggedPlan.endTime.getTime() - draggedPlan.startTime.getTime()) /
          (60 * 1000);
        const newStartTime = new Date(slotDateTime);
        const newEndTime = new Date(newStartTime.getTime() + durationMinutes * 60 * 1000);
        const newPlan = {
          ...draggedPlan,
          resourceId,
          startTime: newStartTime,
          endTime: newEndTime,
          span: draggedPlan.span,
        };
        updatePlan(newPlan);
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
        backgroundColor: isOver && canDrop ? 'lightblue' : 'white',
        cursor: taskForSlot ? (isResizing ? 'ew-resize' : 'pointer') : 'default',
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
        display : (taskForSlot && !isPlanStartSlot) ? 'none':''
      }}
      onClick={handleClick}
      colSpan={colSpan}
    >
      {taskForSlot && (
        <div
          ref={setRefs}
          className="plan"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseOver}
          style={{
            backgroundColor:taskForSlot.color,
            width: elementWidth,
            height: '100%',
            position: 'absolute',
            top: 0,
            left: elementPos,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow:'hidden',
            zIndex: 1,
          }}
        >
          {isPlanStartSlot && 
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
