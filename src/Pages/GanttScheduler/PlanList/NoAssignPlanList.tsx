import React from "react";
import { useDrag } from "react-dnd";
import "../styles/PlanList.css";
import { Input } from "antd";

interface NoAssignPlanListProps {
  plans: any[];
  title: string;
}

const NoAssignPlanList: React.FC<NoAssignPlanListProps> = ({
  plans,
  title,
}) => {
  return (
    <div className="plan-list">
      <span className="gantt-plan-list-title">{title}</span>
      <Input
        placeholder="Search..."
        onChange={(e) => {}}
        style={{ marginBottom: 16 }}
        allowClear
      />
      {plans.map((plan) => (
        <PlanListItem key={plan.id} plan={plan} />
      ))}
    </div>
  );
};

interface PlanListItemProps {
  plan: any;
}

const PlanListItem: React.FC<PlanListItemProps> = ({ plan }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "PLAN",
    item: { ...plan, fromList: true },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className="plan-list-item"
      style={{ backgroundColor: plan.color, opacity: isDragging ? 0.5 : 1 }}
    >
      <p className="list-item-span bold">{plan.excavator?.name}</p>

      <p className="list-item-span">
        {plan.name} - {plan?.blockId}
      </p>
      <p className="list-item-span">
        Density : {plan?.density ? plan?.density : "-"}
      </p>
      <p className="list-item-span">Est. Tonnes {plan?.tonnes}</p>
      <p className="list-item-span">Extracted 2,402.23</p>
      <p className="list-item-span">Est Remainder : -</p>
    </div>
  );
};

export default NoAssignPlanList;
