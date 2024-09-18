import React, { useState } from 'react';
import './styles/ShiftSelector.css'
import { ShiftType } from './interfaces/type';
import { Segmented, Space } from 'antd';

interface ShiftSelectorProps {
  shiftType: ShiftType;
  setShiftType: React.Dispatch<React.SetStateAction<ShiftType>>;
}

const ShiftSelector: React.FC<ShiftSelectorProps> = ({ shiftType, setShiftType }) => {
  const [activeShift, setActiveShift] = useState<string>(shiftType);

  const shifts = [
    { id: 'WORK_WEEK', label: 'WORK WEEK', value: 'WORK_WEEK' },
    { id: 'WORK_DAY', label: 'WORK DAY', value: 'WORK_DAY' },
    { id: 'NIGHT_SHIFT', label: 'NIGHT SHIFT', value: 'NIGHT_SHIFT' },
    { id: 'DAY_SHIFT', label: 'DAY SHIFT', value: 'DAY_SHIFT' },
  ];

  const handleShiftClick = (shift: any) => {
    setActiveShift(shift);
    setShiftType(shift);
  };

  return (
    <div className="shift-selector">
      <Space>
        <Segmented className="customSegmentLabel customSegmentBackground" size='large' value={activeShift} options={shifts} onChange={(e) => handleShiftClick(e)} />
      </Space>
      {/* {shifts.map((shift) => (
        <button
          key={shift.id}
          className={`shift-button ${activeShift === shift.id ? 'active' : ''}`}
          onClick={() => handleShiftClick(shift.id)}
        >
          {shift.label}
        </button>
      ))} */}
    </div>
  );
};

export default ShiftSelector;
