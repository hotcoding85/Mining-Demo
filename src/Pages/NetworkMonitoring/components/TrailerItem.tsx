import React, { useEffect, useMemo, useState } from "react";
import { Avatar, List, Space, Tag, Typography } from "antd";
import { CheckOutlined, MenuOutlined } from "@ant-design/icons";
import ANTENNA from 'assets/images/network-mornitoring/antenna.jpg'
import SOLOR_UNIT from 'assets/images/network-mornitoring/solor-unit.jpg'
import XBUTTON from 'assets/images/x-button.png'
import SOLOR_TRAILER from 'assets/images/network-mornitoring/solor-trailer.jpg'
import SURVEY_MARKER from 'assets/images/network-mornitoring/survey-marker.jpg'

const { Title, Text } = Typography;
const TrailerItem = ({ trailer, index, isSelected, onSelect, isLight, handleEdit, handleRemove }) => {
  const ref = React.useRef(null);

  const initialTrailers = [
    { name: 'Tower', id: 'antenna', dataRate: '10 Mbps', avatar:  ANTENNA, objId: ''},
    // { name: 'Trailer', id: 'solor-trailer', dataRate: '8 Mbps', avatar: SOLOR_TRAILER },
    { name: 'Solar Panel', id: 'solor-unit', dataRate: '12 Mbps', avatar: SOLOR_UNIT, objId: '' },
    { name: 'GPS RTK Base Station', id: 'survey-marker', dataRate: '5 Mbps', avatar: SURVEY_MARKER, objId: '' },
  ];

  const equipment = useMemo(() => {
    let eq = initialTrailers.find(eq => 
      trailer.type === eq.id
    )
    let item = eq
    if (item) {
      item.name = trailer.name
      item.objId = trailer.id
      return item
    }
    else return null
  }, [trailer])


  return (
    <List.Item
      ref={ref}
      onClick={onSelect}
      style={{
        // opacity: isSelected ? "1" : "0.5",
      }}
      // actions={[
      //   isSelected && <CheckOutlined style={{ color: "green" }} />, // Show tick when selected
      // ]}
    >
      {equipment && <List.Item.Meta
        className="unit-item"
        style={{position: 'relative'}}
        avatar={<Avatar className="unit-item-avatar" src={equipment.avatar} />}
        title={equipment.name}
        description={
          <>
            <Space direction="horizontal">
              <Text type="secondary" style={{whiteSpace: 'nowrap', color: isLight ? 'rgba(0, 0, 0, 0.88)' : 'grey'}}>Data Rate: {equipment.dataRate}</Text>
              <i className="bx bx-trash"  style={{fontSize: '16px', color: isLight ? 'rgba(0, 0, 0, 0.88)': 'white', cursor: 'pointer', bottom: '20px', right: '0px', position: 'absolute'}} onClick={() => handleRemove(equipment.objId)}></i>
            </Space>
          </>
        }
      />
      }
    </List.Item>
  );
};

export default TrailerItem;