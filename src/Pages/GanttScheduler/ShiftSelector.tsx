import React, {useState} from 'react';
import './styles/ShiftSelector.css'
import { ShiftType } from './interfaces/type';

interface ShiftSelectorProps {
  shiftType: ShiftType;
  setShiftType: React.Dispatch<React.SetStateAction<ShiftType>>;
}

const ShiftSelector: React.FC<ShiftSelectorProps> = ({ shiftType, setShiftType }) => {
  const [activeShift, setActiveShift] = useState<string>(shiftType);

  const shifts = [
    { id: 'WORK_WEEK', label: 'WORK WEEK' },
    { id: 'WORK_DAY', label: 'WORK DAY' },
    { id: 'NIGHT_SHIFT', label: 'NIGHT SHIFT' },
    { id: 'DAY_SHIFT', label: 'DAY SHIFT' },
  ];

  const handleShiftClick = (shift: any) => {
    setActiveShift(shift);
    setShiftType(shift);
  };

  return (
    <div className="shift-selector">
      {shifts.map((shift) => (
        <button
          key={shift.id}
          className={`shift-button ${activeShift === shift.id ? 'active' : ''}`}
          onClick={() => handleShiftClick(shift.id)}
        >
          {shift.label}
        </button>
      ))}
    </div>
  );
};

export default ShiftSelector;
