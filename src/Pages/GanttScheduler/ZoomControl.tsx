import React, { useState } from 'react';

interface ZoomControlProps {
  steps: number[];
  currentZoom: number;
  minZoom: number;
  maxZoom: number;
  handleZoomChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ZoomControl: React.FC<ZoomControlProps> = ({ minZoom, maxZoom, currentZoom, handleZoomChange }) => {

  return (
    <div className="zoom-control">
      <input
        type="range"
        min={minZoom}
        max={maxZoom}
        step="1"
        value={currentZoom}
        onChange={handleZoomChange}
        className="zoom-slider"
      />
      <div className="zoom-label" style={{textAlign: 'center'}}>Interval: {currentZoom} mins</div>
    </div>
  );
};

export default ZoomControl;
