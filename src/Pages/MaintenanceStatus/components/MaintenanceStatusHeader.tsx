import { Button } from "antd";
import { DATA_VIEW_MODE } from "Components/constants/constants";
import { styled } from "styled-components";

const HeaderContainer = styled.div`
  border-radius: 8px;
  background: #283655;
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

const IconButton = ({
  active,
  iconClassName,
  onClick,
}: {
  active: boolean;
  iconClassName: any;
  onClick: () => void;
}) => {
  return (
    <Button
      icon={
        <i
          className={iconClassName}
          style={{
            fontSize: "16px",
            lineHeight: "0",
            color: "white",
          }}
        />
      }
      className={`header-action-btn ${active && "header-action-btn-active"}`}
      onClick={onClick}
    />
  );
};

interface MaintenanceStatusHeaderProps {
  viewMode: DATA_VIEW_MODE;
  onChangeViewMode: (mode: DATA_VIEW_MODE) => void;
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
        <div className="d-flex justify-content-start align-items-center">
          <IconButton
            iconClassName="mdi mdi-menu"
            onClick={() => onChangeViewMode(DATA_VIEW_MODE.TABLE)}
            active={viewMode === DATA_VIEW_MODE.TABLE}
          />
          <IconButton
            iconClassName="mdi mdi-view-grid"
            onClick={() => onChangeViewMode(DATA_VIEW_MODE.GRID)}
            active={viewMode === DATA_VIEW_MODE.GRID}
          />
        </div>
      </div>
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
    </HeaderContainer>
  );
};

export default MaintenanceStatusHeader;
