import React, { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Task } from '../interfaces/type';
import '../styles/TimelineCell.css';
import { hd1500, pc1250 } from 'assets/images/equipment';
import { Avatar, Space } from 'antd';

interface TaskItemProps {
  task: Task;
  zoomSize: number;
  endSlotTime: Date;
  startSlotTime: Date;
  updateTask: (updatedTask: Task) => void;
  addTask: (resourceId: string, startTime: Date, task?: Task) => void;
  openModal: (task?: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  zoomSize,
  endSlotTime,
  startSlotTime,
  updateTask,
  openModal
}) => {
  
    const elementPos = 100 * (task.startTime.getTime() - startSlotTime.getTime()) / (60 * 1000* zoomSize);
    const elementWidth = 100 * (Math.min(endSlotTime.getTime(), task.endTime.getTime()) - Math.max(task.startTime.getTime(),startSlotTime.getTime())) / (60 * 1000* zoomSize);
    const progressbarWidth = (100 - task.progress) * elementWidth / 100;
    const [isResizing, setIsResizing] = useState(false);
    const [isEditable, setIsEditable] = useState(false);
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
          setInitialStartTime(task?.startTime || null);
          setInitialEndTime(task?.endTime || null);
          setResizeDirection(isOnRightEdge ? 'right' : 'left');
          e.stopPropagation();
        }
        setIsEditable(true);
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
            updateTask({ ...task!, endTime: newEndTime < endSlotTime ? newEndTime : endSlotTime });
          }
        } else if (resizeDirection === 'left') {
          const newStartTime = new Date(
            initialStartTime.getTime() + deltaMinutes * 60 * 1000
          );
          if (newStartTime < initialEndTime) {
            updateTask({ ...task!, startTime: newStartTime > startSlotTime ? newStartTime : startSlotTime });
          }
        }
      }
    };
  
    const handleMouseUp = () => {
      if (isResizing) {
        setIsEditable(false);
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

    const handleEditTask = (e: React.MouseEvent<HTMLDivElement>) => {
      if(!isResizing && e.currentTarget != e.target && isEditable) {
        openModal(task);
      }
      setIsEditable(false);
    }
  
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
  
    const [{ isDragging }, drag] = useDrag({
        type: 'TASK',
        item: { ...task },
        canDrag: !!task && !isResizing,
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
        end : (item, monitor) => {
          setIsEditable(false);
        }
    });
    
    const setRefs = (node: HTMLDivElement | null) => {
      taskElementRef.current = node;
      drag(node);
    };

  return (
        <div
          ref={setRefs}
          className="task-item"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseOver}
          onMouseUp={handleEditTask}
          style={{
            backgroundColor:task.color,
            width: elementWidth,
            height: '45px',
            position: 'absolute',
            top: task.rowIndex * 50 + 5,
            left: elementPos,
            display: 'flex',
            alignItems: 'center',
            opacity: isDragging ? 0.5 : 1,
            justifyContent: 'center',
            overflow:'hidden',
            zIndex: 1,
          }}>
            <div className='task-item-inner'>
              <Space>
                <div>
                  <Avatar src={<img src={pc1250} alt="avatar" style={{width:'80%', height:'60%'}} />} size={36} style={{ backgroundColor: 'white' }}/>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p className='list-item-span bold'>{task.label}</p>
                  <span className='list-item-span'>{task.name}</span>
                </div>
              </Space>
              <div className='task-item-progress-bar' style={{ width: progressbarWidth }}></div>
            </div>
            
        </div>
  );
};

export default TaskItem;
