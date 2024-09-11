import React, { useCallback, useState } from 'react';
import { Table, Button, Checkbox } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import Notification from "Components/Common/Notification";
import { LngLatLike } from 'mapbox-gl';
import _ from 'lodash';
export interface EquipmentType {
    key: string;
    operator: string;
    status: string;
    rpm: number;
    interval: number;
    fault: string;
    statusColor: string;
}
interface EquipmentLocation {
    id: string;
    name: string;
    color: string;
    status: string;
    position: LngLatLike;
    vehicleType: string;
    operator: string;
    rpm: number;
    interval: number;
    fault: string;
    statusColor: string;
}
type EquipmentBoardPropsType = {
    data: EquipmentLocation[],
    showMessage:() => void;
    setIsBroadcast: (isBroadcast: boolean) => void;
    setCurrentEq: (eqs: EquipmentLocation[]) => void;
}
const EquipmentBoard: React.FC<EquipmentBoardPropsType> = ({data, showMessage, setIsBroadcast, setCurrentEq}) => {
    const _data: EquipmentType[] = 
        data.map(location => ({
            key: location.id,
            operator: location.operator,
            status: location.status,
            rpm: location.rpm,
            interval: location.interval,
            fault: location.fault,
            statusColor: location.statusColor
    }));
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const onSelectAllChange = (e: any) => {
        const checked = e.target.checked;
        if (checked) {
            setSelectedRowKeys(_data.map((item) => item.key)); // Select all
        } else {
            setSelectedRowKeys([]); // Deselect all
        }
    };

    const onRowSelectChange = (record: EquipmentType, checked: boolean) => {
            if (checked) {
                setSelectedRowKeys([...selectedRowKeys, record.key]);
            } else {
                setSelectedRowKeys(selectedRowKeys.filter((key) => key !== record.key));
            }
    };

  const columns = [
        {
        title: (
            <Checkbox
            onChange={onSelectAllChange}
            checked={selectedRowKeys.length === data.length}
            indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < data.length}
            />
        ),  
        dataIndex: 'checkbox',
        key: 'checkbox',
        width: 50,
        render: (_, record) => (
                <Checkbox
                checked={selectedRowKeys.includes(record.key)}
                onChange={(e) => onRowSelectChange(record, e.target.checked)}
                />
            ),
        },
        {
            title: 'Operator Name',
            dataIndex: 'operator',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status: string, record: EquipmentType) => (
                    <span style={{ color: '#a6b0cf' }}>
                    <span className="status-dot" style={{ backgroundColor: record.statusColor }}></span>
                    {status}
                    </span>
                ),
            },
        {
            title: 'Engine RPM',
            dataIndex: 'rpm',
        },
        {
            title: 'Service Interval',
            dataIndex: 'interval',
        },
        {
            title: 'Fault Code',
            dataIndex: 'fault',
            render: (faultCode: string) => (
                <Button className="fault-code-btn" type="primary" danger>
                {faultCode}
                </Button>
            ),
        },
    ];


    const sendMessage = useCallback(() => {
        if (selectedRowKeys.length === 0) {
            setErrorMessage('Please select the operators.')
            return
        }
        const selectedEquipments = _.filter(data, location =>
            selectedRowKeys.includes(location.id)
        );
        setIsBroadcast(false)
        // Set the selected EquipmentLocation objects
        setCurrentEq(selectedEquipments);
        showMessage()
    }, [selectedRowKeys])

    return (
        <div className="message-board-container">
            <div className="message-board-header">
                <h2>Message Board</h2>
                <div className="message-board-actions">
                    <Button className='send-message-second' style={{border: '0px'}} icon={<FilterOutlined />}>Filter</Button>
                    <Button className='send-message-second' onClick={sendMessage}>Send a message</Button>
                </div>
            </div>
            <Table
                dataSource={_data}
                columns={columns}
                pagination={false}
                rowKey="key"
                className="message-board-table"
                scroll={{ y: 'calc(100vh - 410px)' }}
            />
            <Notification
                type={"warning"}
                message={errorMessage}
                onClose={() => setErrorMessage("")}
            />
        </div>
    );
};

export default EquipmentBoard;
