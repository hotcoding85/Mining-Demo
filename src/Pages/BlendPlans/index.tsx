import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  Col,
  Container,
  Row,
} from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import "./index.scss";
import { useDispatch, useSelector } from "react-redux";
import { getAllMaterials } from "slices/thunk";
import { round2Two } from "utils/common";
import Table from "Components/Common/Table";
import { Input } from "antd";
import { generateBlendPlan } from "utils/generateBlendPlan";
import { max } from "lodash";
import { MaterialSelector } from "selectors";

const BlendPlans = () => {
  document.title = "Blend Plans | FMS Live";

  const dispatch: any = useDispatch();
  const [targetTonnes, setTargetTonnes] = useState<number>(0);
  const [blendPlans, setBlendPlans] = useState<any[]>();

  const { materials } = useSelector(MaterialSelector);

  useEffect(() => {
    dispatch(getAllMaterials(1, 100)); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  const columns = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        dataType: "string",
        align: "left",
      },
      {
        title: "Grade",
        dataIndex: "grade",
        key: "grade",
        dataType: "number",
        align: "left",
        render: (_, record) => round2Two(record.grade),
      },
      {
        title: "Tonnes",
        dataIndex: "tonnes",
        key: "tonnes",
        dataType: "number",
        align: "left",
        render: (_, record) => round2Two(record.tonnes),
      },
    ],
    []
  );

  const generateBlendData = () => {
    setBlendPlans(generateBlendPlan(targetTonnes, materials));
  };

  const maxMaterialcounts = useMemo(
    () =>
      blendPlans
        ? max(
            blendPlans.map((item) => Object.entries(item.materialsUsed).length)
          )
        : 0,
    [blendPlans]
  );

  // Generate columns dynamically
  const blendDataTableColumns = [
    {
      title: "Day",
      dataIndex: "day",
      key: "day",
      render: (_, record) => record.day,
    },
    {
      title: "Total Tonnes",
      dataIndex: "totalTonnesUsed",
      key: "totalTonnesUsed",
      render: (_, record) => round2Two(record.totalTonnesUsed),
    },
    {
      title: "Total Gold",
      dataIndex: "totalGoldRecovered",
      key: "totalGoldRecovered",
      render: (_, record) => round2Two(record.totalGoldRecovered),
    },
    ...[...new Array(maxMaterialcounts)].map((_, i) => ({
      title: `M${i + 1} (Tonnes/Grade)`,
      dataIndex: `M${i}`,
      key: `M${i}`,
      render: (material: { name: string; tonnes: number; grade: number }) =>
        material ? (
          <div>
            {material?.name} ({round2Two(material?.tonnes)}/(
            {round2Two(material?.grade)}))
          </div>
        ) : (
          <div>-</div>
        ),
    })),
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Resources" breadcrumbItem="Blend Plans" />
          <Row>
            <Col lg="6">
              <Card style={{ padding: "24px" }}>
                <CardHeader>Materials</CardHeader>
                <Table
                  columns={columns}
                  data={materials || []}
                  paginationPageSize={10}
                />
              </Card>
            </Col>
          </Row>
          <Row>
            <Col lg="12">
              <div className="d-flex justify-content-start align-items-end gap-2">
                <div>
                  <label>Target Tonnes a day</label>
                  <Input
                    style={{ height: "40px" }}
                    type="number"
                    value={targetTonnes}
                    onChange={(e) => setTargetTonnes(Number(e.target.value))}
                  />
                </div>
                <Button style={{ height: "40px" }} onClick={generateBlendData}>
                  Generated Blend Plan
                </Button>
                <Button style={{ height: "40px" }}>
                  Publish to Production
                </Button>
              </div>
            </Col>
          </Row>
          <Row style={{ paddingTop: "16px" }}>
            <Col lg="12">
              <Card style={{ padding: "24px" }}>
                <CardHeader>Blend Plans</CardHeader>

                <Table
                  columns={blendDataTableColumns}
                  data={
                    blendPlans?.map((item) => ({
                      ...item,
                      ...item.materialsUsed,
                    })) || []
                  }
                  paginationPageSize={10}
                  scroll={{ x: "max-content" }}
                />
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default BlendPlans;
