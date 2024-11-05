import React, { useMemo, useState } from "react";
import { useDrag } from "react-dnd";
import "../styles/PlanList.scss";
import { Input } from "antd";

interface PlanListProps {
  plans: any[];
  title: String;
}

const PlanList: React.FC<PlanListProps> = ({ plans, title }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredPlans = useMemo(() => {
    console.log(plans)
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
      <p className="list-item-span">Est. Tonnes : {plan?.volume}</p>
      <p className="list-item-span">Extracted : {!isNaN(plan?.volume - plan?.tonnes) ? plan?.volume - plan?.tonnes : ''}</p>
      <p className="list-item-span">Est Remainder : {plan?.tonnes}</p>
    </div>
  );
};

export default PlanList;
