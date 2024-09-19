import React, { useState } from 'react';
import { Resource, Task, ShiftType, resourceHeight } from './interfaces/type';
import { calculateTimelineSlots, TimelineSlot } from 'utils/dateUtils';
import TimeLineRow from './Timeline/TimeLineRow';
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
  updateTask: (updatedTask: Task) => void;
  heights: resourceHeight[];
  openModal: (task?: Task) => void;
}

const TableComponent: React.FC<TableComponentProps> = ({
  data,
  tasks,
  setTasks,
  selectedDate,
  shiftType,
  zoomSize,
  addTask,
  updateTask,
  heights,
  openModal
}) => {
  const timelineSlots: TimelineSlot[] = calculateTimelineSlots(selectedDate, shiftType, zoomSize);

  const endSlotOfTimeline = timelineSlots.at(-1);
  const slotDateTime = new Date(endSlotOfTimeline? endSlotOfTimeline.date : selectedDate);
  const [hours, minutes] = endSlotOfTimeline? endSlotOfTimeline.time.split(':').map(Number) : [18, 0];
  slotDateTime.setHours(hours, minutes, 0, 0);
  const endSlotDateTime = new Date(
    slotDateTime.getTime() + zoomSize * 60 * 1000
  );

  const startSlotOfTimeline = timelineSlots.at(0);
  const startSlotDateTime = new Date(startSlotOfTimeline? startSlotOfTimeline.date : selectedDate);
  const [startHours, startMinutes] = startSlotOfTimeline? startSlotOfTimeline.time.split(':').map(Number) : [6, 0];
  startSlotDateTime.setHours(startHours, startMinutes, 0, 0);

  const [isColumnsCollapsed, setColumnsCollapsed] = useState(false);

  const toggleColumns = () => {
    setColumnsCollapsed(!isColumnsCollapsed);
  };

  return (
    <div className='gantt-container'>
      <div className='gantt-resource'>
        <div className='timeline-row header'>
          <div style={{width : 70, height: 50}} className='timeline-grid-row-cell'>Label</div>
          <div style={{width : 70, height: 50}} className='timeline-grid-row-cell'>Progress</div>
        </div>
        {data.map((resource, index) => (
          <div className='timeline-row header'  key={index} style={{height: heights[index].height}}>
            <div style={{width : 70}} className='timeline-grid-row-cell'>{resource.label}</div>
            <div style={{width : 70}} className='timeline-grid-row-cell'>{resource.progress}</div>
          </div>
        ))}
      </div>
      <div className='gantt-chart'>
        <div className='chart-inner'>
          <div className='chat-timeline-grid'>
            <div className='timeline-row header'>
              {timelineSlots.map((slot, index) => (
                  <div key={index} style={{width: 100, height : 50}} className='timeline-grid-row-cell' >
                    {slot.isNewDay ? (
                      <>
                        <div>{slot.date}</div>
                        <div>{slot.time}</div>
                      </>
                    ) : (
                      <div>{slot.time}</div>
                    )}
                  </div>
                ))}
            </div>
            {
              data.map((resource, index) => (
                <div className='timeline-row' style={{height: heights[index].height}}>
                  {timelineSlots.map((slot, index) => (
                      <div className='timeline-grid-row-cell'></div>
                    ))}
                </div>
              ))
            }
          </div>
          <div className='chat-timelime-items' style={{width : timelineSlots.length * 100}}>
            <div className='chat-timeline-items-row' style={{height:50}}></div>
            {
              data.map((resource, index) => (
                <TimeLineRow
                    key={index}
                    resourceId={resource.id}
                    tasks={tasks}
                    updateTask={updateTask}
                    addTask={addTask}
                    zoomSize={zoomSize}
                    endSlotTime={endSlotDateTime }
                    startSlotTime={startSlotDateTime}
                    rowHeight={heights[index].height}
                    openModal={openModal}
                />    
              ))
            }
          </div>
        </div>
              
      </div>
    </div>
  );
};

export default TableComponent;
