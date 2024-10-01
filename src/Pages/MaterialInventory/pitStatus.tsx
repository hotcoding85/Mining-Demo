import Table from "Components/Common/Table";
import { getPitStatusByCategory } from "Helpers/api_materials_helper";
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardTitle } from "reactstrap";

// Static data for testing
const staticData = [
  {
    key: "pit_1",
    locationName: "Pit A",
    materialTarget: "Gold",
    materialName: "Gold",
  },
  {
    key: "pit_2",
    locationName: "Pit B",
    materialTarget: "Silver",
    materialName: "Copper",
  },
  {
    key: "pit_3",
    locationName: "Pit C",
    materialTarget: "Iron",
    materialName: "Iron",
  },
  {
    key: "pit_4",
    locationName: "Pit D",
    materialTarget: "Platinum",
    materialName: "Gold",
  },
  {
    key: "pit_5",
    locationName: "Pit E",
    materialTarget: "Copper",
    materialName: "Silver",
  },
];

const PitStatus = ({ shiftDate, shift }) => {
  const [data, setData] = useState(staticData);
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
    // getPitStatusByCategory(`${shiftDate}:${shift}`)
    //   .then((response) => {
    //     setMaterialCategories(response.materialCategories);
    //     setData(response.data);
    //   });
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
