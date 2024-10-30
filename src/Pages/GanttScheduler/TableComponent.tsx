import React, { useCallback, useRef, useState } from "react";
import { Resource, Plan, ShiftType, resourceHeight } from "./interfaces/type";
import { calculateTimelineSlots, TimelineSlot } from "utils/dateUtils";
import TimeLineRow from "./Timeline/TimeLineRow";
import "./styles/TableComponent.scss";
import { useDrag, useDrop } from "react-dnd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DragOutlined, HolderOutlined } from '@ant-design/icons';
import {
  hd1500,
  hd785,
  pc1250,
  pc2000,
  placeHolder,
  wa600,
  d375,
  t45,
} from "assets/images/equipment";
import { Avatar, Badge, Card, Tooltip } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
interface TableComponentProps {
  data: any[];
  plans: any[];
  setPlans: React.Dispatch<React.SetStateAction<Plan[]>>;
  selectedDate: Date;
  shiftType: ShiftType;
  zoomSize: number;
  addPlan: (resourceId: string, startTime: Date, plan?: Plan) => void;
  updatePlan: (updatedPlan: Plan, flag: string) => void;
  heights: resourceHeight[];
  openModal: (plan?: Plan) => void;
  _setOrderedData: (orderedData) => void;
}

// DraggableRow Component
const DraggableRow = ({ resource, index, moveRow, height }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: "ROW",
    hover(item: any) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) return;

      // Move the row
      moveRow(dragIndex, hoverIndex);

      // Update the dragged item's index
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "ROW",
    item: { type: "ROW", index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="timeline-row header"
      style={{
        height,
        opacity: isDragging ? 0.5 : 1,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 100,
          fontSize: "14px",
          paddingLeft: "4px",
          textAlign: "left",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
        }}
        className="timeline-grid-row-cell"
      >
        <HolderOutlined style={{ cursor: "grab" }} /> {/* Dragging icon */}
        <span style={{ fontWeight: "800" }}>{resource.name}</span>
      </div>
    </div>
  );
};

const TableComponent: React.FC<TableComponentProps> = ({
  data,
  plans,
  setPlans,
  selectedDate,
  shiftType,
  zoomSize,
  addPlan,
  updatePlan,
  heights,
  openModal,
  _setOrderedData
}) => {
  const [orderedData, setOrderedData] = useState(data);

  // Function to move a row from one index to another
  const moveRow = useCallback((dragIndex, hoverIndex) => {
    const updatedData = [...orderedData];
    const [removed] = updatedData.splice(dragIndex, 1);
    updatedData.splice(hoverIndex, 0, removed);
    setOrderedData(updatedData);
    _setOrderedData(updatedData)
  }, [orderedData]);
  
  const timelineSlots: TimelineSlot[] = calculateTimelineSlots(
    selectedDate,
    shiftType,
    zoomSize
  );

  const endSlotOfTimeline = timelineSlots.at(-1);
  const slotDateTime = new Date(
    endSlotOfTimeline ? endSlotOfTimeline.date : selectedDate
  );
  const [hours, minutes] = endSlotOfTimeline
    ? endSlotOfTimeline.time.split(":").map(Number)
    : [18, 0];
  slotDateTime.setHours(hours, minutes, 0, 0);
  const endSlotDateTime = new Date(
    slotDateTime.getTime() + zoomSize * 60 * 1000
  );

  const startSlotOfTimeline = timelineSlots.at(0);
  const startSlotDateTime = new Date(
    startSlotOfTimeline ? startSlotOfTimeline.date : selectedDate
  );
  const [startHours, startMinutes] = startSlotOfTimeline
    ? startSlotOfTimeline.time.split(":").map(Number)
    : [6, 0];
  startSlotDateTime.setHours(startHours, startMinutes, 0, 0);

  const [isColumnsCollapsed, setColumnsCollapsed] = useState(false);

  const toggleColumns = () => {
    setColumnsCollapsed(!isColumnsCollapsed);
  };

  function containsCaseInsensitive(str: string, substr: string): boolean {
    return str.toLowerCase().includes(substr.toLowerCase());
  }

  const getImage = (category: string) => {
    if (!category) {
      return placeHolder;
    }

    if (containsCaseInsensitive(category, "hd785")) {
      return hd785;
    } else if (containsCaseInsensitive(category, "hd1500")) {
      return hd1500;
    } else if (containsCaseInsensitive(category, "pc1250")) {
      return pc1250;
    } else if (containsCaseInsensitive(category, "pc2000")) {
      return pc2000;
    } else if (containsCaseInsensitive(category, "wa600")) {
      return wa600;
    } else if (containsCaseInsensitive(category, "d375")) {
      return d375;
    } else if (containsCaseInsensitive(category, "t45")) {
      return t45;
    } else {
      return placeHolder;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="gantt-container">
        <div className="gantt-resource">
          <div className="timeline-row header">
            <Badge.Ribbon placement="start" text="Equipment" color={shiftType == 'DAY_SHIFT' ? "cyan" : 'cyan-inverse'} style={{fontWeight: 600, fontSize: '16px', paddingTop: '5px', paddingBottom: '5px'}}>
              <div
                style={{ width: 100, height: 50, color: "white" }}
                className="timeline-grid-row-cell"
              >
                {shiftType == 'NIGHT_SHIFT' ? <MoonOutlined></MoonOutlined> : <SunOutlined />}
              </div>
            </Badge.Ribbon>
            {/* <div style={{width : 70, height: 50}} className='timeline-grid-row-cell'>Progress</div> */}
          </div>
          {orderedData.map((resource, index) => (
            <DraggableRow
              key={resource.id}
              resource={resource}
              index={index}
              moveRow={moveRow}
              height={heights[index]?.height}
            />
          ))}
        </div>
        <div className="gantt-chart">
          <div className="chart-inner">
            <div className="chat-timeline-grid">
              <div className="timeline-row header">
                {timelineSlots.map((slot, index) => (
                  <div
                    key={index}
                    style={{ width: 100, height: 50 }}
                    className="timeline-grid-row-cell"
                  >
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
              {orderedData.map((resource, index) => (
                <div
                  className="timeline-row"
                  style={{ height: heights[index].height }}
                >
                  {timelineSlots.map((slot, index) => (
                    <div className="timeline-grid-row-cell"></div>
                  ))}
                </div>
              ))}
            </div>
            <div
              className="chat-timelime-items"
              style={{ width: timelineSlots.length * 100 }}
            >
              <div
                className="chat-timeline-items-row"
                style={{ height: 50 }}
              ></div>
              {orderedData.map((resource, index) => (
                <>
                  <TimeLineRow
                    key={index}
                    excavator={resource}
                    excavatorId={resource.id}
                    plans={plans}
                    updatePlan={updatePlan}
                    addPlan={addPlan}
                    zoomSize={zoomSize}
                    endSlotTime={endSlotDateTime}
                    startSlotTime={startSlotDateTime}
                    rowHeight={heights[index].height}
                    openModal={openModal} />
                </>
              ))}

            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default TableComponent;
