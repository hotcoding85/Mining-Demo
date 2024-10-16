import React, { Fragment, useEffect, useState } from "react";
import { Row, Table, Button, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
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
import JobListGlobalFilter from "../../../Components/Common/GlobalSearchFilter";
import { SearchDropdown } from "../../../Components/Common/Dropdown";
import { UploadOutlined } from "@ant-design/icons";

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
      <Col sm={5} className="position-relative">
        <input
          {...props}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.9167 9.66667H10.2583L10.025 9.44167C10.8417 8.49167 11.3333 7.25833 11.3333 5.91667C11.3333 2.925 8.90833 0.5 5.91667 0.5C2.925 0.5 0.5 2.925 0.5 5.91667C0.5 8.90833 2.925 11.3333 5.91667 11.3333C7.25833 11.3333 8.49167 10.8417 9.44167 10.025L9.66667 10.2583V10.9167L13.8333 15.075L15.075 13.8333L10.9167 9.66667ZM5.91667 9.66667C3.84167 9.66667 2.16667 7.99167 2.16667 5.91667C2.16667 3.84167 3.84167 2.16667 5.91667 2.16667C7.99167 2.16667 9.66667 3.84167 9.66667 5.91667C9.66667 7.99167 7.99167 9.66667 5.91667 9.66667Z" fill="#BCC1CA"/>
        </svg>

      </Col>
    </React.Fragment>
  );
};
interface HierarchycalTableProps {
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
}

const HierarchycalTable = ({
  columns,
  data,
  total,
  tableClass = "dt-responsive nowrap w-100 dataTable no-footer dtr-inline trucking-trip-summary",
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
  handleOnDrop
}: HierarchycalTableProps) => {
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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen((prevState) => !prevState);
  
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
    getFooterGroups
  } = table;

  // useEffect(() => {
  //   Number(customPageSize) && setPageSize(Number(customPageSize));
  // }, [customPageSize, setPageSize]);


  const visiblePageCount = 10;
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
    <Fragment>
      <Row className="px-3 py-3 mx-0 mb-4 align-items-center report-head">
        {isCustomPageSize && (
          <Col sm={2} className="pl-0">
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

        {isJobListGlobalFilter && (
          <JobListGlobalFilter setGlobalFilter={setGlobalFilter} />
        )}
        {
          <Col sm={6} className="ps-0">

            <h3 className="report-heading mb-0" style={{fontFamily: "Montserrat", fontWeight: 'bold', fontSize:' large'}}>
                Trip Summary
            </h3>
          </Col>
        }
        {
          <Col sm={6} className="pe-0">
            <div className="d-flex align-items-center gap-3 justify-content-end">
              <SearchDropdown
                itemsGroup={filters}
                disableTitle={false}
                disableDivider={false}
              />

              <div className="export-csv">
                <Button color="primary">
                  Export CSV
                  <UploadOutlined />
                </Button>
              </div>

              {/* {(
                <DebouncedInput
                  value={globalFilter ?? ""}
                  onChange={(value) => setGlobalFilter(String(value))}
                  className="form-control search-box d-inline-block"
                  placeholder={SearchPlaceholder}
                />
              )} */}

                <Dropdown isOpen={dropdownOpen} toggle={toggle}>
                    <DropdownToggle color="primary" caret size="md">
                        Show/Hide Columns
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem>Day</DropdownItem>
                        <DropdownItem>Night</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
          </Col>
        }
      </Row>

      <div className={ "table-responsive"}>
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
                        }`}
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
              let _className = ''
              if (row.subRows.length > 0) {
                _className = 'parent-row'
              }
              return (
                <tr key={row.id} className={_className} id={'parent'}>
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
        </Table>
      </div>

      {isPagination && (
        <Row>
       
          <Col sm={12} md={12} className="text-end">
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

export interface HierarchycalTableColumn {
  header: string;
  accessorKey: string | undefined;
  enableColumnFilter: boolean;
  enableSorting: boolean;
}

export default HierarchycalTable;
