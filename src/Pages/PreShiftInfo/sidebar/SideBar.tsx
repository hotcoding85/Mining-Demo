import React from 'react';
import { useDrag } from 'react-dnd';
import '../styles/SideBar.css';
import { Task } from '../interfaces/type';
import ExcavatorIcon from 'assets/icons/ExcavatorsIcon.svg';
import TruckIcons from 'assets/icons/TrucksIcon.svg';

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
  workLocation: string[];
  repairAndServiceInterval: string[];
  reasons: string[];
  resourceLaborAllocation: string[];
  longTermDown: string[];
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
    workLocation: ["workshop1", "workshop2", "workshop3"],
    repairAndServiceInterval: ["workshop1", "workshop2", "workshop3"],
    reasons: ["workshop1", "workshop2", "workshop3"],
    resourceLaborAllocation: ["workshop1", "workshop2", "workshop3"],
    longTermDown: ["workshop1", "workshop2", "workshop3"],
  }];

  return (
    <div className='task-list d-flex flex-column p-0 mt-0' >
      <div className='task-wrapper d-flex flex-column gap-3 py-4 px-3'>
        <span className='task-list-title text-start'>Locations</span>
        <div className='equip-lists d-flex align-items-center flex-wrap'>
          {data[0].locations.map((locations, index) => (
            <div className='task-chips py-2 px-3 btn-drag' key={index}>{locations}</div>
          ))}
        </div>
      </div>
      <div className='task-wrapper d-flex flex-column gap-3 py-4 px-3'>
        <span className='task-list-title text-start'>Operators</span>
        <div className='sub-title'>Excavators</div>
        <div className='equip-lists d-flex align-items-center flex-wrap'>
          {data[0].excavators.map((excavator, index) => (
            <div className='task-chips py-2 px-3' key={index}>
              <img src={ExcavatorIcon} className='icons'/>
              {excavator}
            </div>
          ))}
        </div>

        <div className='sub-title'>Trucks</div>
        <div className='equip-lists d-flex align-items-center flex-wrap'>
          {data[0].truckOperators.map((truck, index) => (
            <div className='task-chips py-2 px-3' key={index}>
              <img src={TruckIcons} className='icons'/>
              {truck}
            </div>
          ))}
        </div>
      </div>
      <div className='task-wrapper d-flex flex-column gap-3 py-4 px-3'>
        <span className='task-list-title text-start'>Trainers</span>
        <div className='equip-lists d-flex align-items-center flex-wrap'>
          {data[0].trainers.map((equipment, index) => (
            <div className='task-chips py-2 px-3' key={index}>{equipment}</div>
          ))}
        </div>
      </div>
      <div className='task-wrapper d-flex flex-column gap-3 py-4 px-3'>
        <span className='task-list-title text-start'>Ready for dispatch on Go-Line</span>
        <div className='sub-title'>Trucks</div>
        <div className='d-flex align-items-center equip-wrapper  justify-content-between '>
          {data[0].trucks.map((truck, index) => (
            <div className={truck !== ''? 'btn show-btn' : 'btn show-btn empty-btn'} key={index}>{truck}</div>
          ))}
        </div>
        <div className='sub-title'>Dozers</div>
        <div className='d-flex align-items-center equip-wrapper  justify-content-between '>
          {data[0].dozers.map((dozer, index) => (
            <div className={dozer !== ''? 'btn show-btn' : 'btn show-btn empty-btn'} key={index}>{dozer}</div>
          ))}
        </div>
        <div className='sub-title'>Drillers</div>
        <div className='d-flex align-items-center equip-wrapper  justify-content-between '>
          {data[0].drillers.map((driller, index) => (
            <div className={driller !== ''? 'btn show-btn' : 'btn show-btn empty-btn'} key={index}>{driller}</div>
          ))}
        </div>
      </div>

      <div className='task-wrapper d-flex flex-column gap-3 py-4 px-3'>
        <span className='task-list-title text-start'>Standby No Operator Assigned</span>
        <div className='sub-title'>Trucks</div>
        <div className='d-flex align-items-center equip-wrapper  justify-content-between '>
          {data[0].standByTrucks.map((truck, index) => (
            <div className={truck !== ''? 'btn show-btn show-alert' : 'btn show-btn empty-btn'} key={index}>{truck}</div>
          ))}
        </div>
        <div className='sub-title'>Dozers</div>
        <div className='d-flex align-items-center equip-wrapper  justify-content-between '>
          {data[0].standByDozers.map((dozer, index) => (
            <div className={dozer !== ''? 'btn show-btn show-alert' : 'btn show-btn empty-btn'} key={index}>{dozer}</div>
          ))}
        </div>
        <div className='sub-title'>Drillers</div>
        <div className='d-flex align-items-center equip-wrapper  justify-content-between '>
          {data[0].standByDrillers.map((driller, index) => (
            <div className={driller !== ''? 'btn show-btn show-alert' : 'btn show-btn empty-btn'} key={index}>{driller}</div>
          ))}
        </div>
      </div>

      <div className='task-wrapper d-flex flex-column gap-3 py-4 px-3'>
        <span className='task-list-title text-start'>Down for Repair</span>
        <div className='sub-title'>Trucks</div>
        <div className='d-flex align-items-center equip-wrapper  justify-content-between '>
          {data[0].repairTrucks.map((truck, index) => (
            <div className={truck !== ''? 'btn show-btn show-danger' : 'btn show-btn empty-btn'} key={index}>{truck}</div>
          ))}
        </div>
        <div className='sub-title'>Dozers</div>
        <div className='d-flex align-items-center equip-wrapper  justify-content-between '>
          {data[0].repairDozers.map((dozer, index) => (
            <div className={dozer !== ''? 'btn show-btn show-danger' : 'btn show-btn empty-btn'} key={index}>{dozer}</div>
          ))}
        </div>
        <div className='sub-title'>Drillers</div>
        <div className='d-flex align-items-center equip-wrapper  justify-content-between '>
          {data[0].repairDrillers.map((driller, index) => (
            <div className={driller !== ''? 'btn show-btn show-danger' : 'btn show-btn empty-btn'} key={index}>{driller}</div>
          ))}
        </div>
      </div>


      {/* <div className='task-wrapper d-flex flex-column gap-3 py-4 px-3'>
        <span className='task-list-title text-start'>Equipment List</span>
        <div className='equip-lists d-flex align-items-center flex-wrap'>
          {data[0].trucks.map((equipment, index) => (
            <div className='task-chips py-2 px-3' key={index}>{equipment}</div>
          ))}
        </div>
      </div>  */}


      {/* Rendering tasks with the TaskListItem component */}
      {/* {tasks.map((task) => (
        <TaskListItem key={task.id} task={task} />
      ))} */}
    </div>
  );
};

// const TaskListItem: React.FC<{ task: Task }> = ({ task }) => {
//   const [{ isDragging }, drag] = useDrag({
//     type: 'TASK',
//     item: { ...task, fromList: true },
//     collect: (monitor) => ({
//       isDragging: monitor.isDragging(),
//     }),
//   });

//   return (
//     <div ref={drag} className='task-list-item' style={{ opacity: isDragging ? 0.5 : 1 }}>
//       <p className='list-item-span fw-bold'>{task.label}</p>
//       <p className='list-item-span'>{task.name}</p>
//     </div>
//   );
// };

export default SideBar;
