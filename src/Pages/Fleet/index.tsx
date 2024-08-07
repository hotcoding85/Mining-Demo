import React, { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { Card, CardBody, Col, Container, Row, } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import TableContainer, { TableColumn, } from "../../Components/Common/TableContainer";
import { AppState } from "store";
import { getAllFleet, addVehicle, updateVehicle, removeVehicle, } from "slices/thunk";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { StatusOptions, VehicleCategories, VehicleMakes, VehicleModels } from "common/options";
import DeleteButton from "Components/Common/DeleteButton";
import FormModal from "Components/Common/FormModal";
import { createSelector } from "reselect";
import { isVehicleNameUnique } from "../../Helpers/api_vehicle_helper";

const Fleet = (props: any) => {
  document.title = "Fleet";

  const dispatch: any = useDispatch();
  const [vehicle, setVehicle] = useState<any>();

  const [modal, setModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const selectProperties = createSelector(
    (state: any) => state.Fleet,
    (fleet) => ({
      data: fleet.data,
      total: fleet.total,
    })
  );

  const { data, total } = useSelector(selectProperties);

  useEffect(() => {
    dispatch(getAllFleet(1, 50)); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  const toggle = useCallback(() => {
    setModal(!modal);
  }, [modal]);

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

  const parseVehicleData = (doc) => {
    return {
      id: (doc && doc.id) || "",
      name: (doc && doc.name) || "",
      serial: (doc && doc.serial) || "",
      make: (doc && doc.make) || "",
      model: (doc && doc.model) || "",
      category: (doc && doc.category) || "",
      capacity: (doc && doc.capacity) || "",
      status: (doc && doc.status) || "ACTIVE"
    }
  }

  const initialValues = parseVehicleData(vehicle);

  const handleOnAdd = () => {
    // setting as it is not edit
    setIsEdit(false);
    // clearing the resource state if previous value is set
    setVehicle("");
    // show dialog
    toggle();
  };

  const handleOnEdit = useCallback(
    (arg: any) => {
      // reading the row data from table
      const bench = parseVehicleData(arg)
      // saving to state
      setVehicle(bench);
      // setting the dialog to show as edit
      setIsEdit(true);
      // show dialog
      toggle();
    },
    [toggle]
  );

  const handleOnDelete = useCallback((arg: string) => {
    dispatch(removeVehicle(arg));
    onPaginationPageChange(1);
  }, [dispatch]);

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
      id: 'serial',
      name: 'serial',
      label: 'Serial',
      type: 'input',
      editable: true,
      inputType: 'text'
    },
    {
      id: 'make',
      name: 'make',
      label: 'Make',
      type: 'select',
      editable: true,
      options: VehicleMakes
    },
    {
      id: 'model',
      name: 'model',
      label: 'Model',
      type: 'select',
      editable: true,
      options: VehicleModels
    },
    {
      id: 'category',
      name: 'category',
      label: 'Category',
      type: 'select',
      editable: true,
      options: VehicleCategories
    },
    {
      id: 'capacity',
      name: 'capacity',
      label: 'Capacity',
      type: 'input',
      editable: true,
      inputType: 'text'
    },
    {
      id: 'b_status',
      name: 'status',
      label: 'Status',
      type: 'select',
      editable: true,
      options: StatusOptions
    }
  ]

  const validationSchema = Yup.object().shape({
    name: isEdit ? Yup.string() : Yup.string()
      .min(2, 'Vehicle name must be at least 2 characters')
      .required("Please enter vehicle name")
      .test('unique', 'vehicle with this name already exists', async function (value) {
        if (value && value.length >= 2) {
          try {
            const response = await isVehicleNameUnique(value);
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
    serial: Yup.string(),
    make: Yup.string(),
    model: Yup.string(),
    category: Yup.string().required("Please select the category"),
    capacity: Yup.number(),
    status: Yup.string(),
  });

  const columns: TableColumn[] = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Serial",
        accessorKey: "serial",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Make",
        accessorKey: "make",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Model",
        accessorKey: "model",
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
        header: "Capacity",
        accessorKey: "capacity",
        enableColumnFilter: false,
        enableSorting: true,
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
                  const vehicleData = cellProps.row.original;
                  handleOnEdit(vehicleData);
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

    const _vehicle = parseVehicleData(values)

    if (isEdit) {
      _vehicle['id'] = vehicle.id
      delete _vehicle.id;
      dispatch(updateVehicle(vehicle.id, _vehicle));
      setIsEdit(false);
    } else {
      delete _vehicle.id
      dispatch(addVehicle(_vehicle));
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
          <Breadcrumb title="Resources" breadcrumbItem="Fleet" />
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
                    buttonName="New Vehicle"
                  />
                </CardBody>
              </Card>
              <FormModal fields={fields}
                modalOpen={modal}
                isEdit={isEdit}
                resource={"Vehicle"}
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

export default Fleet;
