import React from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import { pc2000, pc1250, hd1500, hd785, wa600, placeHolder } from 'assets/images/equipment';
import { round } from 'lodash';
import './index.scss';
import { Badge } from 'antd';
import { round2Two, roundOff } from 'utils/common';
import Item from './Item';

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


const FleetList = ({ data = [] }: any) => {

    const getStateColor = (state) => {
        switch (state) {
            case "ACTIVE":
                return "#009D10";
            case "STANDBY":
                return "#F7B31A";
            case "DELAY":
                return "#9143DE";
            case "DOWN":
                return "#ED3A0F";
            default:
                return "#F7B31A";
        }
    }

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
        if (!category) {
            return placeHolder;
        }

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
        } else {
            return placeHolder;
        }
    }

    const imageStyle: React.CSSProperties = {
        'width': '40%',
        'height': 'auto',
        'maxHeight': '100%',
        'objectFit': 'cover'
    };

    function getRandomFloat(min: number, max: number, decimalPlaces: number): number {
        const factor = Math.pow(10, decimalPlaces);
        return Math.round((Math.random() * (max - min) + min) * factor) / factor;
    }

    const getStateValue = (stateInfo, key: string) => {
        let info = stateInfo.find((info) => info.state === key);
        return info ? info.hours : '00:00'
    }

    return (
        <React.Fragment>
            <div className='status-cards-container'>
                {data.map((item: any, key: number) => (
                    <Item data={item} key={key} />
                ))}
            </div>
        </React.Fragment>
    );
}

export default FleetList;