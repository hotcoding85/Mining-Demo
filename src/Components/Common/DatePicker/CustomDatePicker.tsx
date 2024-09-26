import { DatePicker, DatePickerProps } from "antd";
import "./customdatepicker.scss";

interface CustomDatePickerProps extends DatePickerProps {
  label?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  ...props
}) => {
  return (
    <div className="custom-date-picker">
      <DatePicker {...props} />
      <div className="custom-date-picker-label">
        {label}
      </div>
    </div>
  );
};

export default CustomDatePicker;
