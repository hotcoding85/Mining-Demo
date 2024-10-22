import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Slider, Button, Select } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, RightOutlined, LeftOutlined, PlayCircleFilled, PauseCircleFilled } from '@ant-design/icons';
import './TimeSlider.css'; // For custom styling
import { LAYOUT_MODE_TYPES } from 'Components/constants/layout';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import BACK from '../assets/back.svg'
import FORWARD from '../assets/forward.svg'
interface TimeSliderProps {
    style: any;
    isPlaying: boolean;
    speed: number;
    timeValue: number;
    totalTime: number;
    isFleetTracking?: boolean;
    onTimeChange: (value: number) => void;
    onSpeedChange: (value: number) => void;
    onPlayPauseToggle: () => void;
    onNext: () => void;
    onPrev: () => void;
    onPrevRoute: () => void;
    onNextRoute: () => void;
}

const TimeSlider: React.FC<TimeSliderProps> = (
  {
      style,
      isPlaying,
      speed,
      timeValue,
      totalTime,
      isFleetTracking = true,
      onTimeChange,
      onSpeedChange,
      onPlayPauseToggle,
      onNext,
      onPrev,
      onPrevRoute,
      onNextRoute
  }) => {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const { Option } = Select;

  const { layoutModeType } = useSelector(
    createSelector(
      (state: any) => state.Layout,
      (layout) => ({
        layoutModeType: layout.layoutModeTypes,
      })
    )
  );
  const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;

  const numSegments = 6;

  // Format seconds into hh:mm:ss
  const formatTime = (value?: number): React.ReactNode => {
      if (value === undefined) return null;
      const h = Math.floor(value / 3600);
      const m = Math.floor((value % 3600) / 60);
      const s = value % 60;
      return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString()}:${s.toString().padStart(2, '0')}`;
  };

  const formatTimeSegment = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (seconds == 0) {
      return "00m 00s"
    }
    return `${hours > 0 ? `${String(hours).padStart(2, '0')}:` : ''}${minutes > 0 ? `${String(minutes).padStart(2, '0')}:` : ''}${secs > 0 ? `${String(secs).padStart(2, '0')}` : ''}`;
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

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
    const document: any = window.document;
    const targetDiv = document.getElementById("3d-map-view"); // Target div for fullscreen
    
    if (
      !document.fullscreenElement && 
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement && 
      !document.msFullscreenElement
    ) {
      // Enter fullscreen mode for the target div
      if (targetDiv?.requestFullscreen) {
        targetDiv.requestFullscreen();
      } else if (targetDiv?.mozRequestFullScreen) {
        targetDiv.mozRequestFullScreen();
      } else if (targetDiv?.webkitRequestFullscreen) {
        targetDiv.webkitRequestFullscreen();
      } else if (targetDiv?.msRequestFullscreen) {
        targetDiv.msRequestFullscreen();
      }
    } else {
      // Exit fullscreen mode
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }, [isFullscreen])
  
  return (
    <div className="time-slider-container" style={style}>
      {/* Play/Pause Button */}
      <Button
        style={{marginRight: '10px'}}
        type="text"
        icon={isPlaying ? <PauseCircleFilled style={{fontSize: '32px', color: 'white'}}  /> : <PlayCircleFilled style={{fontSize: '32px', color: 'white'}}  />}
        onClick={onPlayPauseToggle}
      />

      {
        isFleetTracking && <>
          <Button
            type="text"
            icon={<img  src={BACK} />}
            onClick={onPrev}
            style={{marginRight: '10px'}}
          />
    
    
          {/* Next Button */}
          <Button
            type="text"
            icon={<img src={FORWARD}  />}
            onClick={onNext}
            style={{marginRight: '10px'}}
          />
        </>
      }
      
      <Button
        type="text"
        icon={<LeftOutlined style={{color: 'white'}} />}
        onClick={onPrevRoute}
        style={{marginRight: '10px'}}
      />


      {/* Next Button */}
      <Button
        type="text"
        icon={<RightOutlined style={{color: 'white'}} />}
        onClick={onNextRoute}
        style={{marginRight: '10px'}}
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
      <span className="time-value">{formatTime(timeValue)}</span>
      <Slider
        min={0}
        max={totalTime}
        value={timeValue}
        onChange={onTimeChange}
        // tipFormatter={formatTime} // Show formatted time on handle
        // marks={timeSegments}
        // tooltip={{ open: timeValue == 0 ? false : true, placement: 'bottom' }} // Always show tooltip
      />

      {/* Display formatted time near the slider handle */}
      <span className="time-value">{formatTime(totalTime)}</span>

      <Button className='btn-setting-timeslider' style={{color: 'white'}}>
        <i className="fas fa-cog"></i>
      </Button>

      <Button className='btn-full-screen-timeslider' onClick={toggleFullscreen} style={{color: 'white'}}>
        {!isFullscreen ? <i className="bx bx-fullscreen"></i> : <i className="bx bx-exit-fullscreen"></i>}
      </Button>
    </div>
  );
};

export default TimeSlider;
