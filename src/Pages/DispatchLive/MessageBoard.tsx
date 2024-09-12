import React from "react";
import MessageBoardChips from "./MessageBoardChips";

const MessageBoard: React.FC = () => {
  return (
    <React.Fragment>
      <div className="px-3">
        <p className="right-board-topic">Message Board</p>
        <MessageBoardChips
          truckId="DT104"
          status="Delay Fueling"
          backgroundColor="#9254DE"
        />
        <MessageBoardChips
          truckId="DT110"
          status="Breakdown"
          backgroundColor="#FF4D4F"
        />
      </div>
    </React.Fragment>
  );
};

export default MessageBoard;
