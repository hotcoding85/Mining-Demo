import React, { useState, useRef, useEffect, useMemo } from "react";
import { useDrag } from "react-dnd";
import { Plan } from "../interfaces/type";
import "../styles/TimelineCell.css";
import { Space, Tooltip } from "antd";
import { Color } from "antd/es/color-picker";
import { useSelector } from "react-redux";
import { MaterialSelector } from "selectors";

interface PlanItemProps {
  plan: any;
  zoomSize: number;
  depth: number;
  maxDepth: number;
  overlapIndex: number;
  endSlotTime: Date;
  startSlotTime: Date;
  updatePlan: (updatedPlan: Plan, flag: string) => void;
  addPlan: (excavatorId: string, startTime: Date, plan?: Plan) => void;
  openModal: (plan?: Plan) => void;
}
const rowHeight = 49
const PlanItem: React.FC<PlanItemProps> = ({
  plan,
  zoomSize,
  endSlotTime,
  startSlotTime,
  updatePlan,
  openModal,
  overlapIndex,
  depth,
  maxDepth
}) => {
  const elementPos =
    (100 * (plan.startTime.getTime() - startSlotTime.getTime())) /
    (60 * 1000 * zoomSize);
  const elementWidth =
    (100 *
      (Math.min(endSlotTime.getTime(), plan.endTime.getTime()) -
        Math.max(plan.startTime.getTime(), startSlotTime.getTime()))) /
    (60 * 1000 * zoomSize);
  const progressbarWidth = ((100 - plan.progress) * elementWidth) / 100;
  const [isResizing, setIsResizing] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [initialX, setInitialX] = useState<number | null>(null);
  const [initialStartTime, setInitialStartTime] = useState<Date | null>(null);
  const [initialEndTime, setInitialEndTime] = useState<Date | null>(null);
  const [resizeDirection, setResizeDirection] = useState<
    "left" | "right" | null
  >(null);
  const { materials } = useSelector(MaterialSelector)
  const color = useMemo(() => {
    const material = materials.find((mat) => mat.id === plan.source.materialId);

    // Use material color if it exists and is defined, otherwise assign random color
    const color = material?.color || "#ff6247";

    return color;
  }, [plan])

  const planElementRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (planElementRef.current) {
      const planElementRect = planElementRef.current.getBoundingClientRect();
      const isOnRightEdge =
        e.clientX >= planElementRect.right - 10 &&
        e.clientX <= planElementRect.right;
      const isOnLeftEdge =
        e.clientX >= planElementRect.left &&
        e.clientX <= planElementRect.left + 10;

      if (isOnRightEdge || isOnLeftEdge) {
        setIsResizing(true);
        setInitialX(e.clientX);
        setInitialStartTime(plan?.startTime || null);
        setInitialEndTime(plan?.endTime || null);
        setResizeDirection(isOnRightEdge ? "right" : "left");
        e.stopPropagation();
      }
      setIsEditable(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing && initialX !== null && initialStartTime && initialEndTime) {
      const deltaX = e.clientX - initialX;
      const deltaMinutes = Math.round((deltaX / 100) * zoomSize);
      if (resizeDirection === "right") {
        const newEndTime = new Date(
          initialEndTime.getTime() + deltaMinutes * 60 * 1000
        );
        if (newEndTime > initialStartTime) {
          updatePlan(
            {
              ...plan!,
              endTime: newEndTime < endSlotTime ? newEndTime : endSlotTime,
            },
            "scroll"
          );
        }
      } else if (resizeDirection === "left") {
        const newStartTime = new Date(
          initialStartTime.getTime() + deltaMinutes * 60 * 1000
        );
        if (newStartTime < initialEndTime) {
          updatePlan(
            {
              ...plan!,
              startTime:
                newStartTime > startSlotTime ? newStartTime : startSlotTime,
            },
            "scroll"
          );
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
    if (planElementRef.current) {
      const planElementRect = planElementRef.current.getBoundingClientRect();
      const isOnRightEdge =
        e.clientX >= planElementRect.right - 10 &&
        e.clientX <= planElementRect.right;
      const isOnLeftEdge =
        e.clientX >= planElementRect.left &&
        e.clientX <= planElementRect.left + 10;

      if (isOnRightEdge || isOnLeftEdge) {
        planElementRef.current.style.cursor = "ew-resize"; // Change cursor to resize when near either edge
      } else {
        planElementRef.current.style.cursor = "grab"; // Change cursor to grab when inside the plan
      }
    }
  };

  const handleEditPlan = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isResizing && e.currentTarget != e.target && isEditable) {
      openModal(plan);
    }
    setIsEditable(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const [{ isDragging }, drag] = useDrag({
    type: "PLAN",
    item: { ...plan },
    canDrag: !!plan && !isResizing,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      setIsEditable(false);
    },
  });

  const setRefs = (node: HTMLDivElement | null) => {
    planElementRef.current = node;
    drag(node);
  };

  const fullHeight = 50;

  const itemHeight = useRef<number>(fullHeight / depth);
  const topOffset = useRef<number>(0);
  useEffect(() => {
    itemHeight.current = fullHeight / maxDepth
  }, [maxDepth])
  useEffect(() => {
    topOffset.current = itemHeight.current * overlapIndex
  }, [overlapIndex])
  return (
    <div
      ref={setRefs}
      className="plan-item"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseOver}
      onMouseUp={handleEditPlan}
      style={{
        backgroundColor: color,
        width: elementWidth,
        height: `${itemHeight.current}px`, // Dynamic height based on overlap count
        position: "absolute",
        borderRadius: '0px',
        left: elementPos,
        top: overlapIndex * itemHeight.current, // Dynamic offset for stacking overlaps
        display: "flex",
        alignItems: "center",
        opacity: isDragging ? 0.5 : 1,
        justifyContent: "center",
        overflow: "hidden",
        zIndex: 1,
      }}
    >
      <Tooltip title={(
        <div className="plan-item-tooltip-content">
          <div><strong>Plan:</strong> {plan.name}</div>
          <div><strong>Time:</strong> 
            {new Date(plan.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ~ ' +
              new Date(plan.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div><strong>Block ID:</strong> {plan?.source?.blockId}</div>
          <div><strong>Est. Density:</strong> {plan?.source?.density}</div>
          <div><strong>Est. Grade:</strong> {plan?.source?.grade}</div>
          <div><strong>Tonnes: </strong> {plan?.source?.volume - plan?.source?.tonnes}</div>
          <div><strong>Remainder: </strong> {plan?.source?.tonnes || '---'}</div>
        </div>
      )}>
      <div className="plan-item-inner">
          <Space>
            {/* <div>
                    <Avatar src={<img src={pc1250} alt="avatar" style={{width:'80%', height:'60%'}} />} size={36} style={{ backgroundColor: 'white' }}/>
                  </div> */}
            <div style={{ textAlign: "center" }}>
              <div className="list-item-span bold" style={{marginTop: '2px', fontSize: '12px'}}>
                {plan.name} ({plan?.blockId})
              </div>
              {/* <div className="list-item-span" style={{marginTop: '-2px', fontSize: '12px'}}>
                {" "}
                Est. Remainder{" "}
                <span style={{ fontWeight: "bold" }}>2,456.23</span>
              </div> */}
            </div>
          </Space>  
        <div
          className="plan-item-progress-bar"
          style={{ width: progressbarWidth }}
        ></div>
      </div>
      </Tooltip>
    </div>
  );
};

export default PlanItem;
