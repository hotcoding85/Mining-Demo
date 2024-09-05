import React, { useState } from 'react';
import { resources, sampleTaskLists, sampleTasks } from './data/sampleData';
import ShiftSelector from './ShiftSelector';
import ZoomControl from './ZoomControl';
import TableComponent from './TableComponent';
import TaskList from './Tasklist/TaskList';
import { Col, Container, Row} from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { ShiftType, Task } from './interfaces/type';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from "react-dnd-html5-backend";
import { DatePicker, DatePickerProps } from 'antd';
import dayjs from 'dayjs';
import "./styles/GanttScheduler.css"
import '../../App.css'


const GanttScheduler = () => {
  document.title = "Gantt Scheduler | FMS Live";
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [shiftType, setShiftType] = useState<ShiftType>('DAY_SHIFT');
  const [zoomSize, setZoomSize] = useState<number>(60);
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [taskList, setTaskLists] = useState<Task[]>(sampleTaskLists)

  const addTask = (resourceId: string, startTime: Date, task?: Task) => {
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    console.log(endTime);

    const newTask: Task = {
      id: Math.random().toString(36).substring(7),
      name: task?.name || 'Task Name',
      label: task?.label || 'Task Label',
      startTime,
      endTime,
      resourceId,
      span: task?.span || 1,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);  
  };

  const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
    if (date) {
      setSelectedDate(date.toDate());
    }
  };


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
              <Col xs={9}>
                <TableComponent
                  data={resources}
                  tasks={tasks}
                  setTasks={setTasks}
                  selectedDate={selectedDate}
                  shiftType={shiftType}
                  zoomSize={zoomSize}
                  addTask={addTask}
                />
              </Col>
                
              <Col xs={3}>
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
