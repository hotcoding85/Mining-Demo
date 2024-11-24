import React, { useMemo, useState } from 'react';
import { Input, Button, List, Dropdown, MenuProps } from 'antd';
import { SearchOutlined, FilterOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Checkbox from 'antd/es/checkbox/Checkbox';
import { Card, Col, Row } from 'reactstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { LineGraph } from 'Components/Charts/LineGraph';
import { LAYOUT_MODE_TYPES } from 'Components/constants/layout';
import { useSelector } from 'react-redux';
import { LayoutSelector } from 'selectors';
const OilAnalysisData = (props: any) => {
    const metals = ["Al", "Cr", "Ku", "Fe", "Mo", "Ni", "Pb", "Sn"];
    const times = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

    // Generate random data for the chart
    const generateRandomData = () => {
        return times.map((time) => {
            const dataPoint = { time };
            metals.forEach((metal) => {
                dataPoint[metal] = Math.floor(Math.random() * 30) + 1; // Random values between 10 ~ 28
            });
            return dataPoint;
        });
    };

    const others = ["K (Potassium)", "Na (Sodium)", "Si (Silicon)"];
    const generateRandomOtherData = () => {
        return times.map((time) => {
            const dataPoint = { time };
            others.forEach((metal) => {
                dataPoint[metal] = Math.floor(Math.random() * 30) + 1; // Random values between 10 ~ 28
            });
            return dataPoint;
        });
    };

    const materialAnalysis = generateRandomData();

    const othersData = generateRandomOtherData();
    const { layoutModeType } = useSelector(LayoutSelector);

    const isLight = useMemo(
        () => layoutModeType === LAYOUT_MODE_TYPES.LIGHT,
        [layoutModeType]
    );

    const viscosityAnalysis =  [
        { time: "9:00", value: 10, level: "Low" },
        { time: "10:00", value: 15, level: "Medium" },
        { time: "11:00", value: 20, level: "High" },
        { time: "12:00", value: 14.5, level: "Medium" },
        { time: "13:00", value: 11, level: "Low" },
        { time: "14:00", value: 19, level: "High" },
        { time: "16:00", value: 10, level: "Low" },
        { time: "17:00", value: 7.5, level: "Low" },
    ]
    const getLineColor = (status: string) => {
        switch (status) {
          case "Optimal":
            return "#22c55e"
          case "Caution":
            return "#fbbf24"
          case "Warning":
            return "#ef4444"
          default:
            return "#22c55e"
        }
    }
    const waterContent = [
        { time: "9:00", value: 19, status: "Optimal" },
        { time: "10:00", value: 14, status: "Optimal" },
        { time: "11:00", value: 10, status: "Caution" },
        { time: "12:00", value: 13, status: "Optimal" },
        { time: "13:00", value: 6, status: "Warning" },
        { time: "14:00", value: 14, status: "Optimal" },
        { time: "16:00", value: 4.5, status: "Caution" },
        { time: "17:00", value: 3, status: "Warning" },
    ]
      
    // Define thresholds
    const thresholds = {
        optimal: { min: 15, max: 20, color: "green" },
        caution: { min: 8, max: 14, color: "orange" },
        warning: { min: 0, max: 7, color: "red" },
    };
      
    // Helper function to get color based on value
    const getColor = (value) => {
        if (value >= thresholds.optimal.min && value <= thresholds.optimal.max) return thresholds.optimal.color;
        if (value >= thresholds.caution.min && value <= thresholds.caution.max) return thresholds.caution.color;
        if (value >= thresholds.warning.min && value <= thresholds.warning.max) return thresholds.warning.color;
        return "gray";
    };
    return (
        <>
            <Col xs={12} md={6}  className='mt-4' style={{height: '400px'}}>
                <Card style={{width: '100%', height: '100%'}} className='pb-8'>
                <div className='mt-4 mb-4' style={{fontSize: '24px', paddingLeft: '2rem'}}>Detailed Viscosity Analysis</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={viscosityAnalysis} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} className='oil-analysis-rechart-legend'>
                            <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#b45309" />
                                <stop offset="50%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#fcd34d" />
                            </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
                            <XAxis dataKey="time"  />
                            <YAxis  domain={[0, 30]} ticks={[0, 5, 10, 15, 20, 25, 30]} />
                            <Line
                            type="monotone"
                            dataKey="value"
                            stroke="url(#colorGradient)"
                            strokeWidth={2}
                            dot={(props) => {
                                const level = viscosityAnalysis[props.index].level
                                let fill = "#fcd34d" // Low - amber-300
                                if (level === "Medium") fill = "#f59e0b" // amber-500
                                if (level === "High") fill = "#b45309" // amber-700
                                return (
                                <circle
                                    cx={props.cx}
                                    cy={props.cy}
                                    r={5}
                                    fill={fill}
                                    stroke="none"
                                />
                                )
                            }}
                            />
                            <Tooltip />
                            <Legend
                            content={({ payload }) => (
                                <div className="d-flex justify-flex-end" style={{justifyContent: 'flex-end', marginRight: '1rem'}}>
                                {["Low", "Medium", "High"].map((level) => (
                                    <div key={level} className="d-flex items-center gap-2" style={{marginLeft: '10px'}}>
                                    <div
                                        className={`h-3 w-3 rounded-full ${
                                        level === "Low"
                                            ? "bg-amber-300"
                                            : level === "Medium"
                                            ? "bg-amber-500"
                                            : "bg-amber-700"
                                        }`}
                                        style={{background: 
                                            level === "Low"
                                                ? "#fcd34d"
                                                : level === "Medium"
                                                ? "#f59e0b"
                                                : "#b45309",
                                            width: '10px', height: '10px', marginTop: '4px'
                                            }}
                                    />
                                    <span>{level}</span>
                                    </div>
                                ))}
                                </div>
                            )}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
            <Col xs={12} md={6}  className='mt-4' style={{height: '400px'}}>
                <Card style={{width: '100%', height: '100%'}} className=' pb-8'>
                <div className='mt-4 mb-4' style={{fontSize: '24px', paddingLeft: '2rem'}}>Wear Metals Analysis</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            className='oil-analysis-rechart-legend'
                            width={700}
                            height={400}
                            data={materialAnalysis}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                            <CartesianGrid
                                vertical={false}
                                stroke={isLight ? "#4F5868" : "#C1C1C1"}
                                />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {metals.map((metal, index) => (
                                <Line
                                key={metal}
                                type="linear"
                                dataKey={metal}
                                stroke={`hsl(${index * 45}, 70%, 50%)`} // Unique colors for each line
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
            <Col xs={12} md={6} className='mt-4' style={{height: '400px'}}>
                <Card style={{width: '100%', height: '100%'}} className=' pb-8'>
                <div className='mt-4 mb-4' style={{fontSize: '24px', paddingLeft: '2rem'}}>Water Content Analysis</div>
                <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={waterContent} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} className='oil-analysis-rechart-legend'>
                            <defs>
                            <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#389E0D" />
                                <stop offset="50%" stopColor="#FAAD14" />
                                <stop offset="100%" stopColor="#CF1322" />
                            </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
                            <XAxis dataKey="time"  />
                            <YAxis  domain={[0, 30]} ticks={[0, 5, 10, 15, 20, 25, 30]} />
                            <Line
                            type="monotone"
                            dataKey="value"
                            stroke="url(#colorGradient1)"
                            strokeWidth={2}
                            dot={(props) => {
                                const level = waterContent[props.index].status
                                let fill = "#389E0D" // Low - amber-300
                                if (level === "Caution") fill = "#FAAD14" // amber-500
                                if (level === "Warning") fill = "#CF1322" // amber-700
                                return (
                                <circle
                                    cx={props.cx}
                                    cy={props.cy}
                                    r={5}
                                    fill={fill}
                                    stroke="none"
                                />
                                )
                            }}
                            />
                            <Tooltip />
                            <Legend
                            content={({ payload }) => (
                                <div className="d-flex justify-flex-end" style={{justifyContent: 'flex-end', marginRight: '1rem'}}>
                                {["Optimal", "Caution", "Warning"].map((level) => (
                                    <div key={level} className="d-flex items-center gap-2" style={{marginLeft: '10px'}}>
                                    <div
                                        className={`h-3 w-3 rounded-full ${
                                        level === "Optimal"
                                            ? "bg-amber-300"
                                            : level === "Medium"
                                            ? "bg-amber-500"
                                            : "bg-amber-700"
                                        }`}
                                        style={{background: 
                                            level === "Optimal"
                                                ? "#389E0D"
                                                : level === "Caution"
                                                ? "#FAAD14"
                                                : "#CF1322",
                                            width: '10px', height: '10px', marginTop: '4px'
                                            }}
                                    />
                                    <span>{level}</span>
                                    </div>
                                ))}
                                </div>
                            )}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
            <Col xs={12} md={6} className='mt-4' style={{height: '400px'}}>
                <Card style={{width: '100%', height: '100%'}} className=' pb-8'>
                <div className='mt-4 mb-4' style={{fontSize: '24px', paddingLeft: '2rem'}}>Others</div>
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                            className='oil-analysis-rechart-legend'
                            width={700}
                            height={400}
                            data={othersData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                            <CartesianGrid
                                vertical={false}
                                stroke={isLight ? "#4F5868" : "#C1C1C1"}
                                />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {others.map((metal, index) => (
                                <Line
                                key={metal}
                                type="linear"
                                dataKey={metal}
                                stroke={`hsl(${index * 45}, 70%, 50%)`} // Unique colors for each line
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </Col>
        </>
    )
}

export default OilAnalysisData;