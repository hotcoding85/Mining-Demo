import React from 'react';
import { useDrag } from 'react-dnd';
import '../styles/SideBar.css';
import { SideMenu } from '../interfaces/type';
import ExcavatorIcon from 'assets/icons/ExcavatorsIcon.svg';
import TruckIcons from 'assets/icons/TrucksIcon.svg';

interface Equipments {
  sideMenu: SideMenu[];
}

const SideBar: React.FC<Equipments> = ({ sideMenu }) => {

  function DragTarget({ id, name, disabled, onDragStart, style, children }) {

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
            {children}
        </div>
    );
}

  return (
    <div className="task-list d-flex flex-column p-0 side-scroll">
      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">Locations</span>
        <div className="equip-lists">
          {sideMenu[0].locations.map((location, index) => (
            <DragTarget
              key={index}
              id={'location'}
              style='task-chips py-2 px-3 btn-drag'
              disabled={location !== ""? false : true}
              name={location}
              onDragStart={() => {}}
            >
              {location}
            </DragTarget>
          ))}
        </div>
      </div>
      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">Operators</span>
        <div className="sub-title">Excavators</div>
        <div className="equip-lists d-flex align-items-center flex-wrap">
          {sideMenu[0].excavators.map((excavator, index) => (
            <DragTarget
              key={index}
              id={'excavatorOperator'}
              style='task-chips py-2 px-3 btn-drag'
              disabled={excavator !== ""? false : true}
              name={excavator}
              onDragStart={() => {}}
              >
                <>
                  <img src={ExcavatorIcon} className="icons" />
                  {excavator}
                </>
              </DragTarget>
          ))}
        </div>

        <div className="sub-title">Trucks</div>
        <div className="equip-lists d-flex align-items-center flex-wrap">
          {sideMenu[0].truckOperators.map((truck, index) => (
            <DragTarget
              key={index}
              id={'truckOperator'}
              style='task-chips py-2 px-3 btn-drag'
              disabled={truck !== ""? false : true}
              name={truck}
              onDragStart={() => {}}
            >{
              <>
                  <img src={TruckIcons} className="icons" />
                  {truck}
                </>
            }
            </DragTarget>
          ))}
        </div>
      </div>
      {/* <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">Trainers</span>
        <div className="equip-lists d-flex align-items-center flex-wrap">
          {sideMenu[0].trainers.map((equipment, index) => (
            <DragTarget
              key={index}
              id={'trainer'}
              style='task-chips py-2 px-3 btn-drag'
              disabled={equipment !== ""? false : true}
              name={equipment}
              onDragStart={() => {}}
              >
                {equipment}
              </DragTarget>
          ))}
        </div>
      </div> */}
      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">
          Ready for dispatch on Go-Line
        </span>
        <div className="sub-title">Trucks</div>
        <div className="d-flex align-items-center equip-wrapper justify-content-between ">
          {sideMenu[0].trucks.map((truck, index) => (
            <DragTarget
            key={index}
            id={'truck'}
            style={ truck !== "" ? "btn show-btn" : "btn show-btn empty-btn"}
            disabled={truck !== ""? false : true}
            name={truck}
            onDragStart={() => {}}
            >
              {truck}
            </DragTarget>
          ))}
        </div>
        <div className="sub-title">Dozers</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {sideMenu[0].dozers.map((dozer, index) => (
            <DragTarget
              key={index}
              id={'dozer'}
              style={ dozer !== "" ? "btn show-btn" : "btn show-btn empty-btn"}
              disabled={dozer !== ""? false : true}
              name={dozer}
              onDragStart={() => {}}
            >
              {dozer}
            </DragTarget>

          ))}
        </div>
        <div className="sub-title">Drillers</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {sideMenu[0].drillers.map((driller, index) => (
            <DragTarget
              key={index}
              id={'driller'}
              style={ driller !== "" ? "btn show-btn" : "btn show-btn empty-btn"}
              disabled={driller !== ""? false : true}
              name={driller}
              onDragStart={() => {}}
              >
                {driller}
              </DragTarget>
          ))}
        </div>
      </div>

      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">
          Standby No Operator Assigned
        </span>
        <div className="sub-title">Trucks</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {sideMenu[0].standByTrucks.map((truck, index) => (
            <DragTarget
              key={index}
              id={'truck'}
              style={
                truck !== ""
                  ? "btn show-btn show-alert"
                  : "btn show-btn empty-btn"
              }
              disabled={truck !== ""? false : true}
              name={truck}
              onDragStart={() => {}}
              >
                {truck}
              </DragTarget>
          ))}
        </div>
        <div className="sub-title">Dozers</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {sideMenu[0].standByDozers.map((dozer, index) => (
            <DragTarget
              key={index}
              id={'dozer'}
              style={
                dozer !== ""
                  ? "btn show-btn show-alert"
                  : "btn show-btn empty-btn"
              }
              disabled={dozer !== ""? false : true}
              name={dozer}
              onDragStart={() => {}}
              >
                {dozer}
              </DragTarget>
          ))}
        </div>
        <div className="sub-title">Drillers</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {sideMenu[0].standByDrillers.map((driller, index) => (
            <DragTarget
              key={index}
              id={'driller'}
              style={
                driller !== ""
                  ? "btn show-btn show-alert"
                  : "btn show-btn empty-btn"
              }
              disabled={driller !== ""? false : true}
              name={driller}
              onDragStart={() => {}}
              >
                {driller}
              </DragTarget>
          ))}
        </div>
      </div>

      <div className="task-wrapper d-flex flex-column gap-3 py-4 px-3">
        <span className="task-list-title text-start">Down for Repair</span>
        <div className="sub-title">Trucks</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {sideMenu[0].repairTrucks.map((truck, index) => (
            <DragTarget
              key={index}
              id={'truck'}
              style= {
                truck !== ""
                  ? "btn show-btn show-danger"
                  : "btn show-btn empty-btn"
              }
              disabled={truck !== ""? false : true}
              name={truck}
              onDragStart={() => {}}
              >
                {truck}
              </DragTarget>
          ))}
        </div>
        <div className="sub-title">Dozers</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {sideMenu[0].repairDozers.map((dozer, index) => (
            <DragTarget
              key={index}
              id={'dozer'}
              style= {
                dozer !== ""
                  ? "btn show-btn show-danger"
                  : "btn show-btn empty-btn"
              }
              disabled={dozer !== ""? false : true}
              name={dozer}
              onDragStart={() => {}}
              >
                {dozer}
              </DragTarget>
          ))}
        </div>
        <div className="sub-title">Drillers</div>
        <div className="d-flex align-items-center equip-wrapper  justify-content-between ">
          {sideMenu[0].repairDrillers.map((driller, index) => (
            <DragTarget
              key={index}
              id={'driller'}
              style= {
                driller !== ""
                  ? "btn show-btn show-danger"
                  : "btn show-btn empty-btn"
              }
              disabled={driller !== ""? false : true}
              name={driller}
              onDragStart={() => {}}
              >
                {driller}
              </DragTarget>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
