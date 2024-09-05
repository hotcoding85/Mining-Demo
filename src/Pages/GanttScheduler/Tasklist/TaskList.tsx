import React from 'react';
import { useDrag } from 'react-dnd';
import { Task } from '../interfaces/type';
import '../styles/TaskList.css';

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  return (
    <div className='task-list'>
      <span className='task-list-title'>Active Benches</span>
      {tasks.map((task) => (
        <TaskListItem key={task.id} task={task} />
      ))}
    </div>
  );
};

const TaskListItem: React.FC<{ task: Task }> = ({ task }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { ...task, fromList: true },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} className='task-list-item' style={{ opacity: isDragging ? 0.5 : 1 }}>
        <p className='list-item-span bold'>{task.label}</p>
        <p className='list-item-span'>{task.name}</p>
    </div>
  );
};

export default TaskList;
