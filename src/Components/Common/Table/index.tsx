import React, { useMemo, useState } from "react";
import { ConfigProvider, Table as AntTable } from "antd";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import "./style.scss";
import { LayoutSelector } from "selectors";

interface TableProps {
  columns: any[];
  data: any[];
  paginationPageSize?: number;
  scroll?: any;
  summary?: any;
}

const TableDarkTheme = {
  colorText: "#fff",
  headerBorderRadius: 0,
  headerColor: "#9CA3B1",
  borderColor: "#283655",
  headerSplitColor: "#283655",
  colorBgContainer: "#283655",
  headerBg: "#283655",
  headerSortHoverBg: "none",
  stickyScrollBarBg: "#535e77",
};

const TableLightTheme = {
  colorText: "#2A2A2A",
  headerBorderRadius: 0,
  headerColor: "#828282",
  borderColor: "#fff",
  headerSplitColor: "#fff",
  colorBgContainer: "#fff",
  headerBg: "#fff",
  headerSortHoverBg: "none",
  stickyScrollBarBg: "#e0e0e0",
};

const getSorter = (key: string, type?: string) => {
  switch (type) {
    case "string":
      return (a: any, b: any) => {
        const valueA = a[key] || "";
        const valueB = b[key] || "";
        return valueA.localeCompare(valueB);
      };

    case "number":
      return (a: any, b: any) => a[key] - b[key];
    case "date":
      return (a: any, b: any) => dayjs(a[key]).unix() - dayjs(b[key]).unix();
    default:
      return undefined;
  }
};

const Table: React.FC<TableProps> = ({
  columns,
  data,
  paginationPageSize = 10,
  scroll,
  summary,
}) => {
  const [recordsPerPage, setRecordsPerPage] = useState(paginationPageSize);

  const { layoutModeType } = useSelector(LayoutSelector);

  const theme = useMemo(() => {
    return layoutModeType === "dark" ? TableDarkTheme : TableLightTheme;
  }, [layoutModeType]);

  const enhancedColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      sorter:
        col.sorter ||
        (col.dataType ? getSorter(col.key, col.dataType) : undefined),
      showSorterTooltip: false,
    }));
  }, [columns]);

  return (
    <ConfigProvider theme={{ components: { Table: theme } }}>
      <AntTable
        defaultExpandAllRows={true}
        className="common-table-component"
        rowClassName={"common-table-row"}
        columns={enhancedColumns}
        dataSource={data}
        pagination={{
          pageSize: recordsPerPage,
          showSizeChanger: true,
          onShowSizeChange: (current, size) => {
            setRecordsPerPage(size);
          },
        }}
        rowKey={(record) => record.key || record.id}
        scroll={scroll}
        summary={summary}
      />
    </ConfigProvider>
  );
};

export default Table;
