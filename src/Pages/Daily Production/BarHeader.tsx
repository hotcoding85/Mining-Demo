import React from 'react';
import './BarHeader.css'; 

const BarHeader = () => {
  return (
    <div className="container">
      <div className="text-section">
        <div className="text-section-header">
        <h1>Diggers</h1>
        <button className="trade-hours-button">Total today : 8</button>
        </div>
        <p>Total Tonnes per Hour Across Shift</p>
      </div>
      <div className="image-section">
        <img src="path-to-your-digger-image.png" alt="Digger" />
      </div>
    </div>
  );
};

export default BarHeader;
