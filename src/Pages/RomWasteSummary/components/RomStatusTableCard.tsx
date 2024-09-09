import _ from "lodash";
import { Col, Row } from "reactstrap"

export const RomStatusTableCard = () => {
    const dataSource = [
        {
            key: '1',
            location: 'HG01',
            grade: 1.9,
            ore_from_pit: 0,
            stock_to_crusher: -321.68,
            stock: 23876.8
        },
        {
            key: '2',
            location: 'HG02',
            grade: 1.8,
            ore_from_pit: 562.01,
            stock_to_crusher: -121.68,
            stock: 13876.8
        },
        {
            key: '3',
            location: 'HG03',
            grade: 1.7,
            ore_from_pit: 0,
            stock_to_crusher: -542.25,
            stock: 0
        },
        {
            key: '4',
            location: 'LG01',
            grade: 1.6,
            ore_from_pit: 652.12,
            stock_to_crusher: -142.78,
            stock: 12852.6
        },
        {
            key: '5',
            location: 'LG02',
            grade: 0.8,
            ore_from_pit: 932.24,
            stock_to_crusher: 0,
            stock: 9845.2
        },
        {
            key: '6',
            location: 'LG03',
            grade: 0.5,
            ore_from_pit: 458.67,
            stock_to_crusher: 0,
            stock: 7452.7
        },
        {
            key: '7',
            location: 'LG04',
            grade: 0.3,
            ore_from_pit: 300.54,
            stock_to_crusher: -192.34,
            stock: 0
        },
    ];
      
    const columns = [
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: 'Grade',
            dataIndex: 'grade',
            key: 'grade',
        },
        {
            title: 'Extracted ORE from pit to ROM',
            dataIndex: 'ore_from_pit',
            key: 'ore_from_pit',
        },
        {
            title: 'From Stock Pile into Crusher',
            dataIndex: 'stock_to_crusher',
            key: 'stock_to_crusher',
        },
        {
            title: 'Current Stock',
            dataIndex: 'stock',
            key: 'stock',
        },
    ];
    return (
        <>
            <Row>
                <Col md={12}>
                    <table className="table no-border" style={{}}>
                        <thead>
                            <tr>
                                {_.map(columns, (col, index) => 
                                    <th key={index}>{col.title}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {_.map(dataSource, (col) => 
                                    <tr key={col.key}>
                                        <td style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                            <div style={{width: '20px', height: '15px', background:'gold', marginRight: '10px'}}></div>
                                            {col.location}
                                        </td>
                                        <td>
                                            {col.grade.toLocaleString()}
                                        </td>
                                        <td style={{color: col.ore_from_pit >= 0 ? (col.ore_from_pit != 0 ? 'green' : '#a6b0cf') : 'red'}}>
                                            {col.ore_from_pit.toLocaleString()}
                                        </td>
                                        <td style={{color: col.stock_to_crusher >= 0 ? (col.stock_to_crusher != 0 ? 'green' : '#a6b0cf') : 'red'}}>
                                            {col.stock_to_crusher.toLocaleString()}
                                        </td>
                                        <td>
                                            {col.stock.toLocaleString()}
                                        </td>
                                    </tr>
                            )}
                        </tbody>
                    </table>
                </Col>
            </Row>
        </>
    )
} 