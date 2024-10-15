import React, { useState } from 'react';
import { Card, Col, Row } from 'antd';
import './CubeSwitcher.css';  // Add necessary styles for the cube

const CubeSwitcher: React.FC<{ onSwitchView: (view: string) => void, currentView: string }> = ({ onSwitchView, currentView }) => {
  const [activeView, setActiveView] = useState<string>(currentView);

  const handleViewChange = (view: string) => {
    setActiveView(view);
    onSwitchView(view);  // Call the parent component's function to change camera
  };

  return (
    <div className="cube-wrapper">
      <div className="cube">
        <div className={`cube-face front ${activeView === 'Front' ? 'active' : ''}`} onClick={() => handleViewChange("Front")}>Front</div>
        <div className={`cube-face back ${activeView === 'Back' ? 'active' : ''}`} onClick={() => handleViewChange("Back")}>Back</div>
        <div className={`cube-face left ${activeView === 'Left' ? 'active' : ''}`} onClick={() => handleViewChange("Left")}>Left</div>
        <div className={`cube-face right ${activeView === 'Right' ? 'active' : ''}`} onClick={() => handleViewChange("Right")}>Right</div>
        <div className={`cube-face top ${activeView === 'Top' ? 'active' : ''}`} onClick={() => handleViewChange("Top")}>Top</div>
      </div>
    </div>
  );
};

export default CubeSwitcher;
