import Breadcrumb from "Components/Common/Breadcrumb";
import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { ResponsiveSankey } from '@nivo/sankey'
import { DatePicker, Radio, Segmented, Space } from "antd";
import _ from 'lodash';

interface InputObject {
    source: string;
    destination: string;
    tonnage: number;
    material: string;
    color: string;
}

interface Node {
    id: string;
    nodeColor: string;
}

interface Link {
    source: string;
    target: string;
    value: number;
}

const { RangePicker } = DatePicker;

const MaterialMovement = (props: any) => {
    document.title = "Material Movement | FMS Live";

    const [timeRange, setTimeRange] = useState('CURRENT_SHIFT');

    const rawData = [
        { source: '440_BLK1', destination: 'ROM HG01', tonnage: 7144, material: 'HG01', color: '#FFB629' },
        { source: '440_BLK1', destination: 'Central Waste Dump', tonnage: 2477, material: 'WASTE', color: '#3F3D3B' },
        { source: '440_BLK1', destination: 'ROM LG01', tonnage: 4846, material: 'LG01', color: '#7C5710' },
        { source: '440_BLK1', destination: 'ROM MG02', tonnage: 9106, material: 'LG02', color: '#62440C' },

        { source: 'ROM LG01', destination: 'Crusher', tonnage: 6851, material: 'LG01', color: '#7C5710' },
        { source: 'ROM Waste', destination: 'Crusher', tonnage: 5231, material: 'WASTE', color: '#3F3D3B' },

        { source: '440_BLK2', destination: 'ROM MG01', tonnage: 4869, material: 'MG01', color: '#936714' },
        { source: '440_BLK2', destination: 'South Waste Dump', tonnage: 6874, material: 'WASTE', color: '#3F3D3B' },
        { source: '440_BLK2', destination: 'Central Waste Dump', tonnage: 1213, material: 'WASTE', color: '#3F3D3B' },
        { source: '440_BLK2', destination: 'ROM Waste', tonnage: 9140, material: 'WASTE', color: '#3F3D3B' },

        { source: 'ROM MG01', destination: 'Crusher', tonnage: 5077, material: 'MG01', color: '#936714' },
        { source: 'ROM LG03', destination: 'Crusher', tonnage: 2887, material: 'LG03', color: '#5F340D' },
        { source: 'ROM Waste', destination: 'Crusher', tonnage: 9052, material: 'WASTE', color: '#3F3D3B' },
    ]

    // Step 1: Extract unique nodes
    const nodeNames = new Set();
    rawData.forEach(item => {
        nodeNames.add(item.source);
        nodeNames.add(item.destination);
    });

    const nodes = Array.from(nodeNames).map(name => ({ name }));

    // Step 2: Create a mapping of node names to indices
    const nodeIndexMap = new Map(nodes.map((node, index) => [node.name, index]));

    // Step 3: Create links
    const links = rawData.map((item, i) => ({
        key: i.toString(),
        source: nodeIndexMap.get(item.source),
        target: nodeIndexMap.get(item.destination),
        value: item.tonnage,
        color: item.color
    }));

    const transformData = (inputArray: InputObject[]): { nodes: Node[], links: Link[] } => {
        const nodesMap = new Map<string, Node>();
        const links: Link[] = [];
    
        inputArray.forEach(item => {
            // Add source node if not already present
            if (!nodesMap.has(item.source)) {
                nodesMap.set(item.source, {
                    id: item.source,
                    nodeColor: 'hsl(250, 70%, 50%)'  // You can customize the color if needed
                });
            }
    
            // Add destination node if not already present
            if (!nodesMap.has(item.destination)) {
                nodesMap.set(item.destination, {
                    id: item.destination,
                    nodeColor: 'hsl(250, 70%, 50%)'  // You can customize the color if needed
                });
            }
    
            // Add the link
            links.push({
                source: item.source,
                target: item.destination,
                value: item.tonnage
            });
        });
    
        // Convert nodesMap to an array
        const nodes: Node[] = Array.from(nodesMap.values());
    
        return { nodes, links };
    }

    const graphData = transformData(rawData)

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumb title="Ore Tracker" breadcrumbItem="Material Movement" />
                    <Row className="mb-3">
                        <Col className='d-flex flex-row-reverse'>
                            <Space>
                                {
                                    timeRange == 'CUSTOM' && <RangePicker />
                                }
                                <Segmented className="customSegmentLabel customSegmentBackground" value={timeRange} onChange={(e) => setTimeRange(e)} options={[{ value: 'CUSTOM', label: 'Custom' }, { value: 'PREVIOUS_SHIFT', label: 'Previous Shift' }, { value: 'CURRENT_SHIFT', label: 'Current Shift' }]}/>
                            </Space>
                        </Col>
                    </Row>
                    <Row className="d-flex justify-content-center align-items-center">
                        <Col className="align-content-center m-auto" style={{ height: 800 }}>
                            <ResponsiveSankey
                                data={graphData}
                                margin={{ top: 40, right: 160, bottom: 40, left: 40 }}
                                align="center"
                                colors={{ scheme: 'spectral' }}
                                nodeOpacity={1}
                                nodeHoverOthersOpacity={0.4}
                                nodeThickness={20}
                                nodeSpacing={24}
                                nodeBorderWidth={0}
                                nodeBorderRadius={3}
                                linkOpacity={1}
                                linkHoverOthersOpacity={0.4}
                                linkContract={3}
                                enableLinkGradient={false}
                                labelPosition="inside"
                                labelOrientation="horizontal"
                                labelPadding={8}
                                legends={[
                                    {
                                        anchor: 'top-right',
                                        direction: 'column',
                                        translateX: 130,
                                        itemWidth: 100,
                                        itemHeight: 14,
                                        itemDirection: 'right-to-left',
                                        itemsSpacing: 2,
                                        itemTextColor: '#999',
                                        symbolSize: 14,
                                        effects: [
                                            {
                                                on: 'hover',
                                                style: {
                                                    itemTextColor: '#000'
                                                }
                                            }
                                        ]
                                    }
                                ]}
                            />
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    )
}
export default MaterialMovement;