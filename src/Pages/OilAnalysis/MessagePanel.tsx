import React, { useState } from 'react';
import { Input, Button, List, Dropdown, MenuProps } from 'antd';
import { SearchOutlined, FilterOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Checkbox from 'antd/es/checkbox/Checkbox';
import { Card } from 'reactstrap';
import { LayoutSelector } from 'selectors';
import { useSelector } from 'react-redux';
import { LAYOUT_MODE_TYPES } from 'Components/constants/layout';

type MessagePanelProps = {
}

const MessagesPanel: React.FC<MessagePanelProps> = (props: any) => {
    const alertTypes = ["Critical Condition", "Caution", "Normal", "Critical Condition"]
    const getRandomTitle = () => {
        const prefix = "DT";
        const ranges = [[101, 105], [121, 125]];
        const randomRange = ranges[Math.floor(Math.random() * ranges.length)];
        const randomNumber = Math.floor(
          Math.random() * (randomRange[1] - randomRange[0] + 1)
        ) + randomRange[0];
        return `${prefix}${randomNumber}`;
    };

    // Function to generate random type
    const getRandomType = () => {
        return alertTypes[Math.floor(Math.random() * alertTypes.length)];
    };
    const generateRandomAlerts = (count: number) => {
        return Array.from({ length: count }, (_, index) => ({
          key: `${index + 1}`,
          title: getRandomTitle(),
          type: getRandomType(),
        }));
    };
    
    const [alerts, setAlerts] = useState(generateRandomAlerts(6));
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    
    const { layoutModeType } = useSelector(LayoutSelector);
    const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;
    const onSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        if (checked) {
            setSelectedRowKeys(alerts.map((item) => item.key)); // Select all
        } else {
            setSelectedRowKeys([]); // Deselect all
        }
    };

    const onRowSelectChange = (key: React.Key, checked: boolean) => {
        if (checked) {
            setSelectedRowKeys([...selectedRowKeys, key]);
        } else {
            setSelectedRowKeys(selectedRowKeys.filter((selectedKey) => selectedKey !== key));
        }
    };

    const filteredAlerts = alerts.filter(alert => {

    });

    const handleDelete = () => {
        setAlerts(alerts.filter(message => !selectedRowKeys.includes(message.key)));
        setSelectedRowKeys([]); // Clear selection after deletion
    };

    const handleMenuClick: MenuProps['onClick'] = (e) => {

    };

    return (
        <Card style={{padding: '1rem', height: '100%'}}>
            <div className="custom-scrollbar-horizontal">
                <div className="header">
                    <h4 style={{ marginBottom: '0px' }}>Alerts</h4>
                </div>
                <div className="actions d-flex" style={{ marginBottom: '1rem', marginTop: '1rem', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex' }}>
                        <Checkbox
                            indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < alerts.length}
                            checked={selectedRowKeys.length === alerts.length}
                            onChange={(e: any) => onSelectAllChange(e)}
                            style={{ marginRight: '20px' }}
                        />
                        <Button
                            className={isLight? 'btn-light-filter' : 'btn-dark-filter'}
                            icon={<DeleteOutlined />}
                            type="text"
                            onClick={handleDelete}
                            disabled={selectedRowKeys.length === 0}
                        />
                    </div>
                    <Button className={isLight? 'btn-light-filter' : 'btn-dark-filter'} icon={<FilterOutlined />} type="text">
                        Filter
                    </Button>
                </div>
                <List
                    itemLayout="horizontal"
                    dataSource={alerts}
                    renderItem={item => (
                        <List.Item className='message-panel-item'>
                            <Checkbox
                                checked={selectedRowKeys.includes(item.key)}
                                onChange={(e) => onRowSelectChange(item.key, e.target.checked)}
                                style={{ marginRight: '10px' }}
                            />
                            <List.Item.Meta
                                title={<span className={`status ${item.type.toLowerCase()}`}>{item.title}</span>}
                                description={<div className='alert-subtitle'>{item.type}</div>}
                            />
                        </List.Item>
                    )}
                />
            </div>
        </Card>
    );
};

export default MessagesPanel;
