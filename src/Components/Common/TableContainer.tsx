import React, { Fragment, useEffect, useState } from "react";
import { Row, Table, Button, Col } from "reactstrap";
import { Link } from "react-router-dom";

import {
  Column,
  Table as ReactTable,
  ColumnFiltersState,
  FilterFn,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ExpandedState,
  getExpandedRowModel
} from "@tanstack/react-table";

import { rankItem } from "@tanstack/match-sorter-utils";
import JobListGlobalFilter from "./GlobalSearchFilter";

// Column Filter
const Filter = ({
  column,
}: {
  column: Column<any, unknown>;
  table: ReactTable<any>;
}) => {
  const columnFilterValue = column.getFilterValue();

  return (
    <>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder="Search"
        className="w-36 border shadow rounded"
        list={column.id + "list"}
      />
      <div className="h-1" />
    </>
  );
};

// Global Filter
const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [debounce, onChange, value]);

  return (
    <React.Fragment>
      <Col sm={4}>
        <input
          {...props}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </Col>
    </React.Fragment>
  );
};
interface TableContainerProps {
  columns?: any;
  data?: any;
  total?: number;
  divClassName?: any;
  tableClass?: any;
  theadClass?: any;
  isBordered?: boolean;
  isGlobalFilter?: boolean;
  isPagination?: boolean;
  paginationWrapper?: string;
  SearchPlaceholder?: string;
  pagination?: string;
  handleOnAddClick?: any;
  handleOnImportClick?: any;
  buttonClass?: string;
  buttonName?: string;
  importButtonName?: string;
  isAddButton?: boolean;
  isImportButton?: boolean;
  isCustomPageSize?: boolean;
  isJobListGlobalFilter?: boolean;
  isDraggable?: boolean;
  handleOnDragStart?: any;
  handleOnDragOver?: any;
  handleOnDrop?: any;
  isFooter?: boolean;
}

