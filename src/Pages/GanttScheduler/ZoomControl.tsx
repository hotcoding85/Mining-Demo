import React, { useState } from 'react';

interface ZoomControlProps {
  onZoomChange: (zoomSize: number) => void;
}

const zoomSteps = [5, 15, 30, 60];

const ZoomControl: React.FC<ZoomControlProps> = ({ onZoomChange }) => {
  const [zoom, setZoom] = useState<number>(60);

  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = Number(event.target.value);
    const nearestZoom = zoomSteps.reduce((prev, curr) => Math.abs(curr - newZoom) < Math.abs(prev - newZoom) ? curr : prev);
    setZoom(nearestZoom);
    onZoomChange(nearestZoom);
  };

  return (
    <div className="zoom-control">
      <input
        type="range"
        min="5"
        max="60"
        step="1"
        value={zoom}
        onChange={handleZoomChange}
        className="zoom-slider"
      />
      <div className="zoom-label" style={{textAlign: 'center'}}>Zoom: {zoom} mins</div>
    </div>
  );
};

export default ZoomControl;
