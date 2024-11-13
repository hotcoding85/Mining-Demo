import React, { useEffect, useMemo, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import Reports from "./components/Reports";
import Visual from "./components/Visual";
import { Dropdown, DropdownType } from "Components/Common/Dropdown";
import './index.scss'
import { excavators, generateTruckData } from "./components/Visual/sampleData";
const PayloadOptimsation
 = (props: any) => {
    document.title = "Payload Optimzation | FMS Live";

    const [excavator, setExcavator] = useState<DropdownType>({
        label: "EX201 (EMU_S04_465_004)",
        value: "EX201",
    });

    const _excavators = useMemo(() => {
        const results: any = []
        excavators.map(exc => {
            const item = {
                label: `${exc.id} (${exc.souroce})`,
                value: `${exc.id}`,
            }
            results.push(item)
        })
        return results
    }, [excavators])

    const _initData = [
        { label: 'Best Load', time: '01:35', value: '149t', color: '#4CAF50' },
        { label: 'Worst Load', time: '03:35', value: '78t', color: '#FF5252' },
        { label: 'Avg Tonnes', value: '83.4t' },
        { label: 'Total Tonnes', value: '156.43t' },
        { label: 'Avg Time', value: '01:44' },
        { label: 'Total Time', value: '02:34' },
    ]
    const [data, setData] = useState(_initData)
    const trucks = useMemo(() => {
        const _trucks = generateTruckData(excavators)
        return _trucks
    }, [])

    useEffect(() => {
        const filteredTrucks = trucks.filter(truck => truck.excavator === excavator.value);

        // Convert `totalTonnes` and `avgLoadingTime` to numerical values for calculations
        const totalTonnesArray = filteredTrucks.map(truck => parseFloat(truck.totalTonnes));
        const avgTimesInSeconds = filteredTrucks.map(truck => {
            const [mins, secs] = truck.avgLoadingTime.split(':').map(Number);
            return mins * 60 + secs;
        });

        // Calculate metrics
        const bestLoadIndex = totalTonnesArray.indexOf(Math.max(...totalTonnesArray));
        const worstLoadIndex = totalTonnesArray.indexOf(Math.min(...totalTonnesArray));

        const totalTonnes = totalTonnesArray.reduce((sum, value) => sum + value, 0);
        const avgTonnes = (totalTonnes / filteredTrucks.length).toFixed(2);
        const totalTimeInSeconds = avgTimesInSeconds.reduce((sum, time) => sum + time, 0);
        const avgTimeInSeconds = Math.ceil(totalTimeInSeconds / filteredTrucks.length);

        // Helper function to format time in mm:ss
        const formatTime = (seconds: number): string => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        setData([
            { label: 'Best Load', time: filteredTrucks[bestLoadIndex].avgLoadingTime, value: `${totalTonnesArray[bestLoadIndex]}t`, color: '#4CAF50' },
            { label: 'Worst Load', time: filteredTrucks[worstLoadIndex].avgLoadingTime, value: `${totalTonnesArray[worstLoadIndex]}t`, color: '#FF5252' },
            { label: 'Avg Tonnes', value: `${avgTonnes}t` },
            { label: 'Total Tonnes', value: `${totalTonnes.toFixed(2)}t` },
            { label: 'Avg Time', value: formatTime(avgTimeInSeconds) },
            { label: 'Total Time', value: formatTime(totalTimeInSeconds) },
        ])
    }, [excavator])

    return (
        <React.Fragment>
            <div className="page-content" style={{paddingBottom: '0px'}}>
                <Container fluid>
                    <Breadcrumb title="Mine Dynamics" breadcrumbItem="Payload Optimsation" />
                    <Row>
                        <Col lg="12">
                            <div className="payload-optimization-reports"> 
                                <Dropdown
                                    label="Choose Excavator"
                                    items={_excavators}
                                    value={excavator}
                                    onChange={setExcavator}
                                />
                            </div>
                        </Col>
                        <Col lg="12">
                            <div className="reports-summary-container">
                                <Row gutter={[16, 16]} justify="space-between" style={{padding: '0px'}}>
                                    {data.map((item, index) => (
                                        <Col key={index} xs={12} sm={6} md={4} lg={2}>
                                            <div className="reports-summary-card" >
                                                <div className="reports-summary-label">{item.label}</div>
                                                <div className="d-flex" style={{alignItems: 'center', justifyContent: 'space-between', width: '100%', height: 40}}>
                                                    {item.time && <div className="reports-summary-time" style={{ color: item.color }}>
                                                        {item.time && <span>{item.time}</span>}
                                                    </div>}
                                                    <div className="reports-summary-value" style={{ color: item.color, paddingLeft: item.time ? '1rem' : '0' }}>
                                                        {item.value}
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        </Col>
                        <Col lg="12">
                            <Visual excavator={excavator} trucks={trucks.filter(truck => truck.excavator === excavator.value)} />
                        </Col>
                        <Col lg="12" style={{marginTop: '.5rem'}}>
                            <Reports trucks={trucks} /> 
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment >
    )
}

export default PayloadOptimsation;