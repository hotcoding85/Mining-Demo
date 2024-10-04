import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import {
  getAllFleet,
  addVehicle,
  updateVehicle,
  removeVehicle,
  upsertVehicles,
} from "slices/thunk";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import {
  StateOptions,
  StatusOptions,
  VehicleCategories,
  VehicleMakes,
  VehicleModels,
} from "common/options";
import DeleteButton from "Components/Common/DeleteButton";
import FormModal from "Components/Common/FormModal";
import { isVehicleNameUnique } from "../../Helpers/api_vehicle_helper";
import { Dropdown, Input, MenuProps, Segmented, Space, Tag } from "antd";
import ImportFileModal from "Components/Common/ImportFileModal";
import Table from "Components/Common/Table";
import { debounce } from "lodash";
import "./style.scss";
import { FleetSelector } from "selectors";

const Fleet = (props: any) => {
  document.title = "Fleet | FMS Live";

  const dispatch: any = useDispatch();
  const [vehicle, setVehicle] = useState<any>();

  const [modal, setModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [importCsvModal, setImportFileModal] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<string>('All Equipment');

  const importCsvModalToggle = useCallback(() => {
    setImportFileModal(!importCsvModal);
  }, [importCsvModal]);

  const { fleet } = useSelector(FleetSelector);

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
      serial: (doc && doc.serial) || undefined,
      make: (doc && doc.make) || undefined,
      model: (doc && doc.model) || undefined,
      category: (doc && doc.category) || undefined,
      capacity: (doc && doc.capacity) || undefined,
      state: (doc && doc.state) || "STANDBY",
      status: (doc && doc.status) || "ACTIVE",
    };
  };

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
      const bench = parseVehicleData(arg);
      // saving to state
      setVehicle(bench);
      // setting the dialog to show as edit
      setIsEdit(true);
      // show dialog
      toggle();
    },
    [toggle]
  );

  const handleOnDelete = useCallback(
    (arg: string) => {
      dispatch(removeVehicle(arg));
      onPaginationPageChange(1);
    },
    [dispatch]
  );

  const fields = [
    {
      id: "name",
      name: "name",
      label: "Name",
      type: "input",
      editable: true,
      inputType: "text",
    },
    {
      id: "serial",
      name: "serial",
      label: "Serial",
      type: "input",
      editable: true,
      inputType: "text",
    },
    {
      id: "make",
      name: "make",
      label: "Make",
      type: "select",
      editable: true,
      options: VehicleMakes,
    },
    {
      id: "model",
      name: "model",
      label: "Model",
      type: "select",
      editable: true,
      options: VehicleModels,
    },
    {
      id: "category",
      name: "category",
      label: "Category",
      type: "select",
      editable: true,
      options: VehicleCategories,
    },
    {
      id: "capacity",
      name: "capacity",
      label: "Capacity",
      type: "input",
      editable: true,
      inputType: "text",
    },
    {
      id: "state",
      name: "state",
      label: "State",
      type: "select",
      editable: true,
      options: StateOptions,
    },
    {
      id: "b_status",
      name: "status",
      label: "Status",
      type: "select",
      editable: true,
      options: StatusOptions,
    },
  ];


  const checkMaterialNameUnique = debounce(async (value) => {
    try {
      const response = await isVehicleNameUnique(value);
      return response.available; // assuming your API returns { available: true } if username is unique
    } catch (error) {
      console.error("Error checking name uniqueness:", error);
      if (error && error["data"] && error["data"]["available"]) {
        return true;
      }
      return false; // treat as not unique on error
    }
  }, 500);


  const validationSchema = Yup.object().shape({
    name: isEdit
      ? Yup.string()
      : Yup.string()
          .min(2, "Vehicle name must be at least 2 characters")
          .required("Please enter vehicle name")
          .test(
            "unique",
            "vehicle with this name already exists",
            async function (value) {
              if (value && value.length >= 2) {
               return await checkMaterialNameUnique(value);
              }
              return true;
            }
          ),
    serial: Yup.string(),
    make: Yup.string(),
    model: Yup.string(),
    category: Yup.string().required("Please select the category"),
    capacity: Yup.number(),
    state: Yup.string(),
    status: Yup.string(),
  });

  const getStateColor = (state) => {
    switch (state) {
      case "ACTIVE":
        return "#009D10";
      case "STANDBY":
        return "#F7B31A";
      case "DELAY":
        return "#9143DE";
      case "DOWN":
        return "#ED3A0F";
      default:
        return "#F7B31A";
    }
  };

  const getVehicleCategoryColor = (category) => {
    switch (category) {
      case "DUMP_TRUCK":
        return "orange";
      case "EXCAVATOR":
        return "green";
      case "LOADER":
        return "cyan";
      case "DRILLER":
        return "blue";
      default:
        return "gold";
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        dataType: "string",
      },
      {
        title: "Serial",
        dataIndex: "serial",
        key: "serial",
        dataType: "string",
      },
      {
        title: "Make",
        dataIndex: "make",
        key: "make",
        dataType: "string",
      },
      {
        title: "Model",
        dataIndex: "model",
        key: "model",
        dataType: "string",
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        dataType: "string",
        render: ((text, records) => {
          let category = text;
          return (<Tag color={getVehicleCategoryColor(category)}>
            {category.replace("_", " ")}
          </Tag>)
        })
      },
      {
        title: "Capacity",
        dataIndex: "capacity",
        key: "capacity",
        dataType: "number",
      },
      {
        title: "State",
        dataIndex: "state",
        key: "state",
        dataType: "string",
        render: ((text, records) => {
          return <Tag color={getStateColor(text)}>{text}</Tag>;
        })
      },
      {
        title: "Action",
        dataIndex: "action",
        key: "action",
        dataType: "any",
        render: ((text, records) => {
          const name = `${records.name}`;
          const id = records.id;
          return (
            <div className="d-flex gap-3">
              <Link
                to="#!"
                className="text-success"
                onClick={(event: any) => {
                  event.preventDefault();
                  const vehicleData = records;
                  handleOnEdit(vehicleData);
                }}
              >
                <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
              </Link>
              <DeleteButton item={name} onDelete={() => handleOnDelete(id)} />
            </div>
          );
        })
      },
    ],
    [handleOnEdit, handleOnDelete]
  );

  const handleOnSubmit = (values, { resetForm }) => {
    const _vehicle = parseVehicleData(values);

    if (isEdit) {
      _vehicle["id"] = vehicle.id;
      delete _vehicle.id;
      dispatch(updateVehicle(vehicle.id, _vehicle));
      setIsEdit(false);
    } else {
      delete _vehicle.id;
      dispatch(addVehicle(_vehicle));
    }
    // reset form after saving
    resetForm();
    // toggle the dialog
    toggle();
  };

  const handleOnImport = () => {
    // setting as it is not edit
    setIsEdit(false);
    // clearing the resource state if previous value is set
    setVehicle("");
    // show import csv dialog
    importCsvModalToggle();
  };

  const handleUploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    await dispatch(upsertVehicles(formData));
    setIsUploading(false);
    importCsvModalToggle();
  };

  const filteredData = useMemo(() => {
    let filtered = fleet;
    if (filter !== 'All Equipment') {
      filtered = filtered.filter((item) => item.category === filter);
    }
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        columns.some((col) =>
          String(item[col.key])
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }
    return filtered;
  }, [fleet, searchTerm, filter, columns]);

  const onMenuClick: MenuProps['onClick'] = (e) => {
    console.log('click');
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: <span>Import from CSV</span>,
      onClick: handleOnImport,
    },
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Resources" breadcrumbItem="Fleet" />
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <Row>
                    <Col sm={4}>
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginBottom: 16 }}
                        allowClear
                      />
                    </Col>
                    <Col sm={8}>
                      <div className="d-flex justify-content-end text-sm-end gap-2">
                        <Space>
                          <Segmented className="customSegmentLabel customSegmentBackground" value={filter} onChange={(e) => setFilter(e)} options={['All Equipment', { label: 'Excavators', value: 'EXCAVATOR' }, { label: 'Trucks', value: 'DUMP_TRUCK' }, { label: 'Loaders', value: 'LOADER' }, { label: 'Drillers', value: 'DRILLER' }, { label: 'Dozers', value: 'DOZER' }]} />
                        </Space>
                        <Dropdown.Button
                          menu={{ items, onClick: onMenuClick }}
                          onClick={handleOnAdd}
                          style={{ width: 'auto' }}
                          overlayClassName="vehicle-dropdown"
                        >
                          <i className="mdi mdi-plus" />New Vehicle
                        </Dropdown.Button>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col >
                      <Table
                        columns={columns}
                        data={filteredData || []}
                        paginationPageSize={10}
                      />
                    </Col>
                  </Row>
                </CardBody>
              </Card>
              <FormModal
                fields={fields}
                modalOpen={modal}
                isEdit={isEdit}
                resource={"Vehicle"}
                initialValues={initialValues}
                schema={validationSchema}
                handleOnSubmit={handleOnSubmit}
                handleOnCancel={toggle}
              />
              <ImportFileModal
                title="Upload Vehicles"
                isOpen={importCsvModal}
                onClose={importCsvModalToggle}
                onUpload={handleUploadFile}
                isUploading={isUploading}
              />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Fleet;
