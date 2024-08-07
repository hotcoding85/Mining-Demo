import React, { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { Card, CardBody, Col, Container, Row, } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import TableContainer, { TableColumn, } from "../../Components/Common/TableContainer";
import { AppState } from "store";
import { getAllBenches, addBench, updateBench, removeBench, } from "slices/thunk";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { BenchCategories, StatusOptions } from "common/options";
import DeleteButton from "Components/Common/DeleteButton";
import FormModal from "Components/Common/FormModal";
import { createSelector } from "reselect";
import * as url from "../../Helpers/url_helper";
import axios from "axios";

const Benches = (props: any) => {
  document.title = "Benches";

  const dispatch: any = useDispatch();
  const [bench, setBench] = useState<any>();

  const [modal, setModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const selectProperties = createSelector(
    (state: any) => state.Benches,
    (benches) => ({
      data: benches.data,
      total: benches.total,
    })
  );

  const { data, total } = useSelector(selectProperties);

  useEffect(() => {
    dispatch(getAllBenches()); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  const toggle = useCallback(() => {
    setModal(!modal);
  }, [modal]);

  const parseBenchData = (doc) => {
    return {
      id: (doc && doc.id) || "",
      name: (doc && doc.name) || "",
      category: (doc && doc.category) || "",
      elevation: (doc && doc.elevation) || "",
      status: (doc && doc.status) || "ACTIVE"
    }
  }

  var node: any = useRef();
  const onPaginationPageChange = (page: any) => {
    if (
      node &&
      node.current &&
      node.current.props &&
      node.current.props.pagination &&
      node.current.props.pagination.options
    ) {
      node.current.props.pagination.options.onPageChange(page);
    }
  };

  const initialValues = parseBenchData(bench);

  const validationSchema = Yup.object().shape({
    name: isEdit ? Yup.string() : Yup.string()
      .min(2, 'Bench name must be at least 2 characters')
      .required("Please enter bench name")
      .test('unique', 'Bench with this name already exists', async function (value) {
        if (value && value.length >= 2) {
          try {
            const response = await axios.get(`${url.BENCHES}/check-name/${value}`);
            return response.available; // assuming your API returns { available: true } if username is unique
          } catch (error) {
            console.error('Error checking name uniqueness:', error);
            if (error && error['data'] && error['data']['available']) {
              return true;
            }
            return false; // treat as not unique on error
          }
        }
        return true;
      }),
    category: Yup.string().required("Please select the category"),
    elevation: Yup.number().required("Please enter the elevation"),
    status: Yup.string(),
  });

  const fields = [
    {
      id: 'name',
      name: 'name',
      label: 'Name',
      type: 'input',
      editable: true,
      inputType: 'text'
    },
    {
      id: 'category',
      name: 'category',
      label: 'Category',
      type: 'select',
      options: BenchCategories
    },
    {
      id: 'elevation',
      name: 'elevation',
      label: 'Elevation',
      type: 'input',
      editable: true,
      inputType: 'number'
    },
    {
      id: 'b_status',
      name: 'status',
      label: 'Status',
      type: 'select',
      options: StatusOptions
    }
  ]

  const handleOnAdd = () => {
    // setting as it is not edit
    setIsEdit(false);
    // clearing the resource state if previous value is set
    setBench("");
    // show dialog
    toggle();
  };

  const handleOnEdit = useCallback(
    (arg: any) => {
      // reading the row data from table
      const bench = parseBenchData(arg)
      // saving to state
      setBench(bench);
      // setting the dialog to show as edit
      setIsEdit(true);
      // show dialog
      toggle();
    },
    [toggle]
  );

  const handleOnDelete = useCallback((arg: string) => {
    dispatch(removeBench(arg));
    onPaginationPageChange(1);
  }, [dispatch]);

  const columns: TableColumn[] = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Category",
        accessorKey: "category",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div className="badge badge-soft-primary font-size-11 m-1">
              {cellProps.row.original.category}
            </div>
          );
        },
      },
      {
        header: "Elevation",
        accessorKey: "elevation",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Status",
        accessorKey: "status",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div className="badge badge-soft-primary font-size-11 m-1">
              {cellProps.row.original.status}
            </div>
          );
        },
      },
      {
        header: "Actions",
        enableColumnFilter: false,
        accessorKey: "",
        enableSorting: false,
        cell: (cellProps: any) => {
          const name = `${cellProps.row.original.name}`
          const id = cellProps.row.original.id
          return (
            <div className="d-flex gap-3">
              <Link
                to="#!"
                className="text-success"
                onClick={(event: any) => {
                  event.preventDefault();
                  const benchData = cellProps.row.original;
                  handleOnEdit(benchData);
                }}
              >
                <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
              </Link>
              <DeleteButton item={name} onDelete={() => handleOnDelete(id)} />
            </div>
          );
        },
      },
    ],
    [handleOnEdit, handleOnDelete]
  );

  const handleOnSubmit = ((values, { resetForm }) => {

    const _bench = parseBenchData(values)

    if (isEdit) {
      _bench['id'] = bench.id
      delete _bench.id;
      dispatch(updateBench(bench.id, _bench));
      setIsEdit(false);
    } else {
      delete _bench.id;
      dispatch(addBench(_bench));
    }
    // reset form after saving
    resetForm();
    // toggle the dialog
    toggle();
  })

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Resources" breadcrumbItem="Benches" />
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={data || []}
                    total={total || 0}
                    isGlobalFilter={true}
                    handleOnAddClick={handleOnAdd}
                    isPagination={true}
                    isAddButton={true}
                    buttonName="New Bench"
                  />
                </CardBody>
              </Card>
              <FormModal fields={fields}
                modalOpen={modal}
                isEdit={isEdit}
                resource={"Bench"}
                initialValues={initialValues}
                schema={validationSchema}
                handleOnSubmit={handleOnSubmit}
                handleOnCancel={toggle} />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Benches;
