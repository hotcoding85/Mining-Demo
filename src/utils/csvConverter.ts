export const csvFileToJson = (file, callback) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result;
      const json = csvToJson(text);
      callback(json);
    };
    
    reader.readAsText(file);
};
  
  const csvToJson = (csv) => {
    const lines = csv.split('\n');
    const result:any = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        const obj: any = {};
        const currentline = lines[i].split(',');
  
        for (let j = 0; j < headers.length; j++) {
            const key = headers[j]?.toLowerCase()?.trim()?.replace(" ", "_");
            obj[key] = currentline[j]?.replace("\r", '');
        }

        const someEmpty = currentline.some((item) => !item)
        if (someEmpty) continue;
        result.push(obj);
    }
  
    return result;
};