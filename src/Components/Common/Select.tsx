import Select from "react-select";

const CustomSelect = ({
  id,
  name,
  formValues,
  options,
  setFieldValue,
  onBlur,
}) => {

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      zIndex: 9999, // Adjust as necessary
      backgroundColor: "#2a3042", // dark background color
      borderColor: state.isFocused ? "#32394e" : "#32394e", // yellow border when focused
      boxShadow: state.isFocused ? "0 0 0 1px #32394e" : "none", // yellow shadow when focused
      "&:hover": {
        borderColor: state.isFocused ? "#32394e" : "#666",
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 10000, // Adjust as necessary
      backgroundColor: "#1f1f1f",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#32394e" : "#1f1f1f", // yellow selected option
      color: state.isSelected ? "#fff" : "#fff", // dark text color for options
      "&:hover": {
        backgroundColor: state.isSelected ? "#32394e" : "#444",
        color: "#fff",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#ccc", // dark text color for selected value
    }),
  };

  return (
    <Select
      id={id}
      name={name}
      className="basic-single"
      isClearable={true}
      isSearchable={true}
      styles={customStyles}
      options={options}
      value={options.find((option) => option.value === formValues[name])} // set selected value
      onChange={(option) => setFieldValue(name, option?.value)}
      onBlur={onBlur}
    />
  );
};

export default CustomSelect;
