import React from 'react';
import { Card, CardBody, CardTitle, Badge } from 'reactstrap';

const PerformanceIndicator = ({ title, moved, target }) => {
    const isTargetMet = parseInt(moved.replace(/,/g, '').replace('T', '')) >= target;
    const headerColor = isTargetMet ? 'green' : 'red';
    const triangleDirection = isTargetMet ? '▲' : '▼';
  
    return (
        <Card>
            <CardBody style={{ backgroundColor: 'gray', padding: '0' }}>
            <div style={{ backgroundColor: headerColor, color: 'white', padding: '10px 10px 0 10px' }}>
                <h2 style={{ fontSize: '1em', margin: '0' }}>{title}</h2>
            </div>
            <div style={{ padding: '10px' }}>
                <h3 style={{ fontSize: '2em', margin: '0', color: 'black' }}>{moved} MOVED <span style={{ fontSize: '1.5em', color: headerColor }}>{triangleDirection}</span></h3>
                {target && !isTargetMet && <h4 style={{ margin: '0', color: 'black' }}>Target {target}T</h4>}
            </div>
            </CardBody>
        </Card>
  );
};

export default PerformanceIndicator;