import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card, Button, Input, Typography, Tooltip } from 'antd';
import { CloseOutlined, LineOutlined, NodeCollapseOutlined, SendOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { EquipmentLocation } from '.';
const { Text } = Typography;

interface ChatComponentProps {
    currentEq: EquipmentLocation[];
    isLight: boolean;
    isBroadcast: boolean;
    onClose: () => void;
}
interface Message {
    id: number;
    content: string;
    sender: string; // "user" or "system"
}
const MessageComponent: React.FC<ChatComponentProps> = ({ currentEq, isLight, isBroadcast, onClose }) => {
    const recommendedMessage = [
        "BreakDown",
        "Ready for Dispatch",
        "Schedule",
        "Active",
        "Delay",
    ];
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [message, setMessage] = useState('');

    const checkScrollPosition = () => {
        if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
        }
    };

    const scrollLeft = () => {
        if (scrollRef.current) {
        scrollRef.current.scrollLeft -= 100;
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
        scrollRef.current.scrollLeft += 100;
        }
    };
    useEffect(() => {
        checkScrollPosition();
        if (scrollRef.current) {
          scrollRef.current.addEventListener('scroll', checkScrollPosition);
        }
    
        return () => {
          if (scrollRef.current) {
            scrollRef.current.removeEventListener('scroll', checkScrollPosition);
          }
        };
    }, []);

    const [isCollapsed, setIsCollapsed] = useState(false);
    const onCollapse = useCallback(() => {
        setIsCollapsed(!isCollapsed)
    }, [isCollapsed])

    useEffect(() => {
        setIsCollapsed(false)
        setMessages([])
    }, [currentEq])
    useEffect(() => {
        setMessages([])
    }, [isBroadcast])
    const [messages, setMessages] = useState<Message[]>([]);

    const handleSendMessage = () => {
        if (message.trim()) {
            setMessages([...messages, { id: messages.length + 1, content: message.trim(), sender: 'user' }]);
            setMessage('');
        }
    };
    return (
        <Card
            style={{
                width: !isCollapsed ? 400 : 200,
                height: !isCollapsed ? 360 : 50,
                position: 'absolute',
                zIndex: 10,
                borderRadius: 0,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                padding: '0px !important',
                bottom: !isCollapsed ? 28 : 3,
                right: 30,
                border: '0px',
                background: isLight ? 'white' : '#1d3355',
                transform: "easeIn"
            }}
            bodyStyle={{ padding: '16px' }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 8,
                    margin: '-16px',
                    padding: '10px 16px 5px 16px',
                    borderBottom: !isCollapsed ? '1px dashed grey' : '0px'
                }}
            >
                <div>
                    <Tooltip
                        title={
                            isBroadcast
                                ? 'BroadCast'
                                : currentEq.length === 0
                                ? currentEq[0]?.id
                                : _.map(currentEq, eq => eq.id).join(',')
                        }
                    >
                        <div
                            style={{
                                fontSize: '22px',
                                color: isLight ? '#4c5e97' : 'white',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                maxWidth: !isCollapsed ? '320px' : '120px'
                            }}
                        >
                            {isBroadcast
                                ? 'BroadCast'
                                : currentEq.length === 0
                                ? currentEq[0]?.id
                                : _.map(currentEq, eq => eq.id).join(',')}
                        </div>
                    </Tooltip>
                    {(
                        <Text
                            style={{
                                display: 'block',
                                fontSize: 16,
                                color: isLight ? '#a6b0cf' : 'white'
                            }}
                        >
                            {!isCollapsed && !isBroadcast && currentEq.length === 1 ? currentEq[0].name : ''}
                        </Text>
                    )}
                </div>
                <div>
                    <LineOutlined
                        onClick={onCollapse}
                        style={{
                            cursor: 'pointer',
                            color: isLight ? '#1f3454' : 'white',
                            marginRight: '10px'
                        }}
                    />
                    <CloseOutlined
                        onClick={onClose}
                        style={{
                            cursor: 'pointer',
                            color: isLight ? '#1f3454' : 'white'
                        }}
                    />
                </div>
            </div>
    
            <div style={{ minHeight: '176px', maxHeight: '176px', overflowY: 'auto', marginTop: '20px' }}>
                {!isCollapsed && messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            display: 'flex',
                            justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: '8px'
                        }}
                    >
                        <div
                            style={{
                                background: msg.sender === 'user' ? '#4c5e97' : '#e0e0e0',
                                color: msg.sender === 'user' ? 'white' : 'black',
                                padding: '8px',
                                borderRadius: '12px',
                                maxWidth: '70%',
                            }}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>
    
            <div style={{ textAlign: 'center', color: '#9fb2c3', padding: '5px' }}>
                Select message
            </div>
    
            <div className="carousel-container">
                {showLeftArrow && (
                    <Button
                        type="text"
                        style={{ boxShadow: isLight ? '' : '7px 5px 8px 8px #1f3454' }}
                        icon={<LeftOutlined style={{ color: isLight ? 'black' : 'white' }} />}
                        onClick={scrollLeft}
                        className="scroll-button"
                    />
                )}
                <div className="carousel-content" ref={scrollRef}>
                    {_.map(recommendedMessage, (msg, index) => (
                        <Button
                            key={index}
                            style={{
                                borderRadius: '10px',
                                background: isLight ? 'white' : '#1f3454',
                                color: isLight ? '#1f3454' : 'white',
                                padding: '8px',
                                marginRight: '10px'
                            }}
                            size="small"
                            onClick={() => setMessage(msg)}
                        >
                            {msg}
                        </Button>
                    ))}
                </div>
                {showRightArrow && (
                    <Button
                        style={{ boxShadow: isLight ? '' : '-6px 1px 3px 8px #1f3454' }}
                        type="text"
                        icon={<RightOutlined style={{ color: isLight ? 'black' : 'white' }} />}
                        onClick={scrollRight}
                        className="scroll-button"
                    />
                )}
            </div>
    
            <Input
                className='btn-message-send'
                value={message}
                onChange={(e: any) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                suffix={<SendOutlined style={{ cursor: 'pointer' }} onClick={handleSendMessage} />}
            />
        </Card>
    );
    
};

export default MessageComponent;
