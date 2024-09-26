import Table from "Components/Common/Table";
import { getPitStatusByCategory } from "Helpers/api_materials_helper";
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardTitle } from "reactstrap";

const PitStatus = ({ shiftDate, shift }) => {
  const [data, setData] = useState([]);
  const [materialCategories, setMaterialCategories] = useState([]);

  const columns = useMemo(() => {
    return [
      {
        title: "Pit",
        key: "locationName",
        dataIndex: "locationName",
        dataType: "string",
      },
      {
        title: "Material",
        children: [
          {
            title: "Target",
            key: "materialTarget",
            dataIndex: "materialTarget",
            align: "center",
          },
          {
            title: "Actual",
            key: "materialName",
            dataIndex: "materialName",
            align: "center",
          },
        ],
      },
    ];
  }, []);

  useEffect(() => {
    getPitStatusByCategory(`${shiftDate}:${shift}`)
      // getPitStatusByCategory("2024-08-05:NS")
      .then((response) => {
        setMaterialCategories(response.materialCategories);
        setData(response.data);
      });
  }, [shiftDate, shift]);

  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <CardTitle className="h4">Pit Status</CardTitle>
          <Table columns={columns} data={data || []} />
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default PitStatus;
