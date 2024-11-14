import { LAYOUT_MODE_TYPES } from 'Components/constants/layout';
import React from 'react';
import { useSelector } from 'react-redux';
import { Card, CardBody, CardTitle, CardText, Row, Col, Badge } from 'reactstrap';
import { LayoutSelector } from 'selectors';

type TruckData = {
    index: string;
    id: string;
    model: string;
    excavator: string;
    times: string[];
    weights: string[];
    avgLoadingTime: string;
    totalTonnes: string;
    colors: string[];
};

type ExcavatorProps = {
  excavatorId: string;
  syncStatus: string;
  avgHangTime: string;
  trucks: TruckData[];
  syncTimeColor: string;
  avgHangTimeColor: string;
  selectedTrip: any;
  setSelectedTrip: (index: string) => void;
};

const ExcavatorItem: React.FC<ExcavatorProps> = ({
  excavatorId,
  syncStatus,
  avgHangTime,
  trucks,
  syncTimeColor,
  avgHangTimeColor,
  selectedTrip,
  setSelectedTrip
}) => {
    const { layoutModeType } = useSelector(LayoutSelector);
    const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;

    const statusColors = ["#4CAF50", "#FF5252", "#FFC107", "#4CAF50", "#4CAF50"];
    
    return (
        <Card className="excavator-summary-card" style={{ minHeight: '500px', borderRadius: '15px' }}>
        <CardBody style={{borderRadius: '15px'}}>
            <Row>
            {/* <Col xs="8">
                <CardTitle tag="h3" style={{fontSize: '22px'}}>{excavatorId}</CardTitle>
                <CardText>
                <Badge color="success" style={{ backgroundColor: '#4CAF50' }}>{syncStatus}</Badge>
                </CardText>
            </Col> */}
            <Col xs="12" className="text-center" style={{display: 'flex', justifyContent: 'center'}}>
                <CardText style={{fontSize: '16px'}}>Avg Hang Time</CardText>
                <CardTitle tag="h4" style={{ color: avgHangTimeColor, fontSize: '25px', marginLeft: '1rem' }}>{avgHangTime}</CardTitle>
            </Col>
            </Row>
            {trucks.map((truck) => (
            <div key={truck.id} className="mb-2 mt-2 excavator-truck" style={{ backgroundColor: !isLight ? selectedTrip === truck.index ? '#374667' : '#37466750' : selectedTrip === truck.index ? '#00000030' : '#00000014', margin: '5px -5px', padding: '5px 15px', borderRadius: '10px', cursor: 'pointer'}} onClick={() => setSelectedTrip(truck.index)}>
                <CardBody style={{padding: 0}}>
                <Row>
                    <Col xs="8">
                    <strong style={{fontSize: '16px'}}>{truck.id} ({truck.model})</strong>
                    </Col>
                    <Col xs="4" className="text-end">
                    <Badge pill color="secondary">TRIP</Badge>
                    <Badge pill color="secondary" style={{ marginLeft: '5px' }}>WASTE</Badge>
                    </Col>
                </Row>
                <Row className='d-flex' style={{justifyContent: 'space-around', flexDirection: 'row', marginLeft: (50 / truck.weights.length / 2 + '%'), marginRight: (50 / truck.weights.length / 2 * 2 + '%'), marginTop: '.5rem'}}>
                    {truck.times.map((time, index) => (
                    <Col key={index} className="text-center">
                        {<Badge color="secondary">{time}</Badge>}
                    </Col>
                    ))}
                </Row>
                <Row className='d-flex' style={{justifyContent: 'space-around', flexDirection: 'row'}}>
                    {truck.weights.map((weight, index) => (
                        <div className='d-flex' style={{flexDirection: 'column', width: '60px', alignItems: 'center'}}>
                            <Badge
                                color="default"
                                style={{
                                width: '20px',
                                height: '20px',
                                backgroundColor: truck.colors[index],
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFF',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                zIndex: '1'
                                }}
                            >
                                {index + 1}
                            </Badge>
                            <Col key={index} className="text-center">
                                <p style={{ margin: 0, color: truck.colors[index] }}>{weight}</p>
                            </Col>
                        </div>
                    ))}
                </Row>
                <Row style={{position: 'relative', marginLeft: `${14 - truck.times.length}%`, marginRight: `${14 - truck.times.length}%`}}>
                    <Col md={12} style={{height: 0, borderTop: '2px dashed', background: 'transparent', position: 'absolute', top:' -30px', zIndex: '0'}}></Col>
                </Row>
                <Row style={{marginTop: '.5rem'}}>
                    <Col xs="6">Avg Loading Time</Col>
                    <Col xs="6" className="text-end" style={{color: !isLight ? 'white' : ''}}>{truck.avgLoadingTime}</Col>
                </Row>
                <Row>
                    <Col xs="6">Total Tonnes</Col>
                    <Col xs="6" className="text-end" style={{color: !isLight ? 'white' : ''}}>{truck.totalTonnes}</Col>
                </Row>
                </CardBody>
            </div>
            ))}
        </CardBody>
        </Card>
    );
};

export default ExcavatorItem;
