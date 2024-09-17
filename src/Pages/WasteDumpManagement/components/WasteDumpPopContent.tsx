import React from "react";

interface WasteDumpPopContentProps {
  properties: {
    blockId: string;
    name: string;
    source: string;
    status: string;
    tonnes: number;
    volume: number;
    density: number;
    augt: number;
  };
}

const WasteDumpPopContent: React.FC<WasteDumpPopContentProps> = ({
  properties,
}) => {
  return (
    <div>
      <table
        style={{
          fontFamily: "arial, sans-serif",
          borderCollapse: "collapse",
          width: "100%",
        }}
      >
        <tbody>
          {Object.entries(properties).map(([key, value], index) => {
            if (key != "id" && key != "locationId") {
              return (
                <tr key={key}>
                  <td style={{ padding: "4px" }}>{key}</td>
                  <td style={{ padding: "4px" }}>{value}</td>
                </tr>
              );
            }
            return "";
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WasteDumpPopContent;
