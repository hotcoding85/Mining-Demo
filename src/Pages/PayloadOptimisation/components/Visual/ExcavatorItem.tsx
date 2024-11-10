import { LAYOUT_MODE_TYPES } from 'Components/constants/layout';
import React from 'react';
import { useSelector } from 'react-redux';
import { Card, CardBody, CardTitle, CardText, Row, Col, Badge } from 'reactstrap';
import { LayoutSelector } from 'selectors';

type TruckData = {
  id: string;
  model: string;
  times: string[];
  weights: string[];
  avgLoadingTime: string;
  totalTonnes: string;
};

type ExcavatorProps = {
  excavatorId: string;
  syncStatus: string;
  avgHangTime: string;
  trucks: TruckData[];
  syncTimeColor: string;
  avgHangTimeColor: string;
};

const ExcavatorItem: React.FC<ExcavatorProps> = ({
  excavatorId,
  syncStatus,
  avgHangTime,
  trucks,
  syncTimeColor,
  avgHangTimeColor,
}) => {
    const { layoutModeType } = useSelector(LayoutSelector);
    const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;

    const statusColors = ["#4CAF50", "#FF5252", "#FFC107", "#FF5252", "#FF5252"];
    
    return (
        <Card className="excavator-summary-card" style={{ minHeight: '500px', borderRadius: '15px' }}>
        <CardBody style={{borderRadius: '15px'}}>
            <Row>
            <Col xs="8">
                <CardTitle tag="h3" style={{fontSize: '22px'}}>{excavatorId}</CardTitle>
                <CardText>
                <Badge color="success" style={{ backgroundColor: '#4CAF50' }}>{syncStatus}</Badge>
                </CardText>
            </Col>
            <Col xs="4" className="text-end">
                <CardTitle tag="h5" style={{ color: avgHangTimeColor, fontSize: '20px' }}>{avgHangTime}</CardTitle>
                <CardText>Avg Hang Time</CardText>
            </Col>
            </Row>
            {trucks.map((truck) => (
            <div key={truck.id} className="mb-2 mt-2 excavator-truck" style={{ backgroundColor: !isLight ? '#374667' : '#00000014', margin: '5px -5px', padding: '5px 15px', borderRadius: '10px'}}>
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
                    <Col key={index} xs="2" className="text-center">
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
                                backgroundColor: statusColors[index % 5],
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
                                <p style={{ margin: 0, color: statusColors[index % 5] }}>{weight}</p>
                            </Col>
                        </div>
                    ))}
                </Row>
                <Row style={{position: 'relative'}}>
                    <Col md={12} style={{height: 0, borderTop: '2px dashed', background: 'transparent', position: 'absolute', top:' -30px', zIndex: '0'}}></Col>
                </Row>
                <Row style={{marginTop: '.5rem'}}>
                    <Col xs="6">Avg Loading Time</Col>
                    <Col xs="6" className="text-end">{truck.avgLoadingTime}</Col>
                </Row>
                <Row>
                    <Col xs="6">Total Tonnes</Col>
                    <Col xs="6" className="text-end">{truck.totalTonnes}</Col>
                </Row>
                </CardBody>
            </div>
            ))}
        </CardBody>
        </Card>
    );
};

export default ExcavatorItem;
