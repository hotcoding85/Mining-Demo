import React, { useState } from "react";
import { Avatar, List, Space, Tag, Typography } from "antd";
import { CheckOutlined, MenuOutlined } from "@ant-design/icons";
const { Title, Text } = Typography;

const TrailerItem = ({ trailer, index, isSelected, onSelect, isLight }) => {
  const ref = React.useRef(null);

  return (
    <List.Item
      ref={ref}
      onClick={onSelect}
      style={{
        cursor: "pointer",
        opacity: isSelected ? "1" : "0.5",
      }}
      actions={[
        isSelected && <CheckOutlined style={{ color: "green" }} />, // Show tick when selected
      ]}
    >
      <List.Item.Meta
        className="unit-item"
        avatar={<Avatar className="unit-item-avatar" src={trailer.avatar} />}
        title={trailer.name}
        description={
          <Space direction="vertical">
            <Text type="secondary" style={{whiteSpace: 'nowrap', color: isLight ? 'rgba(0, 0, 0, 0.88)' : 'grey'}}>Data Rate: {trailer.dataRate}</Text>
          </Space>
        }
      />
    </List.Item>
  );
};

export default TrailerItem;