import React, { useState } from "react";
import { map } from "lodash";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "reactstrap";

export type DropdownType = {
  label: string;
  value?: string;
};

interface DropdownProps {
  label?: string;
  items: DropdownType[];
  value: DropdownType;
  onChange?: (value: DropdownType) => void;
}

const CustomDropdown: React.FC<DropdownProps> = ({
  label,
  items,
  value,
  onChange,
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const toggle = () => setOpen(!open);

  const onSelect = (value: DropdownType) => {
    onChange!(value);
  };

  return (
    <React.Fragment>
      <Dropdown
        isOpen={open}
        toggle={toggle}
        className="d-inline-block language-switch custom-dropdown"
      >
        <DropdownToggle tag="button" className="dropdown-btn relative">
          <div className="d-flex justify-content-between align-items-center">
            <span>{value.label}</span>
            <i
              className="mdi mdi-menu-down"
              style={{
                fontSize: "24px",
                lineHeight: "0",
              }}
            />
          </div>
          {label && <span className="dropdown-label">{label}</span>}
        </DropdownToggle>
        <DropdownMenu
          className="dropdown-menu-end"
          style={{
            width: "100%",
          }}
        >
          {map(items, (item, index) => (
            <DropdownItem
              key={index}
              onClick={() => onSelect(item)}
              className={`notify-item dropdown-item${
                item.value === value.value ? "active" : "none"
              }`}
            >
              <span className="align-middle">{item.label}</span>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default CustomDropdown;
