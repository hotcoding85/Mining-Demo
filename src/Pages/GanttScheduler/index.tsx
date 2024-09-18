import React, { useEffect, useState } from 'react';
import { resources, sampleTaskLists } from './data/sampleData';
import ShiftSelector from './ShiftSelector';
import ZoomControl from './ZoomControl';
import TableComponent from './TableComponent';
import TaskList from './Tasklist/TaskList';
import { Col, Container, Row} from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { ShiftType, Task, resourceHeight } from './interfaces/type';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from "react-dnd-html5-backend";
import { DatePicker, DatePickerProps } from 'antd';
import dayjs from 'dayjs';
import "./styles/GanttScheduler.css"
import '../../App.css'


const GanttScheduler : React.FC = () => {
  document.title = "Gantt Scheduler | FMS Live";
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [shiftType, setShiftType] = useState<ShiftType>('DAY_SHIFT');
  const [zoomSize, setZoomSize] = useState<number>(60);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskList, setTaskLists] = useState<Task[]>(sampleTaskLists);
  const [heights, setHeights] = useState<resourceHeight[]>(resources.map(resource=>({resourceId : resource.id, height: 50})));

  const calculateRowIndex = (resourceId: string, startTime: Date, endTime: Date, taskId: string) =>{

    const filteredTasks = tasks.filter(task => (task.resourceId == resourceId && task.id != taskId));
    const rowIndexes = filteredTasks.map(task => task.rowIndex);
    const maxIndex = Math.max(...rowIndexes);
    let rowIndex = 0;
    while(1) {
      let isOverLap = filteredTasks.findIndex((task, index) => (task.rowIndex == rowIndex && ((startTime > task.startTime && startTime < task.endTime) ||(endTime > task.startTime && startTime < task.endTime))));
      if(isOverLap == -1){
        break;
      }
      rowIndex ++;
    }
    const updatedHeight: resourceHeight = {
      resourceId: resourceId,
      height: 50*(Math.max(maxIndex, rowIndex) + 1)
    }
    setHeights((prevHeights: resourceHeight[]) =>
      prevHeights.map((height) => (height.resourceId === updatedHeight.resourceId ? updatedHeight : height))
    );
    return rowIndex;
  }
  const addTask = (resourceId: string, startTime: Date, task?: Task) => {
  
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    const newTaskId = Math.random().toString(36).substring(7);
    const rowIndex = calculateRowIndex(resourceId, startTime, endTime,newTaskId);
    const newTask: Task = {
      id: newTaskId,
      name: task?.name || 'Task Name',
      label: task?.label || 'Task Label',
      startTime,
      endTime,
      resourceId,
      span: 1,
      color: task?.color || "#ff6247",
      progress: task?.progress || Math.ceil(Math.random() * 100),
      rowIndex:rowIndex
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);  
  };

  const updateTask = (updatedTask: Task) => {
    const rowIndex = calculateRowIndex(updatedTask.resourceId, updatedTask.startTime, updatedTask.endTime, updatedTask.id);
    const newTask = {
      ...updatedTask,
      rowIndex: rowIndex
    }
    setTasks((prevTasks: Task[]) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? newTask : task))
    );
  };

  const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
    if (date) {
      setSelectedDate(date.toDate());
    }
  };

  useEffect(()=> {
    setHeights(resources.map(resource=>({resourceId : resource.id, height: 50})))
  }, [])

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb breadcrumbItem="Gantt Scheduler" title="Operations" />
          <Row className='mb-3'>
            <Col className='d-flex justify-content-between'>
              <DatePicker allowClear={false} value={dayjs(selectedDate)} onChange={onDateChange} />
              <ShiftSelector shiftType={shiftType} setShiftType={setShiftType} />
              <div className='scheduler-tool'>
                <ZoomControl onZoomChange={setZoomSize} />
              </div>
            </Col>
          </Row>
              
          <DndProvider backend={HTML5Backend}>
            <Row className='mb-3'>
              <Col xs={10}>
                <TableComponent
                  data={resources}
                  tasks={tasks}
                  setTasks={setTasks}
                  selectedDate={selectedDate}
                  shiftType={shiftType}
                  zoomSize={zoomSize}
                  addTask={addTask}
                  updateTask={updateTask}
                  heights={heights}
                />
              </Col>
                
              <Col xs={2}>
                <TaskList tasks={taskList} />
              </Col>
            </Row>
          </DndProvider>  
        </Container>
      </div>
    </React.Fragment> 
  );
};

export default GanttScheduler;
