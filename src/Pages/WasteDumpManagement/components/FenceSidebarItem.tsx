import { LAYOUT_MODE_TYPES } from "Components/constants/layout";
import { useSelector } from "react-redux";
import { LayoutSelector } from "selectors";

interface FenceSidebarItemProps {
  fence: any;
  onClick: (fence: any) => void;
  onRemove: (fence: any) => void;
}

const FenceSidebarItem: React.FC<FenceSidebarItemProps> = ({
  fence,
  onClick,
  onRemove,
}) => {

  const { layoutModeType } = useSelector(LayoutSelector);

  const isLight = layoutModeType === LAYOUT_MODE_TYPES.LIGHT;

  return (
    <div
      className={"route-item " + (isLight ? "light-mode" : "dark-mode")}
      key={fence.id}
      style={{
        display: "flex",
        alignItems: "center",
        fontSize: "14px",
        padding: "6px",
        backgroundColor: "white",
      }}
    >
      <div style={{ flex: "1" }} onClick={() => onClick(fence)}>
        <div style={{ color: fence.color, display: "block" }}>{fence.name}</div>
        {/* <div
          style={{
            fontSize: "12px",
            display: "block",
            color: isLight ? "black" : "white",
          }}
        >
          Grade: {grade}
        </div>
        <div
          style={{
            fontSize: "12px",
            display: "block",
            color: isLight ? "black" : "white",
          }}
        >
          Tonnes: {tonnes}
        </div>
        <div
          style={{
            fontSize: "12px",
            display: "block",
            color: isLight ? "black" : "white",
          }}
        >
          Volume: {volume}
        </div>
        <div
          style={{
            fontSize: "12px",
            display: "block",
            color: isLight ? "black" : "white",
          }}
        >
          Density: {density}
        </div> */}
      </div>
      <div style={{ flex: "0.1", color: "var(--dark-text-color)" }}>
        <i className="bx bx-trash" onClick={() => onRemove(fence)}></i>
      </div>
    </div>
  );
};

export default FenceSidebarItem;
