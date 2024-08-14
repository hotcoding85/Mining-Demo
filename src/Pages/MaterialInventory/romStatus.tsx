import React from "react";
import { Card, CardBody, CardTitle, Table } from "reactstrap";

const RomStatus = (props: any) => {

    const data = [
        {
            name: "HG01",
            grade: "1.9%",
            fromPit: 862.1,
            toCrusher: 211.5,
            stock: 23876.3
        },
        {
            name: "HG02",
            grade: "1.9%",
            fromPit: 0,
            toCrusher: 211.5,
            stock: 23876.3
        },
        {
            name: "HG03",
            grade: "1.9%",
            fromPit: 862.1,
            toCrusher: 211.5,
            stock: 23876.3
        },
        {
            name: "MG01",
            grade: "1.9%",
            fromPit: 862.1,
            toCrusher: 211.5,
            stock: 23876.3
        },
        {
            name: "MG02",
            grade: "1.9%",
            fromPit: 862.1,
            toCrusher: 0,
            stock: 23876.3
        },
        {
            name: "LG01",
            grade: "1.9%",
            fromPit: 862.1,
            toCrusher: 211.5,
            stock: 23876.3
        },
        {
            name: "LG02",
            grade: "1.9%",
            fromPit: 862.1,
            toCrusher: 211.5,
            stock: 23876.3
        },
        {
            name: "Waste",
            grade: "0%",
            fromPit: 862.1,
            toCrusher: 211.5,
            stock: 23876.3
        },
        {
            name: "Waste",
            grade: "0%",
            fromPit: 862.1,
            toCrusher: 211.5,
            stock: 23876.3
        }
    ]

    return (
        <React.Fragment>
            <Card>
                <CardBody>
                    <CardTitle className="h4">ROM Status</CardTitle>
                    <div className="table-responsive">
                        <Table className="table mb-0 table-bordered">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th style={{ textAlign: 'right' }}>Grade</th>
                                    <th style={{ textAlign: 'right' }}>From Pit</th>
                                    <th style={{ textAlign: 'right' }}>Into Crusher</th>
                                    <th style={{ textAlign: 'right' }}>Current Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data.map(map => {
                                        return (
                                            <tr>
                                                <th scope="row">{map.name}</th>
                                                <td style={{ textAlign: 'right' }}>{map.grade}</td>
                                                {
                                                    map.fromPit > 0 ?
                                                    <td style={{ textAlign: 'right', color: '#0f0' }}>+{map.fromPit}</td>
                                                    :
                                                    <td style={{ textAlign: 'right', color: '#fff' }}>{map.fromPit}</td>    
                                                }
                                                {
                                                    map.toCrusher > 0 ?
                                                    <td style={{ textAlign: 'right', color: '#f00' }}>-{map.toCrusher}</td>
                                                    :
                                                    <td style={{ textAlign: 'right', color: '#fff' }}>{map.toCrusher}</td>
                                                }
                                                
                                                <td style={{ textAlign: 'right' }}>{map.stock}</td>
                                            </tr>
                                        )
                                    })
                                }
                            </tbody>
                        </Table>
                    </div>
                </CardBody>
            </Card>
        </React.Fragment>
    )
}

export default RomStatus;