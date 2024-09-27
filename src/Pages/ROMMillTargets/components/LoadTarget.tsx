import React, { useState } from "react";
import { Card, CardBody } from "reactstrap";
import { Input, Select } from "antd";
import { SearchDropdown } from "Components/Common/Dropdown";
import { SearchOutlined } from "@ant-design/icons";
import Table from "Components/Common/Table";

const LoadTarget = ({ tableColumns, data, ...props }) => {
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const filters = {
    model: [
      {
        label: "HD1500",
        value: "HD1500",
      },
      {
        label: "HD785",
        value: "HD785",
      },
    ],
    fleet: [
      {
        label: "Fleet1",
        value: "TD001",
      },
      {
        label: "Fleet2",
        value: "TD002",
      },
      {
        label: "Fleet3",
        value: "TD003",
      },
    ],
  };

  return (
    <Card className="loader-target rommil-loader">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center">
          <div className="loader-target-title">ROM Loader Target</div>
          <div className="d-flex justify-content-end align-items-center gap-3 rommil-targets">
            <SearchDropdown itemsGroup={filters} />
            <Select
              className="basic-single"
              id="Show/Hide Columns"
              showSearch
              placeholder="Show/Hide Columns"
              style={{ width: "100%" }}
            />
            <Input
              prefix={<SearchOutlined />}
              value={globalFilter}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="trucking-summary-search"
              placeholder="Quick Search"
            />
          </div>
        </div>

        <div className="mt-3">
          <Table
            columns={tableColumns}
            data={data || []}
            scroll={{ x: "max-content" }}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export default LoadTarget;
