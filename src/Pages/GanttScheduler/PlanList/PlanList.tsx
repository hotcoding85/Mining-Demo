import React from "react";
import { useDrag } from "react-dnd";
import "../styles/PlanList.scss";
import { Input } from "antd";

interface PlanListProps {
  plans: any[];
  title: String;
}

const PlanList: React.FC<PlanListProps> = ({ plans, title }) => {
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
    type: plan.status == "ACTIVE" ? "PLAN" : "",
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
      <p className="list-item-span bold">
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

export default PlanList;
