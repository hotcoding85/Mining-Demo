import React from 'react';
import { Button, Tag } from 'antd';
import { CheckSquareOutlined, CloseOutlined } from '@ant-design/icons';

interface StatusCardProps {
    id: string;
    syncedTime: string;
    status: string;
    smu: string;
    fuelLevel: string;
    fuelRate: string;
    bgColor: string;
    onMessageClick: () => void;
    onClose: () => void;
}
const StatusCard: React.FC<StatusCardProps> = ({
    id,
    syncedTime,
    status,
    smu,
    fuelLevel,
    fuelRate,
    bgColor,
    onMessageClick,
    onClose
    }) => {
    return (
        <div className="message-status-card">
            <div className="status-header">
                <div>
                    <button
                        onClick={onClose} // Handle click event
                        style={{ border: 'none', background: 'transparent', padding: 0, position: 'absolute', color: 'white', right: '10px', top: '7px', fontSize: '14px' }} // Optional: Adjust padding if needed
                    >
                        <CloseOutlined />
                    </button>
                <h3>{id}</h3>
                <div className="synced">
                    <CheckSquareOutlined style={{ color: 'green', marginRight: '5px' }} />
                    Synced {syncedTime}
                </div>
                </div>
                <div style={{ position: 'relative', width: '80px', overflow: 'hidden', height: '26px', marginRight: '-15px' }}>
                    <span
                        className="ant-tag ant-tag-red status-tag css-dev-only-do-not-override-2mb38x"
                        style={{
                            position: 'absolute',
                            right: '0',
                            width: '100px', // Increased width to accommodate the extra 25px
                            marginRight: '-25px', // Hide the right 25px
                            color: 'white',
                            fontWeight: '800',
                            background: bgColor
                        }}
                    >
                        {status === 'ACTIVE' ? 'Healthy' : 'Weaky'}
                    </span>
                </div>
            </div>
            <div className="status-details">
                <div className="status-item">
                    <span>SMU</span>
                    <span className="value">{smu}</span>
                </div>
                <div className="status-item">
                    <span>Fuel Level</span>
                    <span className="value">{fuelLevel}</span>
                </div>
                <div className="status-item">
                    <span>Fuel Rate</span>
                    <span className="value">{fuelRate}</span>
                </div>
            </div>
            <Button className="message-button" style={{width: '100%'}} onClick={onMessageClick}>Send a message</Button>
        </div>
    );
};

export default StatusCard;
