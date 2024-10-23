import React, { useMemo, useState } from "react";
import type { MenuProps } from "antd";
import { Button, Dropdown, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { upperCase } from "lodash";

interface SearchDropdownProps {
  itemsGroup: {
    [key: string]: {
      label: string;
      value: string;
    }[];
  };
  disableTitle?: boolean;
  disableDivider?: boolean;
  onApply: () => void;
  selectedValues: any;
  setSelectedValues: (values) => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  itemsGroup,
  disableTitle = false,
  disableDivider = false,
  onApply,
  setSelectedValues,
  selectedValues
}) => {
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  

  const onSelect = (value: string, groupName: string) => {
    const filteredData =
      selectedValues[groupName]?.filter((item) => item !== value) || [];
    setSelectedValues({
      ...selectedValues,
      [groupName]: [
        ...filteredData,
        ...(filteredData?.length === selectedValues[groupName]?.length
          ? [value]
          : []),
      ],
    });
  };

  const items: MenuProps["items"] = useMemo(() => {
    const menus: any[] = [
      {
        label: (
          <Input
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="items-search"
            placeholder="Search"
          />
        ),
        key: "0",
      },
    ];

    Object.entries(itemsGroup).forEach(([title, items], i) => {
      const filteredItems = items.filter((item) =>
        `${item.label}`.toLowerCase().includes(searchKeyword.toLowerCase())
      );

      if (!disableTitle && filteredItems.length > 0) {
        menus.push({
          label: <div className="menu-group-title">{upperCase(title)}</div>,
          key: (i + 1).toString(),
        });
      }

      if (!disableDivider && filteredItems.length > 0) {
        menus.push({
          type: "divider",
        });
      }

      if (filteredItems.length > 0) {
        filteredItems.map((item) =>
          menus.push({
            label: (
              <div
                className="menu-group-item d-flex justify-content-start align-items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(item.value, title);
                }}
              >
                <i
                  className={
                    selectedValues[title]?.includes(item.value)
                      ? "mdi mdi-checkbox-marked"
                      : "mdi mdi-checkbox-blank-outline"
                  }
                ></i>
                <span>{item.label}</span>
              </div>
            ),
            key: item.value,
          })
        );
      }
    });

    // menus.push({
    //   label: (
    //     <div className="d-flex justify-content-center align-items-center gap-2">
    //       <Button
    //         type="text"
    //         className="cancel-btn"
    //         onClick={(e) => {
    //           e.stopPropagation();
    //         }}
    //       >
    //         Cancel
    //       </Button>
    //       <Button
    //         className="apply-btn"
    //         onClick={(e) => {
    //           e.stopPropagation();
    //           onApply();
    //         }}
    //       >
    //         Apply
    //       </Button>
    //     </div>
    //   ),
    //   key: "end",
    // });

    return menus;
  }, [itemsGroup, searchKeyword, selectedValues]);

  return (
    <Dropdown menu={{ items }} trigger={["click"]} className="search-dropdown">
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
        onClick={(e) => {e.preventDefault()}}
      >
        Filter
      </Button>
    </Dropdown>
  );
};

export default SearchDropdown;
