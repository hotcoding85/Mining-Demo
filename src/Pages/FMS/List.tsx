import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Col, Row } from 'reactstrap';
import hd785 from "../../assets/images/HD785.png";
import hd1500 from "../../assets/images/HD1500.png";
import pc2000 from "../../assets/images/PC2000.png";
import pc1250 from "../../assets/images/PC1250.png";


const List = ({ candidateDate = [] }: any) => {
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

    return (
        <React.Fragment>
            <Row>
                {candidateDate.map((item: any, key: number) => (
                    <Col lg={2} md={6} xs={12} key={key}>
                        <Card>
                            <CardBody>
                                <div className="d-flex align-start mb-3">
                                    <div className="flex-grow-1 card-body__header">
                                        <h4>
                                            {item.category}
                                        </h4>
                                        <h6>
                                            Operator
                                        </h6>
                                    </div>
                                </div>
                                <div className="text-center mb-3">
                                    <img src={getImage(item.model)} alt="" style={imageStyle} />
                                </div>
                                <div className="d-flex mb-3 justify-content-center gap-2 text-muted">
                                    <div>
                                        <i className='bx bx-map align-middle text-primary'></i> {item.location}
                                    </div>
                                    <p className="mb-0 text-center"><i className='bx bx-money align-middle text-primary'></i> ${item.experience} / hrs</p>
                                </div>
                                <div className="d-flex mb-3 justify-content-center gap-2 text-muted">
                                    <div>
                                        <i className='bx bx-map align-middle text-primary'></i> {item.location}
                                    </div>
                                    <p className="mb-0 text-center"><i className='bx bx-money align-middle text-primary'></i> ${item.experience} / hrs</p>
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