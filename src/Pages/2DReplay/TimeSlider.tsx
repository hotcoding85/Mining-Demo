import React, {  } from "react";
import { Slider, Button } from "antd";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import "./TimeSlider.css"; 
import { LAYOUT_MODE_TYPES } from "Components/constants/layout";
import { useSelector } from "react-redux";
import { MdOutlineForward10 } from "react-icons/md";
import { MdOutlineReplay10 } from "react-icons/md";
import { CiSettings } from "react-icons/ci";
import { RiFullscreenFill } from "react-icons/ri";
import { LayoutSelector } from "selectors";

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

const TimeSlider: React.FC<TimeSliderProps> = ({
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

  const { layoutModeType } = useSelector(LayoutSelector);
  const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;

  // Format seconds into hh:mm:ss
  const formatTime = (value?: number): React.ReactNode => {
    if (value === undefined) return null;
    const h = Math.floor(value / 3600);
    const m = Math.floor((value % 3600) / 60);
    const s = value % 60;
    return `${h.toString().padStart(2, "0")}h ${m
      .toString()
      .padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
  };

  const formatTimeSegment = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (seconds == 0) {
      return "00m 00s";
    }
    return `${hours > 0 ? `${String(hours).padStart(2, "0")}h ` : ""}${
      minutes > 0 ? `${String(minutes).padStart(2, "0")}m ` : ""
    }${secs > 0 ? `${String(secs).padStart(2, "0")}s` : ""}`;
  };
  return (
    <div className="time-slider-container">
      <Button
        type="text"
        icon={
          isPlaying ? (
            <PauseCircleOutlined
              style={{ color: isLight ? "black" : "white", fontSize: "24px" }}
              onClick={onPlayPauseToggle}
            />
          ) : (
            <PlayCircleOutlined
              style={{ color: isLight ? "black" : "white", fontSize: "24px" }}
              onClick={onPlayPauseToggle}
            />
          )
        }
      />

      {/* prev */}
      <Button
        type="text"
        icon={<MdOutlineReplay10 style={{ color: "white" }} size={20} />}
        onClick={onPrev}
      />

      {/* Next Button */}
      <Button
        type="text"
        icon={<MdOutlineForward10 style={{ color: "white" }} size={20} />}
        onClick={onNext}
      />

      <span className="time-value">00:00</span>

      {/* Slider */}
      <Slider
        style={{ position: "relative", top: "0" }}
        min={0}
        max={totalTime}
        value={timeValue}
        onChange={onTimeChange}
        tipFormatter={formatTime} 
        tooltip={{ open: timeValue == 0 ? false : true, placement: "bottom" }} // Always show tooltip
      />

      {/* Display formatted time near the slider handle */}
      <span className="time-value">{formatTime(totalTime)}</span>

      <Button
        type="text"
        icon={<CiSettings style={{ color: "white" }} size={20} />}
      />
      <Button
        type="text"
        icon={<RiFullscreenFill style={{ color: "white" }} size={20} />}
      />
    </div>
  );
};

export default TimeSlider;
