import React from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import hd785 from "../../assets/images/HD785.png";
import hd1500 from "../../assets/images/HD1500.png";
import pc2000 from "../../assets/images/PC2000.png";
import pc1250 from "../../assets/images/PC1250.png";
import wa600 from "../../assets/images/WA600.png";
import { round } from 'lodash';

const stateConfig = [
    {
        name: 'Active',
        key: 'ACTIVE',
        color: "green"
    },
    {
        name: 'Standby',
        key: 'STANDBY',
        color: "yellow"
    },
    {
        name: 'Delay',
        key: 'DELAY',
        color: "purple"
    },
    {
        name: 'Down',
        key: 'DOWN',
        color: "red"
    }
]

const List = ({ data = [] }: any) => {

    console.log(data);
    const activeBtn = (ele: any) => {
        if (ele.closest("button").classList.contains("active")) {
            ele.closest("button").classList.remove("active");
        } else {
            ele.closest("button").classList.add("active");
        }
    }

    function containsCaseInsensitive(str: string, substr: string): boolean {
        return str.toLowerCase().includes(substr.toLowerCase());
    }

    const getImage = (category: string) => {
        
        if(containsCaseInsensitive(category, "hd785")) {
            return hd785;
        } else if(containsCaseInsensitive(category, "hd1500")) {
            return hd1500;
        } else if(containsCaseInsensitive(category, "pc1250")) {
            return pc1250;
        }else if(containsCaseInsensitive(category, "pc2000")) {
            return pc2000;
        } else if(containsCaseInsensitive(category, "wa600")) {
            return wa600;
        } 
    }

    const imageStyle: React.CSSProperties = {
        height: '7.5rem',
    };

    const getStateValue = (stateInfo, key: string) => {
        let info = stateInfo.find((info) => info.state === key);
        return info ? info.hours : '00:00'
    }

    const statusColor = "gray"
    return (
        <React.Fragment>
            <Row>
                {data.map((item: any, key: number) => (
                    <Col xl={2} lg={3} md={4} sm={6} key={key}>
                        <Card style={{border: statusColor+' 1px solid'}}>
                            <CardBody>
                                <div className="d-flex align-start mb-3">
                                    <div className="flex-grow-1 card-body__header">
                                        <h4 style={{color: statusColor}}>
                                            {item.name}
                                        </h4>
                                        <h6 style={{color: statusColor}}>
                                            {item?.data?.operator || 'Unassiged'}
                                        </h6>
                                    </div>
                                </div>
                                <div className="text-center mb-3">
                                    <img src={getImage(item.model)} alt="" style={imageStyle} />
                                </div>
                                <div className="d-flex justify-content-center mb-2 gap-2 text-muted text-center">
                                    <div className='d-flex flex-column'>
                                        <span style={{ fontSize: '18px', color:'white' }}>{item?.data?.tripCount || 0}</span>
                                        <span style={{ fontSize: '9px' }}>Total Loads</span>
                                    </div>
                                    <div className='d-flex flex-column'>
                                        <span style={{ fontSize: '18px', color:'white' }}>{round(item?.data?.payload || 0.0, 2)}</span>
                                        <span style={{ fontSize: '9px' }}>Total Tonnes Moved</span>
                                    </div>
                                    <div className='d-flex flex-column'>
                                        <span style={{ fontSize: '18px', color:'white' }}>{round(item?.data?.tripCount ? item.data.payload / item.data.tripCount : 0.0, 2)}</span>
                                        <span style={{ fontSize: '9px' }}>Avg. Load</span>
                                    </div>
                                </div>
                                <div className="d-flex mb-3 justify-content-around gap-2 text-muted">
                                    {stateConfig.map((config) => {
                                        return (
                                            <div className='d-flex align-items-center'>
                                                <i className='bx bxs-circle font-size-12' style={{ color: config.color }}></i>
                                                <p style={{ margin: '0 0 0 1px', fontSize: '12px' }}>{item?.data?.stateInfo ? getStateValue(item?.data?.stateInfo, config.key) : '00:00'}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>
        </React.Fragment>
    );
}

export default List;