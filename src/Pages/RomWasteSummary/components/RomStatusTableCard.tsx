import _ from "lodash";
import { Col, Row } from "reactstrap"
import {
    FLEET_TIME_STATE_COLOR,
    LAYOUT_MODE_TYPES,
  } from "Components/constants/layout";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
export const RomStatusTableCard = () => {
    const dataSource = [
        {
            key: '1',
            location: 'HG01',
            grade: 1.9,
            ore_from_pit: 0,
            stock_to_crusher: -321.68,
            stock: 23876.8,
            bgColor: '#FFB84C'
        },
        {
            key: '2',
            location: 'HG02',
            grade: 1.8,
            ore_from_pit: 562.01,
            stock_to_crusher: -121.68,
            stock: 13876.8,
            bgColor: '#FFB84C'
        },
        {
            key: '3',
            location: 'HG03',
            grade: 1.7,
            ore_from_pit: 0,
            stock_to_crusher: -542.25,
            stock: 0,
            bgColor: '#FFB84C'
        },
        {
            key: '4',
            location: 'LG01',
            grade: 1.6,
            ore_from_pit: 652.12,
            stock_to_crusher: -142.78,
            stock: 12852.6,
            bgColor: '#C58E42'
        },
        {
            key: '5',
            location: 'LG02',
            grade: 0.8,
            ore_from_pit: 932.24,
            stock_to_crusher: 0,
            stock: 9845.2,
            bgColor: '#C58E42'
        },
        {
            key: '6',
            location: 'LG03',
            grade: 0.5,
            ore_from_pit: 458.67,
            stock_to_crusher: 0,
            stock: 7452.7,
            bgColor: '#8F5D28'
        },
        {
            key: '7',
            location: 'LG04',
            grade: 0.3,
            ore_from_pit: 300.54,
            stock_to_crusher: -192.34,
            stock: 0,
            bgColor: '#5D3C17'
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
    const { layoutModeType } = useSelector(
        createSelector(
          (state: any) => state.Layout,
          (layout) => ({
            layoutModeType: layout.layoutModeTypes,
          })
        )
    );
    const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;

    return (
        <>
            <Row>
                <Col md={12}>
                    <table className={isLight ? 'table no-border light-mode' : 'table no-border dark-mode'} style={{}}>
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
                                            <div style={{width: '20px', height: '15px', background:col.bgColor, marginRight: '10px'}}></div>
                                            <span className='text-color-normal'>{col.location}</span>
                                        </td>
                                        <td>
                                            <span className='text-color-normal'>{col.grade.toLocaleString()}</span>
                                        </td>
                                        <td>
                                            <span className={col.ore_from_pit >= 0 ? (col.ore_from_pit != 0 ? 'text-color-green' : 'text-color-normal') : 'text-color-red'}>{col.ore_from_pit}</span>
                                        </td>
                                        <td>
                                            <span className={col.stock_to_crusher >= 0 ? (col.stock_to_crusher != 0 ? 'text-color-green' : 'text-color-normal') : 'text-color-red'}>{col.stock_to_crusher.toLocaleString()}</span>
                                        </td>
                                        <td style={{textAlign: 'right'}}>
                                            <span className="text-color-normal">{col.stock.toLocaleString()}</span>
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