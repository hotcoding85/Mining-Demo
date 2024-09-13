import React, { useState } from "react";
import "./styles/messageBoard.scss"
import { MessageData } from "./interfaces/type";

interface MessageBoardChipsProps {
    message : MessageData;
    backgroundColor: string;
    closeMessage : (message: MessageData) => void;
}
const MessageBoardChips : React.FC<MessageBoardChipsProps> = ({
    message,
    backgroundColor,
    closeMessage
}) => {

    const [isVisible, setIsVisible] = useState(true);
    const handleColse = () => {
        closeMessage(message);
    }
    return isVisible ? (
        <div className="message-container" style={{backgroundColor:backgroundColor}}>
            <p className="message-text">
                <span className="message-truck-text" >{message.truckId}</span>
                <span className="message-status-text" >{message.status}</span>
            </p>
            <p className="message-close-btn" onClick={handleColse}>x</p>
        </div>
    ): null;
}

export default MessageBoardChips;