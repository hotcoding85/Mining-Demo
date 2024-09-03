import React from "react";
import { Table } from "antd";
import { exportToJson } from "utils/exportToJson";
import { Button } from "reactstrap";

interface AutoTableProps {
  title: string;
  data: any[];
  onSave?: () => void;
}

const AutoTable: React.FC<AutoTableProps> = ({ data, title, onSave }) => {
  if (!data || data.length === 0) {
    return <p>No data available</p>;
  }

  const columns = Object.keys(data[0]).map((key) => ({
    title: key.charAt(0).toUpperCase() + key.slice(1),
    dataIndex: key,
    key: key,
    render: (text) => <div>{JSON.stringify(text)}</div>,
  }));

  const onExport = () => exportToJson(data, title);

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h4>{title}</h4>
        <div className="d-flex justify-content-end align-items-center gap-2">
          <Button onClick={onExport}>Export</Button>
          {onSave && <Button onClick={onSave}>Save</Button>}
        </div>
      </div>
      <div className="mt-2">
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
          rowKey={(record) => record.id || record.key || JSON.stringify(record)}
        />
      </div>
    </div>
  );
};

export default AutoTable;
