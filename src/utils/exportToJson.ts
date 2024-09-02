export const exportToJson = (objectData, fileName) => {
  const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(objectData)
  )}`;
  const link = document.createElement("a");
  link.href = jsonString;
  link.download = `${fileName}.json`;

  link.click();
};
