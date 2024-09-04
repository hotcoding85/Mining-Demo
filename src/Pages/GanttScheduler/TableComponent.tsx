import React, { useState } from 'react';
import { Resource, Task, ShiftType } from './interfaces/type';
import { calculateTimelineSlots, TimelineSlot } from 'utils/dateUtils';
import TimelineCell from './Timeline/TimelineCell';
import './styles/TableComponent.css';
import { wrap } from 'module';

interface TableComponentProps {
  data: Resource[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  selectedDate: Date;
  shiftType: ShiftType;
  zoomSize: number;
  addTask: (resourceId: string, startTime: Date, task?: Task) => void;
}

const TableComponent: React.FC<TableComponentProps> = ({
  data,
  tasks,
  setTasks,
  selectedDate,
  shiftType,
  zoomSize,
  addTask,
}) => {
  const timelineSlots: TimelineSlot[] = calculateTimelineSlots(selectedDate, shiftType, zoomSize);
  const [isColumnsCollapsed, setColumnsCollapsed] = useState(false);

  const updateTask = (updatedTask: Task) => {
    setTasks((prevTasks: Task[]) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const toggleColumns = () => {
    setColumnsCollapsed(!isColumnsCollapsed);
  };

  return (
    <div className='table-container'>
      <table style={{width:170+100*timelineSlots.length}}className={`custom-table ${isColumnsCollapsed ? 'collapsed' : ''}`}>
        <thead>
          <tr>
            <th style={{width: 30}}>ID</th>
            <th style={{width: 70}}>Label</th>
            <th style={{width: 70}}>Progress</th>
            {timelineSlots.map((slot, index) => (
              <th key={index} style={{width: 100}}className='timeline-header'>
                {slot.date ? (
                  <>
                    <div>{slot.date}</div>
                    <div>{slot.time}</div>
                  </>
                ) : (
                  <div>{slot.time}</div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>{row.id}</td>
              <td>{row.label}</td>
              <td>{row.progress}</td>
              {timelineSlots.map((slot, slotIndex) => (
                <TimelineCell
                  key={slotIndex}
                  resourceId={row.id}
                  label={row.label}
                  slotTime={slot.time}
                  selectedDate={selectedDate}
                  tasks={tasks}
                  updateTask={updateTask}
                  addTask={addTask}
                  slotIndex={slotIndex}
                  totalSlots={timelineSlots.length}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button className='toggle-button' onClick={toggleColumns}>
        {isColumnsCollapsed ? '=>' : '<='}
      </button>
    </div>
  );
};

export default TableComponent;
