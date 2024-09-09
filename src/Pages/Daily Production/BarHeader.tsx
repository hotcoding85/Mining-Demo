import React from 'react';
import './BarHeader.css'; 

const BarHeader = (props) => {
  return (
    <div className="bar-header-container light-box">
      <div className="text-section">
        <div className="text-section-header">
        <h1>{props.title}</h1>
        <button className="trade-hours-button">Total today : {props.total}</button>
        </div>
        <p>Total Tonnes per Hour Across Shift</p>
      </div>
      <div className="image-section">
        <img src={props.image} alt="Digger" width={150} />
      </div>
    </div>
  );
};

export default BarHeader;
