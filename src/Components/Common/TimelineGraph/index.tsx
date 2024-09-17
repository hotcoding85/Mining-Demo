import React, { useEffect, useRef, useState } from "react";
import { DataSet, Timeline as VisTimeline, DataGroup, DataItem } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import "./index.css"

interface TimelineGraphProps {
  groupsData: DataGroup[];
  tasksData: DataItem[];
  selectedInterval: string;
}

const TimelineGraph: React.FC<TimelineGraphProps> = ({ groupsData, tasksData, selectedInterval }) => {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const timelineInstance = useRef<VisTimeline | null>(null);

  const [timelineInitialized, setTimelineInitialized] = useState<boolean>(false);  

  const groups = new DataSet<DataGroup>(groupsData);
  const items = new DataSet<DataItem>(tasksData);

  useEffect(() => {
    if (timelineRef.current && !timelineInstance.current) {
      const options = {
        stack: false,
        editable: false,
        zoomable: false,
        horizontalScroll: true,
        verticalScroll: true,
      };
      timelineInstance.current = new VisTimeline(timelineRef.current, items, groups, options);
      setTimelineInitialized(true); 
    }
  }, [groups, items]);

 

  const applyInterval = (interval: string) => {
    const intervalInMinutes = parseInt(interval, 10);
  
    const now = new Date(); 
    const start = new Date();
    start.setHours(6, 0, 0, 0);
  
    
    const end = new Date(Math.max(start.getTime(), now.getTime())); 
  
    if (timelineInstance.current && timelineInitialized) {
      timelineInstance.current.setWindow(start, end);
      timelineInstance.current.redraw(); 
  
      let scale: 'minute' | 'hour' = 'minute';
      let step = intervalInMinutes;
  
      if (intervalInMinutes === 60) {
        scale = 'hour';
        step = 1;
      }
  
      timelineInstance.current.setOptions({
        timeAxis: {
          scale: scale,
          step: step,
        },
      });
  
     
      setTimeout(() => {
        timelineInstance.current?.moveTo(now, {
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad',
          },
        });
      }, 500); 
    }
  };
  
  

  
  useEffect(() => {
    if (timelineInitialized && selectedInterval) {
      applyInterval(selectedInterval);
    }
  }, [selectedInterval, timelineInitialized]);  

  return <div ref={timelineRef} className="timeline-container"></div>;
};

export default TimelineGraph;
