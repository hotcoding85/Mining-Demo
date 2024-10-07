import React from 'react';
import { useDrag } from 'react-dnd';
import { Task } from '../interfaces/type';
import '../styles/TaskList.css';
import { Input } from 'antd';
import { getRandomFloat, getRandomInt } from 'utils/random';

interface TaskListProps {
  tasks: Task[];
  title: String;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, title }) => {
  return (
    <div className='task-list'>
      <span className='gantt-task-list-title'>{title}</span>
      <Input
        placeholder="Search..."
        onChange={(e) => { }}
        style={{ marginBottom: 16 }}
        allowClear
      />
      {tasks.map((task) => (
        <TaskListItem key={task.id} task={task} />
      ))}
    </div>
  );
};

const TaskListItem: React.FC<{ task: Task }> = ({ task }) => {
  const [{ isDragging }, drag] = useDrag({
    type: task.status == 'ACTIVE' ? 'TASK' : '',
    item: { ...task, fromList: true },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} className='task-list-item' style={{ backgroundColor: task.color, opacity: isDragging ? 0.5 : 1 }}>
      <p className='list-item-span bold'>{task.label}</p>
      <p className='list-item-span'>{task.name} (Density 2.40)</p>
      <p className='list-item-span'>Est. Tonnes 2,860.17</p>
      <p className='list-item-span'>Extracted 2,402.23</p>
      <p className='list-item-span'>Est Remainder
        {
          getRandomInt(0, 1) == 1 ?
            <span className='list-item-span' style={{ marginLeft: '4px' }}>{getRandomFloat(200, 954, 2)}</span>
            :
            <span className='list-item-span ml-1' style={{ marginLeft: '4px', color: 'red' }}>-{getRandomFloat(200, 954, 2)}</span>
        }
      </p>
    </div>
  );
};

export default TaskList;
