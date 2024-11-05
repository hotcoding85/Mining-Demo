import React, { useMemo, useState } from "react";
import { useDrag } from "react-dnd";
import "../styles/PlanList.scss";
import { Input } from "antd";

interface NoAssignPlanListProps {
  plans: any[];
  title: string;
}

const NoAssignPlanList: React.FC<NoAssignPlanListProps> = ({
  plans,
  title,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const searchString = `${plan.name} ${plan.blockId}`.toLowerCase();
      return searchString.includes(searchTerm.toLowerCase());
    });
  }, [plans, searchTerm]);
  return (
    <div className="plan-list">
      <Input
        placeholder="Search..."
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: 16 }}
        allowClear
      />
      {filteredPlans.map((plan) => (
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
      <p className="list-item-span">Est. Tonnes: {plan?.source.volume}</p>
      <p className="list-item-span">Extracted: {!isNaN(plan?.source.volume - plan?.source.tonnes) ? plan?.source.volume - plan?.source.tonnes : ''}</p>
      <p className="list-item-span">Est Remainder : {plan?.source.tonnes}</p>
    </div>
  );
};

export default NoAssignPlanList;
