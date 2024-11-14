import React, { useState } from 'react';
import { Card } from 'reactstrap';
import Table from "Components/Common/Table";
import { Layout, Row, Col, Progress, Tabs, Badge, Avatar, Select, Button, Space, Segmented, DatePicker, DatePickerProps, Modal, Form, Input, TabsProps } from 'antd';
import { BellOutlined, ClockCircleOutlined, CarOutlined, BarChartOutlined, SafetyOutlined, ToolOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Container } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import dayjs from 'dayjs';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { shifts, shiftsInFormat } from 'utils/common';
import './style.scss'
import ShortIntervalControlMain from './ShortIntervalControlMain';
const { Header, Content } = Layout;
const { TabPane } = Tabs;

const performanceData = [
    { interval: '08:00', cycleTime: 45, utilization: 82, payloadEfficiency: 93, maintenanceDowntime: 1 },
    { interval: '10:00', cycleTime: 42, utilization: 85, payloadEfficiency: 95, maintenanceDowntime: 3 },
    { interval: '12:00', cycleTime: 40, utilization: 88, payloadEfficiency: 97, maintenanceDowntime: 6 },
    { interval: '14:00', cycleTime: 43, utilization: 86, payloadEfficiency: 94, maintenanceDowntime: 4 },
    { interval: '16:00', cycleTime: 41, utilization: 87, payloadEfficiency: 96, maintenanceDowntime: 2 },
    { interval: '18:00', cycleTime: 35, utilization: 76, payloadEfficiency: 89, maintenanceDowntime: 5 },
];

const fleetData = [
    { key: '1', truck: 'DT101', status: 'Hauling - Route A', state: 'Active' },
    { key: '2', truck: 'DT203', status: 'Loading - Pit B', state: 'Active' },
    { key: '3', truck: 'DT102', status: 'Maintenance', state: 'Inactive' },
];

const columns = [
    {
        title: 'Truck',
        dataIndex: 'truck',
        key: 'truck',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
    },
    {
        title: 'State',
        dataIndex: 'state',
        key: 'state',
        render: (state: string) => (
            <Badge status={state === 'Active' ? 'success' : 'default'} text={state} />
        ),
    },
];

