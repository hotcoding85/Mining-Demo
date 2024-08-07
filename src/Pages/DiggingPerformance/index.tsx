import React, { useState } from 'react';
import { Container, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import TruckingExecutionCard from './TruckingExecutionCard';

import PC2000 from 'assets/images/PC2000.png'
import PC1250 from 'assets/images/PC1250.png'
import HD1500 from 'assets/images/HD1500.png'
import HD785 from 'assets/images/HD785.png'

const DiggingPerformance = () => {
  document.title = "Digging Performance";
  const [series, useSeries] = useState([67, 60, 90]); // Replace with actual data
  const [operationalDelay, useOperationalDelay] = useState([40, 50, 60]); // Replace with actual data
  const [availability, useAvailability] = useState([70, 80, 90]); // Replace with actual data
  const [progresses, useProgresses] = useState([{min: 9, max: 18},{min: 9, max: 18},{min: 9, max: 18}]); // Replace with actual data
  
  const tbSeries = [[
    {
        name: "WASTE",
        data: [113.0,113.0,113.0,113.0,113.0,113.0,113.0,113.0,113.0,113.0,113.0,113.0],
    },
    {
        name: "ROM ORE",
        data: [12.3,12.3,12.3,12.3,12.3,12.3,12.3,12.3,12.3,12.3,12.3,12.3,],
    }
  ],[
    {
        name: "WASTE",
        data: [113.0,113.0,113.0,113.0,113.0,113.0,113.0,113.0,113.0,113.0,113.0,113.0],
    },
    {
        name: "ROM ORE",
        data: [12.3,12.3,12.3,12.3,12.3,12.3,12.3,12.3,12.3,12.3,12.3,12.3,],
    }
  ],[
    {
        name: "WASTE",
        data: [113.0,113.0,113.0,113.0,113.0,113.0,113.0,113.0,113.0,113.0,113.0,113.0],
    },
    {
        name: "ROM ORE",
        data: [12.3,12.3,12.3,12.3,12.3,12.3,12.3,12.3,12.3,12.3,12.3,12.3,],
    }
  ]];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Dashboards" breadcrumbItem="Daily Production" />
          {/* <Row>
            <TruckingExecutionCard 
              imgSrc={HD1500} 
              altText="HD1500" 
              title="Digger EX01"
              cardTitle="Trucking 24 Hr. Planned Execution" 
              progressValue={progresses[0].min} 
              progressMax={progresses[0].max} 
              series={[series[0]]}
              operationalDelay={[operationalDelay[0]]}
              availability={[availability[0]]}
              tbSeries={tbSeries[0]}
              forecast={600}
              forecastColor={'green'}
            />
          </Row>
          <Row style={{border: '2px solid white', borderRadius: '5px', marginTop: '10px'}}>
            <TruckingExecutionCard 
              imgSrc={HD1500} 
              altText="HD1500" 
              title="Digger EX02"
              cardTitle="Trucking 24 Hr. Planned Execution" 
              progressValue={progresses[1].min} 
              progressMax={progresses[1].max} 
              series={[series[1]]}
              operationalDelay={[operationalDelay[1]]}
              availability={[availability[1]]}
              tbSeries={tbSeries[1]}
              forecast={600}
              forecastColor={'green'}
            />
          </Row>
          <Row style={{border: '2px solid white', borderRadius: '5px', marginTop: '10px'}}>
            <TruckingExecutionCard 
              imgSrc={HD1500} 
              altText="HD1500" 
              title="Digger EX03"
              cardTitle="Trucking 24 Hr. Planned Execution" 
              progressValue={progresses[2].min} 
              progressMax={progresses[2].max} 
              series={[series[2]]}
              operationalDelay={[operationalDelay[2]]}
              availability={[availability[2]]}
              tbSeries={tbSeries[2]}
              forecast={600}
              forecastColor={'green'}
            />
          </Row> */}
        </Container>
      </div>
    </React.Fragment>
  );
}

export default DiggingPerformance;
