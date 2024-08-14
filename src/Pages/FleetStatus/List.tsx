import React from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import { pc2000, pc1250, hd1500, hd785, wa600 } from 'assets/images/equipment';
import { round } from 'lodash';
import './index.scss';
import { Badge } from 'antd';

const stateConfig = [
    {
        name: 'Active',
        key: 'ACTIVE',
        color: "#009D10"
    },
    {
        name: 'Standby',
        key: 'STANDBY',
        color: "#F7B31A"
    },
    {
        name: 'Delay',
        key: 'DELAY',
        color: "#9143DE"
    },
    {
        name: 'Down',
        key: 'DOWN',
        color: "#ED3A0F"
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

        if (containsCaseInsensitive(category, "hd785")) {
            return hd785;
        } else if (containsCaseInsensitive(category, "hd1500")) {
            return hd1500;
        } else if (containsCaseInsensitive(category, "pc1250")) {
            return pc1250;
        } else if (containsCaseInsensitive(category, "pc2000")) {
            return pc2000;
        } else if (containsCaseInsensitive(category, "wa600")) {
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

    return (
        <React.Fragment>
            <Row className="row d-flex">
                {data.map((item: any, key: number) => (
                    <Col className="col-lg-2 col-md-6" key={key}>
                        <Badge.Ribbon text="DOWN" color='#ED3A0F'>
                            <Card>
                                <CardBody>
                                    <div className="d-flex align-start mb-3">
                                        <div className="flex-grow-1 card-body__header">
                                            <h4>
                                                {item.name}
                                            </h4>
                                            <h6>
                                                {item?.data?.operator || 'No Operator'}
                                            </h6>
                                        </div>
                                    </div>
                                    <div className="text-center mb-3">
                                        <img src={getImage(item.model)} alt="" style={imageStyle} />
                                    </div>
                                    <div className="container">
                                        <div className="row">
                                            <div className="col-sm-6 d-flex justify-content-center">
                                                <span className='itemActual'>{item?.data?.tripCount || 0}</span>
                                                <span className='itemPlanned'>/{item.category == 'EXCAVATOR' ? 175 : 35}</span>
                                            </div>
                                            <div className="col-sm-6 d-flex justify-content-center">
                                                <span className='itemActual'>{round(item?.data?.payload || 0.0, 2)}</span>
                                                <span className='itemPlanned'>/{item.category == 'EXCAVATOR' ? '15,000' : 35 * item.capacity}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="container">
                                        <div className="row">
                                            <div className="col-sm-6 d-flex justify-content-center">
                                                <span style={{ fontSize: '8px', }} className='ml-4'>Total Loads</span>
                                            </div>
                                            <div className="col-sm-6 d-flex justify-content-center" style={{ paddingLeft: 0 }}>
                                                <span style={{ fontSize: '8px' }}>Total Tonnes Moved</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between mt-2 gap-2 text-muted">
                                        {stateConfig.map((config) => {
                                            return (
                                                <div className='d-flex align-items-center'>
                                                    {/* <i className='bx bxs-circle font-size-12' style={{ color: config.color }}></i> */}
                                                    <span style={{ margin: '0 0 0 1px', fontSize: '12px', color: config.color }}>{item?.data?.stateInfo ? getStateValue(item?.data?.stateInfo, config.key) : '00:00'}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardBody>
                            </Card>
                        </Badge.Ribbon>
                    </Col>
                ))}
            </Row>
        </React.Fragment>
    );
}

export default List;