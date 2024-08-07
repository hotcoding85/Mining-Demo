import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, CardBody, Col, Container, Form, FormFeedback, Input, Label, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import TableContainer, { TableColumn } from '../../Components/Common/TableContainer';
import { AppState } from 'store';
import { getAllDevices, addDevice, updateDevice, removeDevice, getAllFleet } from 'slices/thunk';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from "yup";
import { useFormik } from "formik";
import { Link } from 'react-router-dom';
import DeleteModal from 'Components/Common/DeleteModal';
import QRCodeModal from 'Components/Common/QRCodeModal';
import { v4 as uuidv4 } from "uuid";
import DeleteButton from "Components/Common/DeleteButton";
import { createSelector } from 'reselect';
import FormModal from 'Components/Common/FormModal';
import { StatusOptions } from "common/options";
import * as url from "../../Helpers/url_helper";
import axios from 'axios';

const Device = (props: any) => {
  document.title = "Trackers";

  const dispatch: any = useDispatch();
  const [device, setDevice] = useState<any>();

  const [modal, setModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const devicesProperties = createSelector(
    (state: any) => state.Devices,
    (devices) => ({
      data: devices.data,
      total: devices.total,
    })
  );

  const fleetProperties = createSelector(
    (state: any) => state.Fleet,
    (fleet) => ({
      fleet: fleet.data,
    })
  );

  const { data, total } = useSelector(devicesProperties);

  const { fleet } = useSelector(fleetProperties);

  //delete customer
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [qRCodeModal, setQRCodeModal] = useState<boolean>(false);

  var vehicles: any = {};
  vehicles = fleet.map(option => {
    return { value: option.name, "label": option.name }
  });

  var platforms: any = [{ value: 'android', "label": 'Android' }, { value: 'ios', "label": 'iOS' }];

  useEffect(() => {
    dispatch(getAllDevices()); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllFleet()); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  const toggle = useCallback(() => {
    setModal(!modal);
  }, [modal]);

  const handleUserClick = useCallback((arg: any) => {
    const device = arg;
    setDevice({
      id: device.id,
      vehicle: device.vehicle,
      name: device.name,
      identifier: device.identifier,
      type: device.type
    });
    // vehicles = fleet.map(option => {
    //   return { value: option.name, "label": option.name }
    // });
    setIsEdit(true);

    toggle();
  }, [toggle]);

  const onClickDelete = (deviceData: any) => {
    setDevice(deviceData);
    setDeleteModal(true);
  };

  const onQRCodeView = (deviceData: any) => {
    setDevice(deviceData);
    setQRCodeModal(true);
  };

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

  const handleDeleteUser = () => {
    dispatch(removeDevice(device.id));
    onPaginationPageChange(1);
    setDeleteModal(false);
  };

  const parseDeviceData = (doc) => {
    return {
      identifier: (doc && doc.identifier) || uuidv4(),
      name: (doc && doc.name) || "",
      vehicle: (doc && doc.vehicle) || "",
      status: (doc && doc.status) || "ACTIVE"
    }
  }

  const initialValues = parseDeviceData(device);

  const handleOnAdd = () => {
    // setting as it is not edit
    setIsEdit(false);
    // clearing the resource state if previous value is set
    setDevice("");
    // show dialog
    toggle();
  };

  const handleOnEdit = useCallback(
    (arg: any) => {
      // reading the row data from table
      const device = parseDeviceData(arg)
      // saving to state
      setDevice(device);
      // setting the dialog to show as edit
      setIsEdit(true);
      // show dialog
      toggle();
    },
    [toggle]
  );

  const handleOnDelete = useCallback((arg: string) => {
    dispatch(removeDevice(arg));
    onPaginationPageChange(1);
  }, [dispatch]);


  const handleOnSubmit = ((values, { resetForm }) => {
    if (isEdit) {
      var selectedVehicle = fleet.filter(item => item.name === values.vehicle);
      var updateDoc: any = {};
      updateDoc.id = device.id;
      updateDoc.identifier = values.identifier
      updateDoc.name = values.name;
      updateDoc.platform = 'ANDROID';
      updateDoc.status = values.status;

      if (selectedVehicle && selectedVehicle.length > 0) {
        updateDoc.vehicleId = selectedVehicle[0].id;
        delete updateDoc.vehicle;
        updateDoc.type = "device_equipment";
      } else {
        delete updateDoc.vehicle;
        delete updateDoc.vehicleId;
        delete updateDoc.type;
      }

      delete updateDoc.id;
      // update device
      dispatch(updateDevice(device.id, updateDoc));
      setIsEdit(false);
    } else {
      var selectedVehicle = fleet.filter(item => item.name === values.vehicle);
      var newDevice: any = {};
      newDevice.id = device.id;
      newDevice.identifier = values.identifier;
      newDevice.name = values.name;
      newDevice.platform = 'ANDROID';
      newDevice.status = values.status;

      if (selectedVehicle && selectedVehicle.length > 0) {
        newDevice.vehicleId = selectedVehicle[0].id;
        newDevice.type = "device_equipment";
        delete newDevice.vehicle;
      } else {
        delete newDevice.vehicle;
        delete newDevice.vehicleId;
        delete newDevice.type;
      }
      delete newDevice.id;
      // save new device
      dispatch(addDevice(newDevice));
    }
    resetForm();
    toggle();
  });

  const fields = [
    {
      id: 'identifier',
      name: 'identifier',
      label: 'Tracker ID',
      type: 'input',
      editable: false,
      inputType: 'text'
    },
    {
      id: 'name',
      name: 'name',
      label: 'Tracker Name',
      type: 'input',
      editable: true,
      inputType: 'text'
    },
    {
      id: 'vehicle',
      name: 'vehicle',
      label: 'Vehicle',
      type: 'select',
      options: vehicles
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
    identifier: Yup.string().required("Please enter device identifier name"),
    name: isEdit ? Yup.string() : Yup.string()
      .min(2, 'Tracker name must be at least 2 characters')
      .required("Please enter tracker name")
      .test('unique', 'Tracker with this name already exists', async function (value) {
        if (value && value.length >= 2) {
          try {
            const response = await axios.get(`${url.DEVICES}/check-name/${value}`);
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
    vehicle: Yup.string(),
    status: Yup.string()
  });

  const columns: TableColumn[] = useMemo(
    () => [
      {
        header: 'Tracker Name',
        accessorKey: 'name',
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: 'Tracker ID',
        accessorKey: 'identifier',
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: 'Vehicle',
        accessorKey: 'vehicle.name',
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Actions",
        enableColumnFilter: false,
        accessorKey: '',
        enableSorting: false,
        cell: (cellProps: any) => {
          const name = `${cellProps.row.original.name}`
          const id = cellProps.row.original.id
          return (
            <div className="d-flex gap-3">
              <Link to="#!" className="text-success"
                onClick={(event: any) => {
                  event.preventDefault();
                  const deviceData = cellProps.row.original;
                  handleUserClick(deviceData);
                }} >
                <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
              </Link>
              <DeleteButton item={name} onDelete={() => handleOnDelete(id)} />
              <Link to="#!" className="text-view"
                onClick={(event: any) => {
                  event.preventDefault();
                  const deviceData = cellProps.row.original;
                  onQRCodeView(deviceData);
                }}  >
                <i className="mdi mdi-qrcode font-size-18" id="qrcode" />
              </Link>
            </div>
          );
        },
      }
    ],
    [handleUserClick]
  );

  const handleUserClicks = () => {
    setIsEdit(false);
    setDevice({ identifier: uuidv4() });
    // vehicles = fleet.map(option => {
    //   return { value: option.name, "label": option.name }
    // });
    toggle();
  };

  return (
    <React.Fragment>
      {/* <DeleteModal
        show={deleteModal}
        onDeleteClick={handleDeleteUser}
        onCloseClick={() => setDeleteModal(false)}
      /> */}
      <DeleteButton item={device ? device.name : ''} onDelete={() => handleDeleteUser()} />
      <QRCodeModal
        show={qRCodeModal}
        data={device}
        onCloseClick={() => setQRCodeModal(false)}
      />
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Trackers" breadcrumbItem="Resources" />
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={data || []}
                    total={total || 0}
                    isGlobalFilter={true}
                    handleOnAddClick={handleUserClicks}
                    isPagination={true}
                    isAddButton={true}
                    buttonName="New Tracker"
                  />
                </CardBody>
              </Card>
              <FormModal fields={fields}
                modalOpen={modal}
                isEdit={isEdit}
                resource={"Tracker"}
                initialValues={initialValues}
                schema={validationSchema}
                handleOnSubmit={handleOnSubmit}
                handleOnCancel={toggle} />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment >
  );
}

export default Device;
