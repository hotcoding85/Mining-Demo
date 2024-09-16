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

  const endSlotOfTimeline = timelineSlots.at(-1);
  const slotDateTime = new Date(endSlotOfTimeline? endSlotOfTimeline.date : selectedDate);
  const [hours, minutes] = endSlotOfTimeline? endSlotOfTimeline.time.split(':').map(Number) : [18, 0];
  slotDateTime.setHours(hours, minutes, 0, 0);
  const endSlotDateTime = new Date(
    slotDateTime.getTime() + zoomSize * 60 * 1000
  );

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
      <table style={{width:140+100*timelineSlots.length}}className={`custom-table ${isColumnsCollapsed ? 'collapsed' : ''}`}>
        <thead>
          <tr>
            <th style={{width: 70}}>Label</th>
            <th style={{width: 70}}>Progress</th>
            {timelineSlots.map((slot, index) => (
              <th key={index} style={{width: 100}}className='timeline-header'>
                {slot.isNewDay ? (
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
              <td>{row.label}</td>
              <td>{row.progress}</td>
              {timelineSlots.map((slot, slotIndex) => (
                <TimelineCell
                  key={slotIndex}
                  resourceId={row.id}
                  label={row.label}
                  slotDate={slot.date}
                  slotTime={slot.time}
                  selectedDate={selectedDate}
                  tasks={tasks}
                  updateTask={updateTask}
                  addTask={addTask}
                  slotIndex={slotIndex}
                  totalSlots={timelineSlots.length}
                  zoomSize={zoomSize}
                  endSlotTime={endSlotDateTime }
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
