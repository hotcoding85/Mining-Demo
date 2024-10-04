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
  addBench,
  updateBench,
  removeBench,
  upsertGeoFence,
  getGeoFences,
} from "slices/thunk";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { BenchCategories, StatusOptions } from "common/options";
import DeleteButton from "Components/Common/DeleteButton";
import FormModal from "Components/Common/FormModal";
import { isBenchNameUnique } from "../../Helpers/api_benches_helper";
import ImportFileModal from "Components/Common/ImportFileModal";
import { Dropdown, Input, MenuProps, Segmented } from "antd";
import DigBlockLayoutMap from "./DigBlockLayoutMap";
import { round2Two } from "utils/common";
import Table from "Components/Common/Table";
import "./style.scss";
import { FenceSelector } from "selectors";

const DigBlockLayout = (props: any) => {
  document.title = "Dig Block Layout | FMS Live";

  const dispatch: any = useDispatch();
  const [bench, setBench] = useState<any>();

  const [modal, setModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [importStrModal, setImportCsvModal] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [displayType, setDisplayType] = useState<string>("TABLE");

  const [searchTerm, setSearchTerm] = useState<string>("");

  const { fences } = useSelector(FenceSelector);

  const data = fences.map((item) => ({
    ...item?.location,
    ...item,
  }));

  useEffect(() => {
    dispatch(getGeoFences());
  }, [dispatch]);

  const toggle = useCallback(() => {
    setModal(!modal);
  }, [modal]);

  const importStrModalToggle = useCallback(() => {
    setImportCsvModal(!importStrModal);
  }, [importStrModal]);

  const parseBenchData = (doc) => {
    return {
      id: (doc && doc.id) || "",
      name: (doc && doc.name) || "",
      category: (doc && doc.category) || "",
      elevation: (doc && doc.elevation) || "",
      status: (doc && doc.status) || "ACTIVE",
    };
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

  const initialValues = parseBenchData(bench);

  const validationSchema = Yup.object().shape({
    name: isEdit
      ? Yup.string()
      : Yup.string()
          .min(2, "Bench name must be at least 2 characters")
          .required("Please enter bench name")
          .test(
            "unique",
            "Bench with this name already exists",
            async function (value) {
              if (value && value.length >= 2) {
                try {
                  const response = await isBenchNameUnique(value);
                  return response.available; // assuming your API returns { available: true } if username is unique
                } catch (error) {
                  console.error("Error checking name uniqueness:", error);
                  if (error && error["data"] && error["data"]["available"]) {
                    return true;
                  }
                  return false; // treat as not unique on error
                }
              }
              return true;
            }
          ),
    category: Yup.string().required("Please select the category"),
    elevation: Yup.number().required("Please enter the elevation"),
    status: Yup.string(),
  });

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
      id: "category",
      name: "category",
      label: "Category",
      type: "select",
      options: BenchCategories,
    },
    {
      id: "elevation",
      name: "elevation",
      label: "Elevation",
      type: "input",
      editable: true,
      inputType: "number",
    },
    {
      id: "b_status",
      name: "status",
      label: "Status",
      type: "select",
      options: StatusOptions,
    },
  ];

  const handleOnAdd = () => {
    // setting as it is not edit
    setIsEdit(false);
    // clearing the resource state if previous value is set
    setBench("");
    // show dialog
    toggle();
  };

  const handleOnImport = () => {
    // setting as it is not edit
    setIsEdit(false);
    // clearing the resource state if previous value is set
    setBench("");
    // show import csv dialog
    importStrModalToggle();
  };

  const handleOnEdit = useCallback(
    (arg: any) => {
      // reading the row data from table
      const bench = parseBenchData(arg);
      // saving to state
      setBench(bench);
      // setting the dialog to show as edit
      setIsEdit(true);
      // show dialog
      toggle();
    },
    [toggle]
  );

  const handleOnDelete = useCallback(
    (arg: string) => {
      dispatch(removeBench(arg));
      onPaginationPageChange(1);
    },
    [dispatch]
  );

  const columns = useMemo(
    () => [
      {
        title: "Name",
        key: "name",
        dataIndex: "name",
        dataType: "string",
      },
      {
        title: "Block ID",
        key: "blockId",
        dataIndex: "blockId",
        dataType: "string",
        align: "center",
      },
      {
        title: "Source",
        key: "source",
        dataIndex: "source",
        dataType: "string",
        align: "center",
      },
      {
        title: "Category",
        key: "category",
        dataIndex: "category",
        dataType: "string",
        align: "center",
        render: (text) => {
          return (
            <div className="badge badge-soft-primary font-size-11 m-1">
              {text}
            </div>
          );
        },
      },
      {
        title: "Grade",
        key: "grade",
        dataIndex: "grade",
        dataType: "number",
        align: "center",
        render: (text) => round2Two(text),
      },
      {
        title: "Density",
        key: "density",
        dataIndex: "density",
        dataType: "number",
        align: "center",
        render: (text) => round2Two(text),
      },
      {
        title: "Estimated Tonnes",
        key: "tonnes",
        dataIndex: "tonnes",
        dataType: "number",
        align: "center",
        render: (text) => round2Two(text),
      },
      {
        title: "Estimated BCM",
        key: "volume",
        dataIndex: "volume",
        dataType: "number",
        align: "center",
        render: (text) => round2Two(text),
      },
      {
        title: "Status",
        key: "status",
        dataIndex: "status",
        dataType: "string",
        align: "center",
        render: (text) => {
          return (
            <div className="badge badge-soft-primary font-size-11 m-1">
              {text}
            </div>
          );
        },
      },
      {
        title: "Actions",
        dataIndex: "actions",
        key: "actions",
        align: "center",
        dataType: "",
        render: (_, record) => {
          return (
            <div className="d-flex gap-3 justify-content-center">
              <Link
                to="#!"
                className="text-success"
                onClick={(event: any) => {
                  event.preventDefault();
                  handleOnEdit(record);
                }}
              >
                <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
              </Link>
              <DeleteButton
                item={record.name}
                onDelete={() => handleOnDelete(record.id)}
              />
            </div>
          );
        },
      },
    ],
    [handleOnEdit, handleOnDelete]
  );

  const handleOnSubmit = (values, { resetForm }) => {
    const _bench = parseBenchData(values);

    if (isEdit) {
      _bench["id"] = bench.id;
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
  };

  const handleUploadBenches = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);

    await dispatch(upsertGeoFence(formData));

    setIsUploading(false);
    importStrModalToggle();
  };

  const onDisplayTypeChange = (displayInfo) => {
    setDisplayType(displayInfo);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      columns.some((col) =>
        String(item[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, columns]);

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
          <Breadcrumb title="Resources" breadcrumbItem="Dig Block Layout" />
          <Row className="mb-3">
            <Col className="d-flex flex-row-reverse">
              <Segmented
                className="customSegmentLabel customSegmentBackground"
                value={displayType}
                onChange={onDisplayTypeChange}
                options={[
                  { value: "TABLE", label: "TABLE" },
                  { value: "MAP", label: "MAP" },
                ]}
              />
            </Col>
          </Row>
          <Row>
            <Col lg="12">
              {displayType === "TABLE" ? (
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
                          <Dropdown.Button
                            menu={{ items, onClick: onMenuClick }}
                            onClick={handleOnAdd}
                            style={{ width: 'auto' }}
                            overlayClassName="dig-block-dropdown"
                          >
                            <i className="mdi mdi-plus" />New Dig Block
                          </Dropdown.Button>
                        </div>
                      </Col>
                    </Row>
                    <Table
                      columns={columns}
                      data={filteredData || []}
                      paginationPageSize={7}
                    />
                  </CardBody>
                </Card>
              ) : (
                <DigBlockLayoutMap data={data} />
              )}
              <FormModal
                fields={fields}
                modalOpen={modal}
                isEdit={isEdit}
                resource={"Block"}
                initialValues={initialValues}
                schema={validationSchema}
                handleOnSubmit={handleOnSubmit}
                handleOnCancel={toggle}
              />
              <ImportFileModal
                title="Upload Dig Block Data"
                accept=".str"
                isOpen={importStrModal}
                onClose={importStrModalToggle}
                onUpload={handleUploadBenches}
                isUploading={isUploading}
                stepOneTitle="Upload Dig Block"
              />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default DigBlockLayout;
