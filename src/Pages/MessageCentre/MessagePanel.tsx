import React, { useState } from 'react';
import { Input, Button, List, Dropdown, MenuProps } from 'antd';
import { SearchOutlined, FilterOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Checkbox from 'antd/es/checkbox/Checkbox';
import useDebounce from './useDebounce';

type MessagePanelProps = {
    setIsBroadcast: (broadcast: boolean) => void;
    showMessageModal: (showMessageModal: boolean) => void;
}

const MessagesPanel: React.FC<MessagePanelProps> = ({setIsBroadcast, showMessageModal}) => {
    const [messages, setMessages] = useState([
        { key: '1', title: 'EX201', description: 'Hi' },
        { key: '2', title: 'EX202', description: 'Hello?' },
        { key: '3', title: 'EX203', description: 'Good morning' },
        { key: '4', title: 'DT121', description: 'hii' },
        { key: '5', title: 'DT122', description: 'hiya' },
        { key: '6', title: 'DT123', description: 'bye' },
        { key: '7', title: 'DT102', description: 'good luck' },
        { key: '8', title: 'DT103', description: 'gm' },
        { key: '9', title: 'DT104', description: 'hello' },
    ]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce for 300ms
    
    const onSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        if (checked) {
            setSelectedRowKeys(messages.map((item) => item.key)); // Select all
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

    const filteredMessages = messages.filter(message =>
        message.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );

    const handleDelete = () => {
        setMessages(messages.filter(message => !selectedRowKeys.includes(message.key)));
        setSelectedRowKeys([]); // Clear selection after deletion
    };

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        if (e.key === '2') {
            setIsBroadcast(true);
        } else {
            setIsBroadcast(false);
        }
        showMessageModal(true);
    };

    const items: MenuProps['items'] = [
        {
            label: 'Message',
            key: '1',
        },
        {
            label: 'Broadcast',
            key: '2',
        },
    ];

    const menuProps = {
        items,
        onClick: handleMenuClick,
    };

    return (
        <div className="messages-panel custom-scrollbar-horizontal">
            <div className="header">
                <h4 style={{ marginBottom: '0px' }}>Messages</h4>
                <Dropdown.Button
                    menu={menuProps}
                    placement="bottom"
                    className='new-message-button'
                    style={{ padding: 0, width: '32px' }}
                    icon={<EditOutlined style={{ color: 'white' }} />}
                >
                </Dropdown.Button>
            </div>
            <Input
                placeholder="Quick Search"
                prefix={<SearchOutlined />}
                className='message-panel-searchbar'
                style={{ marginBottom: '10px', borderRadius: '0px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="actions" style={{ marginBottom: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex' }}>
                    <Checkbox
                        indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < messages.length}
                        checked={selectedRowKeys.length === messages.length}
                        onChange={(e: any) => onSelectAllChange(e)}
                        style={{ marginRight: '20px' }}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        type="text"
                        onClick={handleDelete}
                        disabled={selectedRowKeys.length === 0}
                    />
                </div>
                <Button icon={<FilterOutlined />} type="text">
                    Filter
                </Button>
            </div>
            <List
                itemLayout="horizontal"
                dataSource={filteredMessages}
                renderItem={item => (
                    <List.Item className='message-panel-item'>
                        <Checkbox
                            checked={selectedRowKeys.includes(item.key)}
                            onChange={(e) => onRowSelectChange(item.key, e.target.checked)}
                            style={{ marginRight: '10px' }}
                        />
                        <List.Item.Meta
                            title={<span style={{ color: 'white' }}>{item.title}</span>}
                            description={<span style={{ color: 'gray' }}>{item.description}</span>}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default MessagesPanel;
