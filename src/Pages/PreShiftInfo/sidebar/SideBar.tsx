import React from 'react';
import { useDrag } from 'react-dnd';
import '../styles/SideBar.css';
import { Task } from '../interfaces/type';
import ExcavatorIcon from 'assets/icons/ExcavatorsIcon.svg';
import TruckIcons from 'assets/icons/TrucksIcon.svg';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';

interface TaskListProps {
  tasks: Task[];
}
interface DataItem {
  locations: string[];
  excavators: string[];
  truckOperators: string[];
  trainers: string[];
  trucks: string[];
  dozers: string[];
  drillers: string[];
  standByTrucks: string[];
  standByDozers: string[];
  standByDrillers: string[];
  repairTrucks: string[];
  repairDozers: string[];
  repairDrillers: string[];
}

const SideBar: React.FC<TaskListProps> = ({ tasks }) => {
  const data: DataItem[] = [{
    locations: ["440_BLK1_HG02", "440_BLK1_HG03", "440_BLK1_HG04", "440_BLK1_HG05", "440_BLK1_HG06", "440_BLK1_HG07"],
    excavators: ["J.Burch", "R.Simpon", "E.Freeman", "R.Carson"],
    truckOperators: ["E.Levy", "L.Manning"],
    trainers: ["Trainers1", "Trainers2"],
    trucks: ["DT105", "DT106", "DT107"],
    dozers: ["LOA01", "LOA01", "LOA01"],
    drillers: ["DT105", "DT106", "DT107"],
    standByTrucks: ["DT105", "", ""],
    standByDozers: ["", "", ""],
    standByDrillers: ["", "", ""],
    repairTrucks: ["DT110", "DT111", ""],
    repairDozers: ["", "", ""],
    repairDrillers: ["", "", ""],
  }];

  function Draggable({ id, name, disabled, onDragStart, style }) {

    const [{ isDragging }, drag] = useDrag(() => ({
      type: "image",
      item: { id: id, value: name },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));

    return (
        <div
            className={style}
            draggable
            ref={drag}
            onDragStart={disabled ? (e) => e.preventDefault() : onDragStart}
        >
            {name}
        </div>
    );
}

  return (
    <div className="task-list d-flex flex-column p-0 side-scroll">
      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">Locations</span>
        <div className="equip-lists d-flex align-items-center flex-wrap">
          {data[0].locations.map((location, index) => (
            <Draggable
              key={index}
              id={'location'}
              style='task-chips py-2 px-3 btn-drag'
              disabled={location !== ""? false : true}
              name={location}
              onDragStart={() => console.log("drag")}
            />
          ))}
        </div>
      </div>
      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">Operators</span>
        <div className="sub-title">Excavators</div>
        <div className="equip-lists d-flex align-items-center flex-wrap">
          {data[0].excavators.map((excavator, index) => (
            <Draggable
              key={index}
              id={'excavatorOperator'}
              style='task-chips py-2 px-3 btn-drag'
              disabled={excavator !== ""? false : true}
              name={
                <>
                  <img src={ExcavatorIcon} className="icons" />
                  {excavator}
                </>
              }
              onDragStart={() => console.log("drag")}
            />
          ))}
        </div>

        <div className="sub-title">Trucks</div>
        <div className="equip-lists d-flex align-items-center flex-wrap">
          {data[0].truckOperators.map((truck, index) => (
            <Draggable
              key={index}
              id={'truckOperator'}
              style='task-chips py-2 px-3 btn-drag'
              disabled={truck !== ""? false : true}
              name={
                <>
                  <img src={TruckIcons} className="icons" />
                  {truck}
                </>
              }
              onDragStart={() => console.log("drag")}
            />
          ))}
        </div>
      </div>
      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">Trainers</span>
        <div className="equip-lists d-flex align-items-center flex-wrap">
          {data[0].trainers.map((equipment, index) => (
            <Draggable
              key={index}
              id={'trainer'}
              style='task-chips py-2 px-3 btn-drag'
              disabled={equipment !== ""? false : true}
              name={equipment}
              onDragStart={() => console.log("drag")}
            />
          ))}
        </div>
      </div>
      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">
          Ready for dispatch on Go-Line
        </span>
        <div className="sub-title">Trucks</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {data[0].trucks.map((truck, index) => (
            <Draggable
            key={index}
            id={'truck'}
            style={ truck !== "" ? "btn show-btn" : "btn show-btn empty-btn"}
            disabled={truck !== ""? false : true}
            name={truck}
            onDragStart={() => console.log("drag")}
          />
          ))}
        </div>
        <div className="sub-title">Dozers</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {data[0].dozers.map((dozer, index) => (
            <Draggable
              key={index}
              id={'dozer'}
              style={ dozer !== "" ? "btn show-btn" : "btn show-btn empty-btn"}
              disabled={dozer !== ""? false : true}
              name={dozer}
              onDragStart={() => console.log("drag")}
            />
          ))}
        </div>
        <div className="sub-title">Drillers</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {data[0].drillers.map((driller, index) => (
            <Draggable
              key={index}
              id={'driller'}
              style={ driller !== "" ? "btn show-btn" : "btn show-btn empty-btn"}
              disabled={driller !== ""? false : true}
              name={driller}
              onDragStart={() => console.log("drag")}
            />
          ))}
        </div>
      </div>

      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">
          Standby No Operator Assigned
        </span>
        <div className="sub-title">Trucks</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {data[0].standByTrucks.map((truck, index) => (
            <Draggable
              key={index}
              id={'truck'}
              style={
                truck !== ""
                  ? "btn show-btn show-alert"
                  : "btn show-btn empty-btn"
              }
              disabled={truck !== ""? false : true}
              name={truck}
              onDragStart={() => console.log("drag")}
            />
          ))}
        </div>
        <div className="sub-title">Dozers</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {data[0].standByDozers.map((dozer, index) => (
            <Draggable
              key={index}
              id={'dozer'}
              style={
                dozer !== ""
                  ? "btn show-btn show-alert"
                  : "btn show-btn empty-btn"
              }
              disabled={dozer !== ""? false : true}
              name={dozer}
              onDragStart={() => console.log("drag")}
            />
          ))}
        </div>
        <div className="sub-title">Drillers</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {data[0].standByDrillers.map((driller, index) => (
            <Draggable
              key={index}
              id={'driller'}
              style={
                driller !== ""
                  ? "btn show-btn show-alert"
                  : "btn show-btn empty-btn"
              }
              disabled={driller !== ""? false : true}
              name={driller}
              onDragStart={() => console.log("drag")}
            />
          ))}
        </div>
      </div>

      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">Down for Repair</span>
        <div className="sub-title">Trucks</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {data[0].repairTrucks.map((truck, index) => (
            <Draggable
              key={index}
              id={'truck'}
              style= {
                truck !== ""
                  ? "btn show-btn show-danger"
                  : "btn show-btn empty-btn"
              }
              disabled={truck !== ""? false : true}
              name={truck}
              onDragStart={() => console.log("drag")}
            />
          ))}
        </div>
        <div className="sub-title">Dozers</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {data[0].repairDozers.map((dozer, index) => (
            <Draggable
              key={index}
              id={'dozer'}
              style= {
                dozer !== ""
                  ? "btn show-btn show-danger"
                  : "btn show-btn empty-btn"
              }
              disabled={dozer !== ""? false : true}
              name={dozer}
              onDragStart={() => console.log("drag")}
            />
          ))}
        </div>
        <div className="sub-title">Drillers</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {data[0].repairDrillers.map((driller, index) => (
            <Draggable
              key={index}
              id={'driller'}
              style= {
                driller !== ""
                  ? "btn show-btn show-danger"
                  : "btn show-btn empty-btn"
              }
              disabled={driller !== ""? false : true}
              name={driller}
              onDragStart={() => console.log("drag")}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