const TableContainer = ({
  columns,
  data,
  total,
  tableClass = "dt-responsive nowrap w-100 dataTable no-footer dtr-inline",
  theadClass,
  divClassName,
  isBordered,
  isPagination,
  isGlobalFilter,
  paginationWrapper = "dataTables_paginate paging_simple_numbers pagination-rounded",
  SearchPlaceholder = "Search",
  pagination = "pagination",
  buttonClass,
  buttonName,
  importButtonName,
  isAddButton,
  isImportButton,
  isCustomPageSize,
  handleOnAddClick,
  handleOnImportClick,
  isJobListGlobalFilter,
  isDraggable,
  handleOnDragStart,
  handleOnDragOver,
  handleOnDrop,
  isFooter
}: TableContainerProps) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({
      itemRank,
    });
    return itemRank.passed;
  };

  const [expanded, setExpanded] = React.useState<ExpandedState>({})

  const table = useReactTable({
    columns,
    data,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
      expanded

    },
    onExpandedChange: setExpanded,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: isPagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getSubRows: row => row ? row.subRows : [],
    getExpandedRowModel: getExpandedRowModel(),
  });

  const {
    getHeaderGroups,
    getRowModel,
    getCanPreviousPage,
    getCanNextPage,
    getPageOptions,
    setPageIndex,
    nextPage,
    previousPage,
    // setPageSize,
    getState,
    getFooterGroups,
  } = table;

  // useEffect(() => {
  //   Number(customPageSize) && setPageSize(Number(customPageSize));
  // }, [customPageSize, setPageSize]);


  const visiblePageCount = 3;
  // Determine the range of page numbers to display
  const getPageRange = () => {
    let start = Math.max(0, getState().pagination.pageIndex - Math.floor(visiblePageCount / 2));
    let end = Math.min(data ? data.length - 1 : getRowModel().rows.length - 1, start + visiblePageCount - 1);

    if (end - start + 1 < visiblePageCount) {
      start = Math.max(0, end - visiblePageCount + 1);
    }

    return { start, end };
  };
  const { start, end } = getPageRange();


  const handlePageChange = (newPageIndex) => {
    if (newPageIndex >= 0 && ((newPageIndex * table.getState().pagination.pageSize) - 1 < (data ? data.length - 1 : getRowModel().rows.length - 1))) {
      setPageIndex(newPageIndex);
    }
  };

  return (
    <Fragment>
      <Row className="mb-2">
        {isCustomPageSize && (
          <Col sm={2}>
            <select
              className="form-select pageSize mb-2"
              value={table.getState().pagination.pageSize ? table.getState().pagination.pageSize : 10}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </Col>
        )}

        {isGlobalFilter && (
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            className="form-control search-box me-2 mb-2 d-inline-block"
            placeholder={SearchPlaceholder}
          />
        )}
        {isJobListGlobalFilter && (
          <JobListGlobalFilter setGlobalFilter={setGlobalFilter} />
        )}
        <Col sm={8}>
          <div className="d-flex justify-content-end text-sm-end gap-2">
            {isAddButton && (
              <Button
                type="button"
                className={buttonClass}
                onClick={handleOnAddClick}
              >
                <i className="mdi mdi-plus me-1"></i> {buttonName}
              </Button>
            )}
            {isImportButton && (
              <Button
                type="button"
                className={buttonClass}
                onClick={handleOnImportClick}
              >
                <i className="mdi mdi-plus me-1"></i> {importButtonName}
              </Button>
            )}
          </div>
        </Col>
      </Row>

      <div className={divClassName ? divClassName : "table-responsive"}>
        <Table hover className={tableClass} bordered={isBordered}>
          <thead className={theadClass}>
            {getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th draggable={isDraggable}
                      onDragStart={(e) => handleOnDragStart(e, header.index)}
                      onDragOver={(e) => handleOnDragOver(e, header.index)}
                      onDrop={(e) => handleOnDrop(e, header.index)}
                      key={header.id}
                      colSpan={header.colSpan}
                      className={`${header.column.columnDef.enableSorting
                        ? "sorting sorting_desc"
                        : ""
                        }`} style={{verticalAlign:'top'}}
                    >
                      {header.isPlaceholder ? null : (
                        <React.Fragment>
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? "cursor-pointer select-none"
                                : "",
                              onClick: header.column.getToggleSortingHandler(),
                            }} 
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: "",
                              desc: "",
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                          {header.column.getCanFilter() ? (
                            <div>
                              <Filter column={header.column} table={table} />
                            </div>
                          ) : null}
                        </React.Fragment>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          {
            isFooter &&
            <tfoot>
              {getFooterGroups().map(group => (
                <tr {...group}>
                  {group.headers.map((columnData: any) => (
                    <td >
                      {columnData.column.columnDef.footer !== "" ? <span>{columnData.column.columnDef.footer}</span>
                        : <></>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tfoot>
          }
        </Table>
      </div>

      {isPagination && (
        <Row>
          <Col sm={12} md={5}>
            {getState().pagination.pageSize < Number({ total }) ? (
              <div className="dataTables_info">
                Showing {getState().pagination.pageSize} of {total} Results
              </div>
            ) : (
              <div className="dataTables_info">
                Showing {total} of {total} Results
              </div>
            )}
          </Col>
          <Col sm={12} md={7}>
            <div className={paginationWrapper}>
              <ul className={pagination}>
                <li className={`paginate_button ${!getCanPreviousPage() ? 'disabled' : 'enabled'}`}>
                  <Link to="#" className="page-link" onClick={(e) => { e.preventDefault(); if (getCanPreviousPage()) previousPage(); }}>
                    <i className="mdi mdi-chevron-left"></i>
                  </Link>
                </li>
                {Array.from({ length: end - start + 1 }, (_, index) => (
                  <li key={start + index} className={`paginate_button page-item ${getState().pagination.pageIndex === start + index ? 'active' : ''}`} >
                    <Link to="#" className="page-link" onClick={() => handlePageChange(start + index)}>{start + index + 1}</Link>
                  </li>
                ))}
                <li className={`paginate_button ${!getCanNextPage() ? 'disabled' : 'enabled'}`}>
                  <Link to="#" className="page-link" onClick={(e) => { e.preventDefault(); if (getCanNextPage()) nextPage(); }}>
                    <i className="mdi mdi-chevron-right"></i>
                  </Link>
                </li>
              </ul>
            </div>
          </Col>
        </Row>
      )
      }
    </Fragment >
  );
};

export interface TableColumn {
  header: string;
  accessorKey: string | undefined;
  enableColumnFilter: boolean;
  enableSorting: boolean;
}

export default TableContainer;
