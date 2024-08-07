import React from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import hd785 from "../../assets/images/HD785.png";
import hd1500 from "../../assets/images/HD1500.png";
import pc2000 from "../../assets/images/PC2000.png";
import pc1250 from "../../assets/images/PC1250.png";
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

    const getImage = (category: string) => {
        switch (category) {
            case "HD785":
                return hd785;
            case "HD1500":
                return hd1500;
            case "PC1250":
                return pc1250;
            case "PC2000":
                return pc2000;
            default:
                return hd785;
        }
    }

    const imageStyle: React.CSSProperties = {
        height: '7.5rem',
    };

    const getStateValue = (stateInfo, key: string) => {
        let info = stateInfo.find((info) => info.state === key);
        return info ? info.hours : '-'
    }

    return (
        <React.Fragment>
            <Row>
                {data.map((item: any, key: number) => (
                    <Col lg={2} md={6} xs={12} key={key}>
                        <Card>
                            <CardBody>
                                <div className="d-flex align-start mb-3">
                                    <div className="flex-grow-1 card-body__header">
                                        <h4>
                                            {item.name}
                                        </h4>
                                        <h6>
                                            {item?.data?.operator || '-'}
                                        </h6>
                                    </div>
                                </div>
                                <div className="text-center mb-3">
                                    <img src={getImage(item.model)} alt="" style={imageStyle} />
                                </div>
                                <div className="d-flex mb-3 justify-content-center gap-2 text-muted text-center">
                                    <div className='d-flex flex-column'>
                                        <p>{item?.data?.tripCount || 0}</p>
                                        <p style={{ fontSize: '10px' }}>Total loads</p>
                                    </div>
                                    <div className='d-flex flex-column'>
                                        <p>{item?.data?.payload || 0}</p>
                                        <p style={{ fontSize: '10px' }}>Total tonnes moved</p>
                                    </div>
                                    <div className='d-flex flex-column'>
                                        <p>{round(item?.data?.tripCount ? item.data.payload / item.data.tripCount : 0, 2)}</p>
                                        <p style={{ fontSize: '10px' }}>Avg. load</p>
                                    </div>
                                </div>
                                <div className="d-flex mb-3 justify-content-around gap-2 text-muted">
                                    {stateConfig.map((config) => {
                                        return (
                                            <div className='d-flex align-items-center'>
                                                <i className='bx bxs-circle' style={{ color: config.color }}></i>
                                                <p style={{ margin: '0 0 0 2px' }}>{item?.data?.stateInfo ? getStateValue(item?.data?.stateInfo, config.key) : '-'}</p>
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