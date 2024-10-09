import React from "react";

interface TruckItemProps {
  title: string;
  fontColor: string;
}
const TruckItem: React.FC<TruckItemProps> = ({ title, fontColor }) => {
  return (
    <div
      className={"truck-item " + (title ? "filled" : "empty")}
      style={{ height: 64 }}
    >
      <p className="truck" style={{ color: fontColor }}>
        {title}
      </p>
    </div>
  );
};

export default TruckItem;
