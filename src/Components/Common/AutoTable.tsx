import React from "react";
import { Table } from "antd";

const AutoTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No data available</p>;
  }

  const columns = Object.keys(data[0]).map((key) => ({
    title: key.charAt(0).toUpperCase() + key.slice(1),
    dataIndex: key,
    key: key,
    render: (text) => <div>{JSON.stringify(text)}</div>,
  }));

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={{ pageSize: 10 }}
      scroll={{ x: true }}
      rowKey={(record) => record.id || record.key || JSON.stringify(record)}
    />
  );
};

export default AutoTable;
