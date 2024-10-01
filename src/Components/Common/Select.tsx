// import Select from "react-select";
import { Select } from 'antd';
const CustomSelect = ({
  id,
  name,
  formValues,
  allowMultiple,
  options,
  setFieldValue,
  onBlur,
}) => {

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      zIndex: 9999, // Adjust as necessary
      backgroundColor: "var(--bg-color)", // dark background color
      borderColor: state.isFocused ? "var(--bg-color)" : "var(--bg-color)", // yellow border when focused
      boxShadow: state.isFocused ? "0 0 0 1px var(--bg-color)" : "none", // yellow shadow when focused
      "&:hover": {
        borderColor: state.isFocused ? "var(--bg-color)" : "#666",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 10000, // Adjust as necessary
      backgroundColor: "#1f1f1f",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "var(--bg-color)" : "#1f1f1f", // yellow selected option
      color: state.isSelected ? "#fff" : "#fff", // dark text color for options
      "&:hover": {
        backgroundColor: state.isSelected ? "var(--bg-color)" : "#444",
        color: "#fff",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#ccc", // dark text color for selected value
    }),
  };

  return (
    <>
      {
        allowMultiple && allowMultiple == true ? <Select
          id={id}
          showSearch
          allowClear
          mode='multiple'
          placeholder="Please select"
          // styles={customStyles}
          style={{ width: '100%' }}
          options={options}
          value={options.filter((option) => formValues[name].includes(option.value)).map((option) => option.value)} // set selected value
          onChange={(option) => {
            setFieldValue(name, option)
          }}
          onBlur={onBlur}
        /> : <Select
          id={id}
          showSearch
          allowClear
          placeholder="Please select"
          // styles={customStyles}
          style={{ width: '100%' }}
          options={options}
          value={options.find((option) => option.value === formValues[name])} // set selected value
          onChange={(option) => {
            setFieldValue(name, option)
          }}
          onBlur={onBlur}
        />
      }
    </>

  );
};

export default CustomSelect;
