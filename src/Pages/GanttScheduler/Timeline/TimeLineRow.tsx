import React, { useState, useRef, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import PlanItem from "./PlanItem";
import { Plan } from "../interfaces/type";
import "../styles/TimelineCell.css";

interface TimeLineRowProps {
  excavator: any;
  excavatorId: string;
  plans: any[];
  updatePlan: (updatedPlan: Plan, flag: string) => void;
  addPlan: (excavatorId: string, startTime: Date, plan?: Plan) => void;
  zoomSize: number;
  endSlotTime: Date;
  startSlotTime: Date;
  rowHeight: number;
  openModal: (plan?: Plan) => void;
}

const TimeLineRow: React.FC<TimeLineRowProps> = ({
  excavator,
  excavatorId,
  plans,
  updatePlan,
  addPlan,
  zoomSize,
  endSlotTime,
  startSlotTime,
  rowHeight,
  openModal,
}) => {
  const assignedPlans = plans.filter(
    (plan, index) =>
      plan.excavatorId == excavatorId 
    &&
      plan.startTime >= Number(startSlotTime) &&
      plan.startTime <= Number(endSlotTime)
  );

  const mousePosition = useRef({ x: 0, y: 0 });
  const rowRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: MouseEvent) => {
    if (rowRef.current) {
      mousePosition.current.x =
        e.pageX - rowRef.current.getBoundingClientRect().left;
      mousePosition.current.y =
        e.pageY - rowRef.current.getBoundingClientRect().top;
    }
  };

  const handleClick = (e: MouseEvent) => {
    // if(rowRef.current){
    //     const xPos = e.pageX - rowRef.current.getBoundingClientRect().left;
    //     const deltaMinutes = Math.round(
    //         xPos / 100 * zoomSize
    //     );
    //     const slotDateTime = new Date(startSlotTime.getTime() + deltaMinutes * 60 * 1000);
    //     const filteredPlans = plans.filter((plan) => (plan.excavatorId == excavatorId && plan.startTime <= slotDateTime && plan.endTime >= slotDateTime));
    //     if(filteredPlans.length == 0) {
    //         addPlan(excavatorId, slotDateTime);
    //     }
    // }
  };

  useEffect(() => {
    if (rowRef.current) {
      rowRef.current.addEventListener("dragover", handleDragOver);
      rowRef.current.addEventListener("mousedown", handleClick);
    }
    return () => {
      if (rowRef.current) {
        rowRef.current.removeEventListener("dragover", handleDragOver);
        rowRef.current.removeEventListener("mousedown", handleClick);
      }
    };
  }, [rowRef.current, plans]);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "PLAN",
    canDrop: () => excavator?.state === "ACTIVE" || excavator?.state === "STANDBY",  // Allow drop only if state is ACTIVE
    drop: (draggedPlan: Plan & { fromList?: boolean }) => {
      const deltaMinutes = Math.round(
        (mousePosition.current.x / 100) * zoomSize
      );
      const slotDateTime = new Date(
        startSlotTime.getTime() + deltaMinutes * 60 * 1000
      );

      if (draggedPlan.fromList) {
        addPlan(excavatorId, slotDateTime, draggedPlan);
      } else {
        const durationMinutes =
          (Number(draggedPlan.endTime) - Number(draggedPlan.startTime)) /
          (60 * 1000);
        const newStartTime = new Date(slotDateTime);
        const newEndTime = new Date(
          newStartTime.getTime() + durationMinutes * 60 * 1000
        );
        const newPlan = {
          ...draggedPlan,
          excavatorId,
          startTime: newStartTime,
          endTime: newEndTime,
          span: draggedPlan.span,
        };
        updatePlan(newPlan, "drag");
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  const calculateOverlapIndicesAndDepth = (plans) => {
    const overlapData: any = [];
    let maxOverlap = 1;
  
    plans.forEach((plan, index) => {
      let overlapIndex = 0;
      let currentDepth = 1;
  
      // Check overlap with previous tasks
      for (let i = 0; i < index; i++) {
        const otherPlan = plans[i];
        const isOverlapping =
          (otherPlan.startTime <= plan.endTime && otherPlan.endTime >= plan.startTime) ||
          (plan.startTime <= otherPlan.endTime && plan.endTime >= otherPlan.startTime);
  
        if (isOverlapping) {
          overlapIndex = Math.max(overlapIndex, overlapData[i].overlapIndex + 1);
          currentDepth = Math.max(currentDepth, overlapData[i].overlapIndex + 2); // +2 to count both current and overlapping task
        }
      }
  
      overlapData.push({ overlapIndex, depth: currentDepth });
      maxOverlap = Math.max(maxOverlap, currentDepth); // Track max depth for resizing
    });
  
    return { overlapData, maxDepth: maxOverlap };
  };
  

  return (
    <div
      ref={drop}
      className={`chat-timeline-items-row ${excavator.state === "ACTIVE" || excavator?.state === "STANDBY" ? '' : 'inactive-row'}`}
      style={{ height: rowHeight }}
    >
      <div ref={rowRef} className="row-inner">
        {assignedPlans.map((plan, index) => {
          const { overlapData, maxDepth } = calculateOverlapIndicesAndDepth(assignedPlans);
          return (
            <PlanItem
              key={index}
              plan={plan}
              depth={overlapData[index].depth}
              overlapIndex={overlapData[index].overlapIndex}
              maxDepth={maxDepth} // Pass the maximum depth to calculate sub-row height
              startSlotTime={startSlotTime}
              endSlotTime={endSlotTime}
              zoomSize={zoomSize}
              updatePlan={updatePlan}
              addPlan={addPlan}
              openModal={openModal}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TimeLineRow;
