import React, { useState } from "react";
import { Button, Tooltip, Image } from "antd";
import "./FloatingButton.css"; // You can style the highlight here

// Import truck images
import TOPTruck from "../../../assets/images/Truck/TOP.png";
import LEFTTruck from "../../../assets/images/Truck/LEFT.png";
import RIGHTTruck from "../../../assets/images/Truck/RIGHT.png";
import FRONTTruck from "../../../assets/images/Truck/FRONT.png";
import BACKTruck from "../../../assets/images/Truck/BACK.png";

const FloatingActionButton = ({ _viewType, setViewType }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleButtons = () => {
    setIsOpen(!isOpen);
  };

  const handleViewChange = (view) => {
    setViewType(view);
    toggleButtons();
  };

  return (
    <div className="fab-container">

      {/* Floating Buttons with animation */}
      <div className={`fab-buttons open`}>
        <Tooltip title="Front View">
          <Button
            shape="circle"
            className={`fab-button fab-front ${
              _viewType === "FRONT" ? "active" : ""
            }`}
            onClick={() => handleViewChange("FRONT")}
          >
            <Image src={FRONTTruck} preview={false} width={40} alt="FRONT" />
          </Button>
        </Tooltip>

        <Tooltip title="Left View">
          <Button
            shape="circle"
            className={`fab-button fab-left ${
              _viewType === "LEFT" ? "active" : ""
            }`}
            onClick={() => handleViewChange("LEFT")}
          >
            <Image src={LEFTTruck} preview={false} width={50} alt="LEFT" />
          </Button>
        </Tooltip>

        <Tooltip title="Top View">
          <Button
            shape="circle"
            className={`fab-button fab-top ${
              _viewType === "TOP" ? "active" : ""
            }`}
            onClick={() => handleViewChange("TOP")}
          >
            <Image src={TOPTruck} preview={false} width={20} alt="TOP" />
          </Button>
        </Tooltip>

        <Tooltip title="Right View">
          <Button
            shape="circle"
            className={`fab-button fab-right ${
              _viewType === "RIGHT" ? "active" : ""
            }`}
            onClick={() => handleViewChange("RIGHT")}
          >
            <Image src={RIGHTTruck} preview={false} width={40} alt="RIGHT" />
          </Button>
        </Tooltip>

        <Tooltip title="Back View">
          <Button
            shape="circle"
            className={`fab-button fab-back ${
              _viewType === "BACK" ? "active" : ""
            }`}
            onClick={() => handleViewChange("BACK")}
          >
            <Image src={BACKTruck} preview={false} width={50} alt="BACK" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default FloatingActionButton;
