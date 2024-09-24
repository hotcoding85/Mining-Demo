import React, { useState } from "react";
import MessageBoardChips from "./MessageBoardChips";
import { MessageData } from "./interfaces/type";
import { sampleAllMessages, sampleNewMessages } from "./data/sampleData";

const MessageBoard: React.FC = () => {
  const [isViewHistory, setIsViewHistory] = useState(false);
  const [allMessages, setAllMessages] =
    useState<MessageData[]>(sampleAllMessages);
  const [newMessages, setNewMessages] =
    useState<MessageData[]>(sampleNewMessages);

  const onViewHistory = () => {
    setIsViewHistory(!isViewHistory);
    if (!isViewHistory) {
      setAllMessages(sampleAllMessages);
    }
  };
  const onCloseHistoryMessage = (message: MessageData) => {
    setAllMessages(allMessages.filter((item) => item.id !== message.id));
  };
  const onCloseNewMessage = (message: MessageData) => {
    setNewMessages(newMessages.filter((item) => item.id !== message.id));
  };

  return (
    <React.Fragment>
      <div>
        <div className="d-flex flex-row justify-content-between">
          <p className="right-board-topic">Message Board</p>
          <div className="show-more-btn" onClick={onViewHistory}>
            {!isViewHistory ? "View History" : "New Messages"}
          </div>
        </div>
        {isViewHistory
          ? allMessages.map((message, index) => (
              <MessageBoardChips
                key={`${message.truckId}-${index}`}
                message={message}
                backgroundColor={index % 2 == 0 ? "#9254DE" : "#FF4D4F"}
                closeMessage={onCloseHistoryMessage}
              />
            ))
          : newMessages.map((message, index) => (
              <MessageBoardChips
                key={`${message.truckId}-${index}`}
                message={message}
                backgroundColor={index % 2 == 0 ? "#9254DE" : "#FF4D4F"}
                closeMessage={onCloseNewMessage}
              />
            ))}
      </div>
    </React.Fragment>
  );
};

export default MessageBoard;
