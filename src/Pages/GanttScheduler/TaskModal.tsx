import React, { useState, useEffect } from 'react';
import { Task } from './interfaces/type';
import './styles/Modal.css'

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Task;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave,  task }) => {
  const [taskName, setTaskName] = useState<string>('');
  const [taskLabel, setTaskLabel] = useState<string>('');

  // Reset the fields whenever the modal is opened or after a task is saved
  useEffect(() => {
    if (isOpen) {
      setTaskName(task?.name || '');
      setTaskLabel(task?.label || '');
    }
  }, [isOpen, task]);

  const handleSave = () => {

    if(task) {
        const updatedTask: Task = {
            ...task,
            label : taskLabel,
            name : taskName
        };
        onSave(updatedTask);
        onClose();
    }
  };

  // Function to handle clicks outside the modal content
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'show' : ''}`} onClick={handleOverlayClick}>
      <div className="modal-content" >
        <div className="modal-header">
          <h2>Edit the task</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <label>
          Task Label:
          <input type="text" value={taskLabel} onChange={(e) => setTaskLabel(e.target.value)} />
        </label>
        <label>
          Task Name:
          <input type="text" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
        </label>
        <button onClick={handleSave}>Save Task</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default TaskModal;
