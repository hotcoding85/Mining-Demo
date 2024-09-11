import React from "react";
import "./styles/messageBoard.scss"

interface MessageBoardChipsProps {
    truckId : string;
    status : string;
    backgroundColor: string;
}
const MessageBoardChips : React.FC<MessageBoardChipsProps> = ({
    truckId,
    status,
    backgroundColor
}) => {
    const handleColse = () => {
        
    }
    return (
        <div className="message-container" style={{backgroundColor:backgroundColor}}>
            <p className="message-text">
                <span className="message-truck-text" >{truckId}</span>
                <span className="message-status-text" >{status}</span>
            </p>
            <p className="message-close-btn" onClick={handleColse}>x</p>
        </div>
    )
}

export default MessageBoardChips;