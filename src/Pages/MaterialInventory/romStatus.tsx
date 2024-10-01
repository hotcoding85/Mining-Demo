import Table from "Components/Common/Table";
import { getROMStatus } from "Helpers/api_materials_helper";
import React, { useEffect, useState } from "react";
import { Card, CardBody, CardTitle } from "reactstrap";

const columns = [
  {
    title: "Name",
    dataIndex: "materialName",
    key: "materialName",
    dataType: "string",
  },
  {
    title: "Grade",
    dataIndex: "materialGrade",
    key: "materialGrade",
    dataType: "string",
  },
  {
    title: "From Pit",
    dataIndex: "fromPit",
    key: "fromPit",
    dataType: "string",
  },
  {
    title: "Into Crusher",
    dataIndex: "intoCrusher",
    key: "intoCrusher",
    dataType: "string",
  },
  {
    title: "Current Stock",
    dataIndex: "currentStock",
    key: "currentStock",
    dataType: "number",
  },
];

const sampleData = [
  {
    key: "material_1",
    materialName: "Gold",
    materialGrade: "A",
    fromPit: "Pit A",
    intoCrusher: "Crusher 1",
    currentStock: 500,
  },
  {
    key: "material_2",
    materialName: "Silver",
    materialGrade: "B",
    fromPit: "Pit B",
    intoCrusher: "Crusher 2",
    currentStock: 300,
  },
  {
    key: "material_3",
    materialName: "Copper",
    materialGrade: "C",
    fromPit: "Pit C",
    intoCrusher: "Crusher 3",
    currentStock: 700,
  },
  {
    key: "material_4",
    materialName: "Platinum",
    materialGrade: "A",
    fromPit: "Pit D",
    intoCrusher: "Crusher 4",
    currentStock: 150,
  },
  {
    key: "material_5",
    materialName: "Iron",
    materialGrade: "D",
    fromPit: "Pit A",
    intoCrusher: "Crusher 5",
    currentStock: 800,
  },
];

const RomStatus = ({ shiftDate, shift }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    getROMStatus(`${shiftDate}:${shift}`)
      // getROMStatus("2024-08-05:NS")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [shiftDate, shift]);

  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <CardTitle className="h4">ROM Status</CardTitle>
          <div className="mt-3">
            <Table
              columns={columns}
              data={sampleData || []}
              paginationPageSize={5}
              scroll={{ x: "max-content" }}
            />
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default RomStatus;
