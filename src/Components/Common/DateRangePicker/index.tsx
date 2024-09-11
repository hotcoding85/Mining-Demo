import React, { useState } from "react";
import { DateRangePicker } from "react-date-range";
import { addDays } from "date-fns";

import "./index.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Button, Popover } from "antd";
import { FaRegCalendarAlt } from "react-icons/fa";

interface DateRangePickerProps {}

const CustomDateRangePicker: React.FC<DateRangePickerProps> = ({}) => {
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: "selection",
    },
  ]);

  return (
    <Popover
      placement="bottomRight"
      trigger="click"
      arrow={false}
      content={
        <DateRangePicker
          onChange={(item) => setState([item.selection])}
          showSelectionPreview={true}
          moveRangeOnFirstSelection={false}
          months={2}
          ranges={state}
          direction="horizontal"
        />
      }
    >
      <Button className="date-range-picker-trigger">
        <FaRegCalendarAlt />
        Date
      </Button>
    </Popover>
  );
};

export default CustomDateRangePicker;
