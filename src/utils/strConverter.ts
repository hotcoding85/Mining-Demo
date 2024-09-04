interface GeoJSON {
  type: string;
  features: Feature[];
}

interface Feature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][];
  };
  properties: {
    name: string;
    blockId: string;
    density: number;
    tonnes: number;
    volume: number;
    augt: number;
    source: string;
  };
}

export const strFileToGeoJSON = (file, callback) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    const text = e.target?.result as string;
    const json = parseStrFileToGeoJSON(text);
    callback(json);
  };

  reader.readAsText(file);
};

const parseStrFileToGeoJSON = (text: string): GeoJSON => {
  const lines = text.split("\n");
  const featureMap: { [key: string]: Feature } = {};

  // Iterate over each line of the file
  lines.forEach((line) => {
    const parts = line.split(",");
    if (parts.length >= 11) {
      const x = parseFloat(parts[1]);
      const y = parseFloat(parts[2]);
      const z = parseFloat(parts[3]);
      const name = parts[4];
      const blockId = parts[5];

      // Create a unique key for each feature based on blockId and name
      const featureKey = `${blockId}_${name}`;

      if (!featureMap[featureKey]) {
        featureMap[featureKey] = {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [],
          },
          properties: {
            name,
            blockId,
            density: parseFloat(parts[6]),
            tonnes: parseFloat(parts[7]),
            volume: parseFloat(parts[8]),
            augt: parseFloat(parts[9]),
            source: parts[10]?.replace("\r", ""),
          },
        };
      }

      // Add the current point to the coordinates of the corresponding feature
      featureMap[featureKey].geometry.coordinates.push([x, y]);
    }
  });

  // Convert the feature map to an array of features
  const features = Object.values(featureMap);

  // Construct GeoJSON object
  const geoJSON: GeoJSON = {
    type: "FeatureCollection",
    features,
  };

  return geoJSON;
};
