import { SearchOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Input, Segmented } from "antd";
import { SearchDropdown } from "Components/Common/Dropdown";
import { useState } from "react";
import { styled } from "styled-components";

const HeaderContainer = styled.div`
  border-radius: 8px;
  background: var(--bg-color);
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 88px;
  margin-top: 24px;
`;

const HeaderTitle = styled.div`
  color: #fff;
  text-align: center;
  font-size: 24px;
  font-style: normal;
  font-weight: 500;
  line-height: 32px;
`;

const HeaderTools = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const DiggingOptimisationHeader = () => {
  const [shiftType, setShiftType] = useState("current");

  const onShiftTypeChange = (shiftInfo) => {
    setShiftType(shiftInfo);
  };

  const filters = {
    model: [
      {
        label: "HD1500",
        value: "HD1500",
      },
      {
        label: "HD785",
        value: "HD785",
      },
    ],
    fleet: [
      {
        label: "Fleet1",
        value: "TD001",
      },
      {
        label: "Fleet2",
        value: "TD002",
      },
      {
        label: "Fleet3",
        value: "TD003",
      },
    ],
  };
  return (
    <HeaderContainer>
      <HeaderTitle>Digging Ore Tracking</HeaderTitle>
      <HeaderTools>
        <SearchDropdown itemsGroup={filters} />
        <Segmented
          className="customSegmentLabel shift-segment"
          value={shiftType}
          onChange={onShiftTypeChange}
          options={[
            { value: "current", label: "Current Shift" },
            { value: "previous", label: "Previous Shift" },
          ]}
        />
        <Button className="digging-csv-btn">
          Export CSV
          <UploadOutlined />
        </Button>
        <Input
          prefix={<SearchOutlined />}
          onClick={(e) => e.stopPropagation()}
          className="digging-optimisation-search"
          placeholder="Quick Search"
        />
      </HeaderTools>
    </HeaderContainer>
  );
};

export default DiggingOptimisationHeader;
