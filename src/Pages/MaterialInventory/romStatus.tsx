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
              data={data || []}
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
