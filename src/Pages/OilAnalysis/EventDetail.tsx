import React, { useMemo, useState } from 'react';
import { Input, Button, List, Dropdown, MenuProps } from 'antd';
import { SearchOutlined, FilterOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Checkbox from 'antd/es/checkbox/Checkbox';
import { Card, Col, Row } from 'reactstrap';
import { LayoutSelector } from 'selectors';
import { useSelector } from 'react-redux';
import { FLEET_TIME_STATE_COLOR, LAYOUT_MODE_TYPES } from 'Components/constants/layout';
import styled from "styled-components";
import ProgressPieChart from 'Components/Charts/ProgressPieChart';
import AnalysisCard from 'Pages/FleetTimeline/components/AnalysisCard';
import { DelayAnalysis} from './mock';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
const EventDetail = (props: any) => {
    const { layoutModeType } = useSelector(LayoutSelector);

    const isLight = useMemo(
        () => layoutModeType === LAYOUT_MODE_TYPES.LIGHT,
        [layoutModeType]
    );
    const TimeLabel = styled.div<{ color?: string }>`
        color: white;
        text-align: center;
        font-size: 20px;
        font-style: normal;
        line-height: 24px;
        margin-top: 10px;
    `;
    
    const ChartWrapper = styled.div`
        height: 185px;
    `;

    const generateRandomPercentages = (numStates: number): number[] => {
        let total = 100;
        let percentages: number[] = [];
    
        for (let i = 0; i < numStates - 1; i++) {
          let randomValue: number = Math.random() * total;
          randomValue = Math.round(randomValue);
          percentages.push(randomValue);
          total -= randomValue;
        }
        percentages.push(total); 
        return percentages;
    };
    const StateTimes = useMemo(() => {
        const textColor = isLight ? "#2A2A2A" : "#fff";
        const bgColor = isLight ? "#E0E0E0" : "#535E77";
    
        const percentages = generateRandomPercentages(5);
    
        return [
          {
            state: "General Repair",
            pctValue: percentages[0],
            color: FLEET_TIME_STATE_COLOR.ACTIVE,
            bgColor: bgColor,
            textColor: textColor,
          },
          {
            state: "PM Clinic",
            pctValue: percentages[1],
            color: FLEET_TIME_STATE_COLOR.STANDBY,
            bgColor: bgColor,
            textColor: textColor,
          },
          {
            state: "Servicing",
            pctValue: percentages[2],
            color: FLEET_TIME_STATE_COLOR.DOWN,
            bgColor: bgColor,
            textColor: textColor,
          },
          {
            state: "Others",
            pctValue: percentages[3],
            color: isLight ? "#828282" : "#fff",
            bgColor: bgColor,
            textColor: textColor,
          },
        ];
    }, [layoutModeType, isLight]);



    const DowntimeHoursByTaskType = [
        { name: "General Repair", value: Math.floor(Math.random() * 10) + 1, color: "#A8071A" },
        { name: "PM Clinic", value: Math.floor(Math.random() * 10) + 1, color: "#CF1322" },
        { name: "Servicing", value: Math.floor(Math.random() * 10) + 1, color: "#820014" },
        { name: "Other", value: Math.floor(Math.random() * 10) + 1, color: "#FF4D4F" },
    ];
    
    const FailureCausesFrequency = [
        { name: "Open", value: Math.floor(Math.random() * 10) + 1, color: "#A8071A" },
        { name: "Worn", value: Math.floor(Math.random() * 10) + 1, color: "#820014" },
        { name: "Defective", value: Math.floor(Math.random() * 10) + 1, color: "#820014" },
        { name: "Deteriorated", value: Math.floor(Math.random() * 10) + 1, color: "#A8071A" },
        { name: "Strategy Task", value: Math.floor(Math.random() * 10) + 1, color: "#820014" },
    ];
    
    return (
        <>
            <Col md={12}>
                <Card className="state-card">
                    <Col md={12} className='mt-4'>
                        <div style={{fontSize: '28px', textAlign: 'center'
                        }}>Task Distribution by Type</div>
                    </Col>
                    <div className="d-flex flex-column align-items-start" style={{marginBottom: '30px'}}>
                        <div className="state-card-title"></div>
                        <div className="mt-3 d-flex align-items-center justify-content-center w-100">
                        {StateTimes.map(({ state, ...item }) => (
                            <div
                            className="d-flex flex-column justify-content-center align-items-center gap-1"
                            style={{ width: "19%" }}
                            >
                            <ChartWrapper>
                                <ProgressPieChart width={300} {...item} />
                            </ChartWrapper>
                            <div className="state-label" style={{marginTop: '40px', fontSize: '18px'}}>{state}</div>
                            </div>
                        ))}
                        </div>
                    </div>
                </Card>
            </Col>
            <Col md={6}>
                <Card style={{height: '500px'}}>
                    <div className='mt-4 mb-4' style={{fontSize: '24px', paddingLeft: '2rem'}}>Downtime Hours by Task Type</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            height={100}
                            width={100}
                            data={DowntimeHoursByTaskType}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                            >
                           <CartesianGrid
                            vertical={false}
                            stroke={isLight ? "#4F5868" : "#C1C1C1"}
                            />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            {/* <Legend /> */}
                            <Bar
                                dataKey="value"
                                barSize={50}
                                isAnimationActive={false}
                                shape={(props) => {
                                const { x, y, width, height, fill } = props;
                                const barData = DowntimeHoursByTaskType[props.index]; // Match the color with data
                                return (
                                    <rect
                                    x={x}
                                    y={y}
                                    width={width}
                                    height={height}
                                    fill={barData.color}
                                    />
                                );
                                }}
                            />
                        </BarChart>
                        
                    </ResponsiveContainer>
                </Card>
            </Col> 
            <Col md={6}>
                <Card style={{height: '500px'}}>
                    <div className='mt-4 mb-4' style={{fontSize: '24px', paddingLeft: '2rem'}}>Failure Causes Frequency</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            height={100}
                            width={100}
                            data={FailureCausesFrequency}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                            >
                            <CartesianGrid
                            vertical={false}
                            stroke={isLight ? "#4F5868" : "#C1C1C1"}
                            />
                            <XAxis dataKey="name" />
                            <YAxis />
                            {/* <Tooltip /> */}
                            {/* <Legend /> */}
                            <Bar
                                dataKey="value"
                                barSize={50}
                                isAnimationActive={false}
                                shape={(props) => {
                                const { x, y, width, height, fill } = props;
                                const barData = FailureCausesFrequency[props.index]; // Match the color with data
                                return (
                                    <rect
                                    x={x}
                                    y={y}
                                    width={width}
                                    height={height}
                                    fill={barData.color}
                                    />
                                );
                                }}
                            />
                        </BarChart>
                        
                    </ResponsiveContainer>
                </Card>
            </Col> 
        </>
    )
}

export default EventDetail;