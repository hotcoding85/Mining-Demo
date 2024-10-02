import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, CardBody, Col, Container, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import { getAllTrackers, addTracker, updateTracker, removeTracker, getAllFleet } from 'slices/thunk';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from "yup";
import { Link } from 'react-router-dom';
import QRCodeModal from 'Components/Common/QRCodeModal';
import { v4 as uuidv4 } from "uuid";
import DeleteButton from "Components/Common/DeleteButton";
import FormModal from 'Components/Common/FormModal';
import { StatusOptions } from "common/options";
import { isTrackerNameUnique } from 'Helpers/api_trackers_helper';
import Table from 'Components/Common/Table';
import { debounce } from 'lodash';
import { Input } from 'antd';
import { FleetSelector, TrackerSelector } from 'selectors';

const Trackers = (props: any) => {
  document.title = "Trackers | FMS Live";

  const dispatch: any = useDispatch();
  const [tracker, setTracker] = useState<any>();

  const [modal, setModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const { trackers } = useSelector(TrackerSelector);

  const { fleet } = useSelector(FleetSelector);

  //delete customer
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [qRCodeModal, setQRCodeModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  var vehicles: any = {};
  vehicles = fleet.map(option => {
    return { value: option.name, "label": option.name }
  });

  useEffect(() => {
    dispatch(getAllTrackers(1, 100)); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllFleet()); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  const toggle = useCallback(() => {
    setModal(!modal);
  }, [modal]);

  const handleUserClick = useCallback((arg: any) => {
    const tracker = arg;
    setTracker({
      id: tracker.id,
      vehicle: tracker.vehicle.name,
      name: tracker.name,
      type: tracker.type
    });

    setIsEdit(true);

    toggle();
  }, [toggle]);

  const onClickDelete = (deviceData: any) => {
    setTracker(deviceData);
    setDeleteModal(true);
  };

  const onQRCodeView = (deviceData: any) => {
    setTracker(deviceData);
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
    dispatch(removeTracker(tracker.id));
    onPaginationPageChange(1);
    setDeleteModal(false);
  };

  const parseTrackerData = (doc) => {
    return {
      id: (doc && doc.id) || uuidv4(),
      name: (doc && doc.name) || "",
      vehicle: (doc && doc.vehicle) || "",
      status: (doc && doc.status) || "ACTIVE"
    }
  }

  const initialValues = parseTrackerData(tracker);

  const handleOnAdd = () => {
    // setting as it is not edit
    setIsEdit(false);
    // clearing the resource state if previous value is set
    setTracker("");
    // show dialog
    toggle();
  };

  const handleOnEdit = useCallback(
    (arg: any) => {
      // reading the row data from table
      const tracker = parseTrackerData(arg)
      // saving to state
      setTracker(tracker);
      // setting the dialog to show as edit
      setIsEdit(true);
      // show dialog
      toggle();
    },
    [toggle]
  );

  const handleOnDelete = useCallback((arg: string) => {
    dispatch(removeTracker(arg));
    onPaginationPageChange(1);
  }, [dispatch]);


  const handleOnSubmit = ((values, { resetForm }) => {
    if (isEdit) {
      var selectedVehicle = fleet.filter(item => item.name === values.vehicle);
      var updateDoc: any = {};
      updateDoc.id = tracker.id;
      updateDoc.name = values.name;
      updateDoc.status = values.status;

      if (selectedVehicle && selectedVehicle.length > 0) {
        updateDoc.vehicleId = selectedVehicle[0].id;
        delete updateDoc.vehicle;
      } else {
        delete updateDoc.vehicle;
        delete updateDoc.vehicleId;
        delete updateDoc.type;
      }

      delete updateDoc.id;
      // update tracker
      dispatch(updateTracker(tracker.id, updateDoc));
      setIsEdit(false);
    } else {
      var selectedVehicle = fleet.filter(item => item.name === values.vehicle);
      var newTracker: any = {};
      newTracker.id = tracker.id;
      newTracker.name = values.name;
      newTracker.status = values.status;

      if (selectedVehicle && selectedVehicle.length > 0) {
        newTracker.vehicleId = selectedVehicle[0].id;
        delete newTracker.vehicle;
      } else {
        delete newTracker.vehicle;
        delete newTracker.vehicleId;
        delete newTracker.type;
      }
      // save new tracker
      dispatch(addTracker(newTracker));
    }
    resetForm();
    toggle();
  });

  const fields = [
    {
      id: 'id',
      name: 'id',
      label: 'ID',
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

  const checkTrackerNameUnique = debounce(async (value) => {
    try {
      const response = await isTrackerNameUnique(value);
      return response.available; // assuming your API returns { available: true } if username is unique
    } catch (error) {
      console.error('Error checking name uniqueness:', error);
      if (error && error['data'] && error['data']['available']) {
        return true;
      }
      return false; // treat as not unique on error
    }
  }, 500);

  const validationSchema = Yup.object().shape({
    name: isEdit ? Yup.string() : Yup.string()
      .min(2, 'Tracker name must be at least 2 characters')
      .required("Please enter tracker name")
      .test('unique', 'Tracker with this name already exists', async function (value) {
        if (value && value.length >= 2) {
          return await checkTrackerNameUnique(value);
        }
        return true;
      }),
    vehicle: Yup.string(),
    status: Yup.string()
  });

  const columns = useMemo(
    () => [
      {
        title: "Tracker Name",
        dataIndex: "name",
        key: "name",
        dataType: "string",
      },
      {
        title: "Vehicle",
        dataIndex: "vehicle.name",
        key: "name",
        dataType: "string",
        render: ((text, records) => <span>{records?.vehicle?.name}</span>)
      },
      {
        title: "AppVersion",
        dataIndex: "appVersion",
        key: "appVersion",
        dataType: "string",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        dataType: "string",
      },
      {
        title: "Actions",
        dataIndex: "actions",
        key: "actions",
        dataType: "any",
        render: ((text, records) => {
          let id = records.id;
          let name = records.name;
          return (
            <div className="d-flex gap-3">
              <Link to="#!" className="text-success"
                onClick={(event: any) => {
                  event.preventDefault();
                  const deviceData = records;
                  handleUserClick(deviceData);
                }} >
                <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
              </Link>
              <DeleteButton item={name} onDelete={() => handleOnDelete(id)} />
              <Link to="#!" className="text-view"
                onClick={(event: any) => {
                  event.preventDefault();
                  const deviceData = records;
                  onQRCodeView(deviceData);
                }}  >
                <i className="mdi mdi-qrcode font-size-18" id="qrcode" />
              </Link>
            </div>
          );
        })
      },
    ],
    [handleUserClick]
  );

  const handleUserClicks = () => {
    setIsEdit(false);
    setTracker({ id: uuidv4() });
    // vehicles = fleet.map(option => {
    //   return { value: option.name, "label": option.name }
    // });
    toggle();
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return trackers;
    return trackers?.filter((item) =>
      columns?.some((col) =>
        String(item[col.key])
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [trackers, searchTerm, columns]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Resources" breadcrumbItem="Trackers" />
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
                        <Button
                          type="button"
                          onClick={handleUserClicks}
                        >
                          <i className="mdi mdi-plus me-1"></i> New Tracker
                        </Button>
                      </div>
                    </Col>
                  </Row>
                  <Table
                    columns={columns}
                    data={filteredData || []}
                    paginationPageSize={10}
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

      <QRCodeModal
        show={qRCodeModal}
        data={tracker}
        onCloseClick={() => setQRCodeModal(false)}
      />
    </React.Fragment >
  );
}

export default Trackers;
