import React from "react";

interface BlockPopupContentProps {
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

const BlockPopupContent: React.FC<BlockPopupContentProps> = ({
  properties,
}) => {
  return (
    <div>
      <table
        style={{
          fontFamily: "arial, sans-serif",
          borderCollapse: "collapse",
          width: "100%",
          border: "1px solid #000",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th style={{ border: "1px solid #000", padding: "2px" }}>
              Properties
            </th>
            <th style={{ border: "1px solid #000", padding: "2px" }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(properties).map(([key, value], index) => (
            <tr
              key={key}
              style={{
                backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9",
              }}
            >
              <td style={{ border: "1px solid #000", padding: "2px" }}>
                {key}
              </td>
              <td style={{ border: "1px solid #000", padding: "2px" }}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BlockPopupContent;
