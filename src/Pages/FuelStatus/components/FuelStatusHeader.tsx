import { Button, Segmented } from "antd";
import { styled } from "styled-components";

const HeaderContainer = styled.div`
  border-radius: 8px;
  background: var(--bg-color);
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const HeaderTitle = styled.div`
  color: #fff;
  text-align: center;
  font-feature-settings: "liga" off, "clig" off;
  font-family: Montserrat;
  font-size: 24px;
  font-style: normal;
  font-weight: 500;
  line-height: 32px;
`;

interface FuelStatusHeaderProps {
  displayType: string;
  setDisplayType: (mode: string) => void;
}

const FuelStatusHeader: React.FC<FuelStatusHeaderProps> = ({
  displayType,
  setDisplayType,
}) => {
  const onDisplayTypeChange = (displayInfo) => {
    setDisplayType(displayInfo);
  };
  return (
    <HeaderContainer>
      <div className="d-flex justify-content-start align-items-center gap-4">
        <HeaderTitle>Fuel Status</HeaderTitle>
      </div>
      <div className="d-flex align-items-center gap-4">
        <Button
          icon={
            <i
              className={"mdi mdi-filter-variant"}
              style={{
                fontSize: "16px",
                lineHeight: "0",
              }}
            />
          }
          className="header-action-btn"
        >
          Filter
        </Button>
        <Segmented
          className="customSegmentLabel fuel-status-segment"
          value={displayType}
          onChange={onDisplayTypeChange}
          options={[
            {
              value: "TABLE",
              icon: (
                <i
                  className="mdi mdi-menu"
                  style={{
                    fontSize: "16px",
                    lineHeight: "0",
                  }}
                />
              ),
            },
            {
              value: "GRID",
              icon: (
                <i
                  className="mdi mdi-view-grid"
                  style={{
                    fontSize: "16px",
                    lineHeight: "0",
                  }}
                />
              ),
            },
          ]}
        />
      </div>
    </HeaderContainer>
  );
};

export default FuelStatusHeader;
