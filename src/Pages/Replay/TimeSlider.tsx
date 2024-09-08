import React, { useEffect, useMemo, useState } from 'react';
import { Slider, Button, Select } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import './TimeSlider.css'; // For custom styling

interface TimeSliderProps {
    isPlaying: boolean;
    speed: number;
    timeValue: number;
    totalTime: number;
    onTimeChange: (value: number) => void;
    onSpeedChange: (value: number) => void;
    onPlayPauseToggle: () => void;
    onNext: () => void;
    onPrev: () => void;
}

const TimeSlider: React.FC<TimeSliderProps> = (
  {
      isPlaying,
      speed,
      timeValue,
      totalTime,
      onTimeChange,
      onSpeedChange,
      onPlayPauseToggle,
      onNext,
      onPrev,
  }) => {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const { Option } = Select;

  const numSegments = 6;

  // Format seconds into hh:mm:ss
  const formatTime = (value?: number): React.ReactNode => {
      if (value === undefined) return null;
      const h = Math.floor(value / 3600);
      const m = Math.floor((value % 3600) / 60);
      const s = value % 60;
      return `${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  const formatTimeSegment = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (seconds == 0) {
      return "00m 00s"
    }
    return `${hours > 0 ? `${String(hours).padStart(2, '0')}h ` : ''}${minutes > 0 ? `${String(minutes).padStart(2, '0')}m ` : ''}${secs > 0 ? `${String(secs).padStart(2, '0')}s` : ''}`;
  };

  const generateTimeSegments = (totalSeconds, numSegments) => {
    const interval = Math.floor(totalSeconds / numSegments);
    const timeSegments = {};

    for (let i = 0; i < numSegments; i++) {
        const segmentSeconds = i * interval;
        timeSegments[segmentSeconds] = formatTimeSegment(segmentSeconds);
    }

    return timeSegments;
  };

  const timeSegments = useMemo(() => generateTimeSegments(totalTime, numSegments), [totalTime])

  return (
    <div className="time-slider-container">
      <Button
        type="text"
        icon={<LeftOutlined style={{color: 'white'}} />}
        onClick={onPrev}
      />

      {/* Play/Pause Button */}
      <Button
        type="text"
        icon={isPlaying ? <PauseCircleOutlined style={{color: 'white'}}  /> : <PlayCircleOutlined style={{color: 'white'}}  />}
        onClick={onPlayPauseToggle}
      />

      {/* Next Button */}
      <Button
        type="text"
        icon={<RightOutlined style={{color: 'white'}}  />}
        onClick={onNext}
      />

      {/* Speed Selector (1X, 2X, 3X, 4X) */}
      <Select
        className={'speed-indicator'}
        value={speed}
        style={{color: 'white'}} 
        onChange={onSpeedChange}
      >
        <Option value={1}>1X</Option>
        <Option value={2}>2X</Option>
        <Option value={3}>3X</Option>
        <Option value={4}>4X</Option>
      </Select>

      {/* Slider */}
      <Slider
        min={0}
        max={totalTime}
        value={timeValue}
        onChange={onTimeChange}
        tipFormatter={formatTime} // Show formatted time on handle
        marks={timeSegments}
        tooltip={{ open: timeValue == 0 ? false : true, placement: 'bottom' }} // Always show tooltip
      />

      {/* Display formatted time near the slider handle */}
      <span className="time-value">{formatTime(totalTime)}</span>
    </div>
  );
};

export default TimeSlider;
