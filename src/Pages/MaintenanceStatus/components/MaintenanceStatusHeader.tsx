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

interface MaintenanceStatusHeaderProps {
  viewMode: string;
  onChangeViewMode: (mode: string) => void;
  filter?: {};
}

const MaintenanceStatusHeader: React.FC<MaintenanceStatusHeaderProps> = ({
  filter,
  viewMode,
  onChangeViewMode,
}) => {
  return (
    <HeaderContainer>
      <div className="d-flex justify-content-start align-items-center gap-4">
        <HeaderTitle>Maintenance Status</HeaderTitle>
      </div>
      <div className="d-flex justify-content-start align-items-center gap-4">
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
          className="customSegmentLabel maintenance-status-segment"
          value={viewMode}
          onChange={onChangeViewMode}
          options={[
            {
              value: "table",
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
              value: "grid",
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

export default MaintenanceStatusHeader;
