import React from "react";
import { Card, CardBody, CardTitle, Table } from "reactstrap";

const PitStatus = (props: any) => {

    const data = [
        {
            name: "440_HG01",
            planMaterial: "HG01",
            planOre: 6772883.9,
            planWaste: 211.5,
            actualMaterial: "HG01",
            actualOre: 6000678.4,
            actualWaste: 23876.3
        }
    ]

    return (
        <React.Fragment>
            <Card>
                <CardBody>
                    <CardTitle className="h4">Pit Status</CardTitle>
                    <div className="table-responsive">
                        <Table className="table mb-0 table-bordered">
                            <thead>
                                <tr>
                                    <th style={{ verticalAlign:'middle' }} rowSpan={2} >#</th>
                                    <th style={{ textAlign: 'center' }} colSpan={2}>Material</th>
                                    <th style={{ textAlign: 'center' }} colSpan={2}>Ore</th>
                                    <th style={{ textAlign: 'center' }} colSpan={2}>Waste</th>
                                </tr>
                                <tr>
                                    <th style={{ textAlign: 'right' }}>Target</th>
                                    <th style={{ textAlign: 'right' }}>Actual</th>
                                    <th style={{ textAlign: 'right' }}>Target</th>
                                    <th style={{ textAlign: 'right' }}>Actual</th>
                                    <th style={{ textAlign: 'right' }}>Target</th>
                                    <th style={{ textAlign: 'right' }}>Actual</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    data.map(item => {
                                        return (
                                            <tr>
                                                <th scope="row">{item.name}</th>
                                                <td>{item.planMaterial}</td>
                                                <td>{item.actualMaterial}</td>
                                                <td style={{ textAlign: 'right' }}>{item.planOre}</td>
                                                <td style={{ textAlign: 'right' }}>{item.actualOre}</td>
                                                <td style={{ textAlign: 'right' }}>{item.planWaste}</td>
                                                <td style={{ textAlign: 'right' }}>{item.actualWaste}</td>
                                                {/* {
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
                                                
                                                <td style={{ textAlign: 'right' }}>{map.stock}</td> */}
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

export default PitStatus;