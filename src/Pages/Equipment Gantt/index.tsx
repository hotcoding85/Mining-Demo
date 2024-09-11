import React, { useState } from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import { DatePicker, DatePickerProps } from 'antd';
import dayjs from "dayjs";
import ShiftSelector from "Pages/GanttScheduler/ShiftSelector";
import ZoomControl from "Pages/GanttScheduler/ZoomControl";
import { ShiftType, Task } from "Pages/GanttScheduler/interfaces/type";
import { resources, sampleTaskLists, sampleTasks } from "Pages/GanttScheduler/data/sampleData";
import { DndProvider } from "react-dnd";
import TableComponent from "Pages/GanttScheduler/TableComponent";
import { HTML5Backend } from "react-dnd-html5-backend";

const EquipmentGantt = (props: any) => {
    document.title = "Equipment Gantt | FMS Live";

    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [shiftType, setShiftType] = useState<ShiftType>('DAY_SHIFT');
    const [zoomSize, setZoomSize] = useState<number>(60);
    const [tasks, setTasks] = useState<Task[]>(sampleTasks);
    const [taskList, setTaskLists] = useState<Task[]>(sampleTaskLists)

    const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
        if (date) {
            setSelectedDate(date.toDate());
        }
    };

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

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Manager Centre" breadcrumbItem="Equipment Activity Gantt" />
                    <Row>
                        <Col lg="12">
                            <DatePicker allowClear={false} value={dayjs(selectedDate)} onChange={onDateChange} />
                            <ShiftSelector shiftType={shiftType} setShiftType={setShiftType} />
                            <div className='scheduler-tool'>
                                <ZoomControl onZoomChange={setZoomSize} />
                            </div>
                        </Col>
                    </Row>

                    <DndProvider backend={HTML5Backend}>
                        <Row className='mb-3'>
                            <Col xs={12}>
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
                        </Row>
                    </DndProvider>
                </Container>
            </div>
        </React.Fragment >
    )
}

export default EquipmentGantt;