import React from 'react';
import "./style.css";

interface PerformanceHeaderProps {
  label: string;
  status: string;
  currentValue: string;
  totalValue: string;
}

const PerformanceHeader: React.FC<PerformanceHeaderProps> = ({
  label,
  status,
  currentValue,
  totalValue
}) => {
  return (
    <div className="header-1 sub-continer">
      <div className="header-label">
        <div className="label-1">{label}</div>
        <div className={`label-2 ${status === "On target" ? "on-target" : "below-target"}`}>{status}</div>
      </div>
      <div className={`value ${status === "On target" ? "on-target" : "below-target"}`}>{currentValue}</div>
      <div className="total-value">out of {totalValue}</div>
    </div>
  );
};

export default PerformanceHeader;