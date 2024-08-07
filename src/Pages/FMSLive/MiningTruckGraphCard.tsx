import React from 'react';
import { CardBody, CardTitle, Row, Col } from 'reactstrap';
import BarGraph from "./BarGraph";

// Renaming CustomCardBody to MiningTruckGraphCard based on its usage
const MiningTruckGraphCard = ({ imgSrc, altText, cardTitle, options, series }) => {
  
  return (
    <CardBody>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column'}}>
          <Row>
            <Col>
              <img src={imgSrc} alt={altText} style={{ width: '300px', height: 'auto' }} />
            </Col>
            <Col>
              <div>
                <CardTitle>{cardTitle}</CardTitle>
                <BarGraph options={options} series={series}/>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </CardBody>
  );
}

export default MiningTruckGraphCard;