export default function ShortIntervalControl() {
    document.title = "SIC | FMS Live";
    const [startDate, setStartDate] = useState(new Date());
    const [shift, setShift] = useState<any>('DS');
    const [searchParams, setSearchParams] = useSearchParams();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState('');

    const [displayType, setDisplayType] = useState("Main");
    const tabItems: TabsProps["items"] = [
        {
        key: "main",
        label: "Main",
        },
        {
        key: "analysis",
        label: "Analysis",
        },
        // {
        //   key: "profile",
        //   label: "Truck Load Profile",
        // },
    ];
    const onTabChange = (key: string) => {
        if (key === "main") {
            setDisplayType("Main");
        } else if (key === "analysis") {
            setDisplayType("Analysis");
        } 
    };

    const showModal = (content: string) => {
        setModalContent(content);
        setIsModalVisible(true);
    };
    const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
        if (date) {
            setStartDate(date.toDate());
            var params: URLSearchParams = new URLSearchParams({ shift: shift, date: format(date.toDate(), 'yyyy-MM-dd') });
            setSearchParams(params);
        }
    };

    const onShiftChange = (shiftInfo) => {
        // alert(JSON.stringify(shiftInfo))
        setShift(shiftInfo);
        var params: URLSearchParams = new URLSearchParams({ shift: shiftInfo, date: format(startDate, 'yyyy-MM-dd') });
        setSearchParams(params);
    }
    
    return (
        <React.Fragment>
            <div className="page-content sic-content">
                <Container fluid>
                    <Breadcrumb breadcrumbItem="Short Interval Control" title="Mine Dynamics" />
                    <Row className='mb-3' style={{justifyContent: 'flex-end'}}>
                        <Col md={8}>
                            <Tabs
                                className="truck-optimisation-tabs"
                                defaultActiveKey="1"
                                items={tabItems}
                                onChange={onTabChange}
                            />
                        </Col>
                        <Col md={16} className='d-flex flex-row-reverse'>
                            <Space>
                                {/* <Select
                                    className="basic-single"
                                    id="Crew"
                                    showSearch
                                    allowClear
                                    placeholder="Crew"
                                    style={{ width: '100px' }}
                                    options={getCrews()}
                                    value={selectedCrew}
                                    onChange={onCrewChange}
                                /> */}
                                <DatePicker allowClear={false} value={dayjs(startDate)} onChange={onDateChange} />
                                <Segmented className="customSegmentLabel customSegmentBackground" value={shift} onChange={onShiftChange} options={shiftsInFormat(shifts)} />
                                <Button icon={<BellOutlined />} />
                                <Button icon={<SettingOutlined />} onClick={() => showModal('planning')}>Plan</Button>
                                <Button icon={<FileTextOutlined />} onClick={() => showModal('review')}>Review</Button>
                            </Space>
                        </Col>
                    </Row>
                    {displayType === "Main" ? (
                        <ShortIntervalControlMain />
                    ) : (
                        <div>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12} md={6}>
                                    <Card className='p-4 main-card'>
                                    <div className="d-flex items-center justify-between mb-2" style={{justifyContent: 'space-between'}}>
                                        <span className="text-md font-medium">Cycle Time</span>
                                        <ClockCircleOutlined style={{fontSize: '20px'}} />
                                    </div>
                                    <div className="text-2xl font-bold">42 min</div>
                                    <div className="text-xs text-gray-500"><span className='font-color-red text-xs p-1'>-7%</span> from last shift</div>
                                    <Progress percent={66} showInfo={false} />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card className='p-4 main-card'>
                                    <div className="d-flex items-center justify-between mb-2" style={{justifyContent: 'space-between'}}>
                                        <span className="text-sm font-medium">Equipment Utilization</span>
                                        <CarOutlined style={{fontSize: '20px'}} />
                                    </div>
                                    <div className="text-2xl font-bold">87%</div>
                                    <div className="text-xs text-gray-500"><span className='font-color-green text-xs p-1'>+2%</span> from last shift</div>
                                    <Progress percent={87} showInfo={false} />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card className='p-4 main-card'>
                                    <div className="d-flex items-center justify-between mb-2" style={{justifyContent: 'space-between'}}>
                                        <span className="text-sm font-medium">Payload Efficiency</span>
                                        <BarChartOutlined style={{fontSize: '20px'}} />
                                    </div>
                                    <div className="text-2xl font-bold">95%</div>
                                    <div className="text-xs text-gray-500"><span className='font-color-green text-xs p-1'>+1%</span> from target</div>
                                    <Progress percent={95} showInfo={false} />
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Card className='p-4 main-card'>
                                    <div className="d-flex items-center justify-between mb-2" style={{justifyContent: 'space-between'}}>
                                        <span className="text-sm font-medium">Maintenance Downtime</span>
                                        <ToolOutlined style={{fontSize: '20px'}} />
                                    </div>
                                    <div className="text-2xl font-bold">32:13</div>
                                    <div className="text-xs text-gray-500"><span className='font-color-red text-xs p-1'>-1.6%</span> from target</div>
                                    <Progress percent={34} showInfo={false} />
                                    </Card>
                                </Col>
                            </Row>
                            <Card className="mt-6 p-4">
                                <h2 className="text-lg font-semibold mb-2">Performance Metrics</h2>
                                <p className="text-sm text-gray-500 mb-4">Interval-based monitoring for the current shift</p>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={performanceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="interval" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="cycleTime" fill="#8884d8" name="Cycle Time" />
                                        <Bar dataKey="utilization" fill="#82ca9d" name="Utilization" />
                                        <Bar dataKey="payloadEfficiency" fill="#ffc658" name="Payload Efficiency" />
                                        <Bar dataKey="maintenanceDowntime" fill="#ff8042" name="Maintenance Downtime" />
                                    </BarChart>
                                </ResponsiveContainer>
                                </Card>
                                <Card className="mt-6 p-4">
                                <Tabs defaultActiveKey="1">
                                    <TabPane tab="Fleet Status" key="1">
                                        <Table data={fleetData} columns={columns} />
                                    </TabPane>
                                    <TabPane tab="Active Alerts" key="2">
                                    <ul className="" style={{paddingLeft: 0}}>
                                        <li className="d-flex items-center space-x-4">
                                            <Badge status="error" text="Critical" />
                                            <span className='info-text text-xs' style={{paddingLeft: '1rem'}}>(DT102 unexpected downtime - Investigate immediately)</span>
                                        </li>
                                        <li className="d-flex items-center space-x-4">
                                            <Badge status="warning" text="Warning" />
                                            <span className='info-text text-xs' style={{paddingLeft: '1rem'}}>(Payload efficiency below target for DT201)</span>
                                        </li>
                                    </ul>
                                    </TabPane>
                                    <TabPane tab="Maintenance" key="3">
                                    <ul className="space-y-1">
                                        <li className="d-flex items-center justify-between" style={{justifyContent: 'space-between', alignItems: 'center'}}>
                                            <div className="d-flex items-center space-x-4">
                                                <ToolOutlined className='icons' />
                                                <div className='m-1'>
                                                <p className="font-medium">DT201</p>
                                                <p className="text-sm text-gray-500 info-text">Routine Maintenance</p>
                                                </div>
                                            </div>
                                            <Badge status="processing" text="In Progress" />
                                        </li>
                                        <li className="d-flex items-center justify-between" style={{justifyContent: 'space-between', alignItems: 'center'}}>
                                            <div className="d-flex items-center space-x-4">
                                                <ToolOutlined className='icons' />
                                                <div className='m-1'>
                                                <p className="font-medium">DT102</p>
                                                <p className="text-sm text-gray-500 info-text">Scheduled Check</p>
                                                </div>
                                            </div>
                                            <Badge status="default" text="Scheduled" />
                                        </li>
                                    </ul>
                                    </TabPane>
                                </Tabs>
                            </Card>
                        </div>
                    )
                    }
                    
                </Container>
                <Modal
                    title={modalContent === 'planning' ? 'Shift Planning' : 'Shift Review'}
                    visible={isModalVisible}
                    onOk={() => setIsModalVisible(false)}
                    onCancel={() => setIsModalVisible(false)}
                >
                    {modalContent === 'planning' ? (
                    <Form layout="vertical">
                        <Form.Item label="Shift Goals">
                        <Input.TextArea rows={4} placeholder="Enter shift goals..." />
                        </Form.Item>
                        <Form.Item label="Task Allocation">
                        <Input.TextArea rows={4} placeholder="Assign tasks to operators..." />
                        </Form.Item>
                    </Form>
                    ) : (
                    <Form layout="vertical">
                        <Form.Item label="Shift Performance">
                        <Input.TextArea rows={4} placeholder="Enter shift performance summary..." />
                        </Form.Item>
                        <Form.Item label="Areas for Improvement">
                        <Input.TextArea rows={4} placeholder="Identify areas for improvement..." />
                        </Form.Item>
                    </Form>
                    )}
                </Modal>
            </div>
        </React.Fragment>
    );
}