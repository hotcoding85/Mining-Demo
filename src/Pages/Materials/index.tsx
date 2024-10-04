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
  getAllMaterials,
  addMaterial,
  updateMaterial,
  removeMaterial,
  upsertMaterials,
} from "slices/thunk";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { MaterialCategories, StatusOptions } from "common/options";
import DeleteButton from "Components/Common/DeleteButton";
import FormModal from "Components/Common/FormModal";
import { createSelector } from "reselect";
import { isMaterialNameUnique } from "../../Helpers/api_materials_helper";
import { round2Two } from "utils/common";
import ImportFileModal from "Components/Common/ImportFileModal";
import Table from "Components/Common/Table";
import { Dropdown, Input, MenuProps } from "antd";
import { debounce } from "lodash";
import './style.scss';
import { MaterialSelector } from "selectors";

const Materials = (props: any) => {
  document.title = "Materials | FMS Live";

  const dispatch: any = useDispatch();
  const [material, setMaterial] = useState<any>();

  const [modal, setModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");

  const [importCsvModal, setImportFileModal] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const importCsvModalToggle = useCallback(() => {
    setImportFileModal(!importCsvModal);
  }, [importCsvModal]);

  const { materials } = useSelector(MaterialSelector);

  useEffect(() => {
    dispatch(getAllMaterials(1, 100)); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  const toggle = useCallback(() => {
    setModal(!modal);
  }, [modal]);

  const handleOnEdit = useCallback(
    (arg: any) => {
      // reading the row data from table
      const bench = parseMaterialData(arg);
      // saving to state
      setMaterial(bench);
      // setting the dialog to show as edit
      setIsEdit(true);
      // show dialog
      toggle();
    },
    [toggle]
  );

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

  const parseMaterialData = (doc) => {
    return {
      id: (doc && doc.id) || undefined,
      name: (doc && doc.name) || "",
      category: (doc && doc.category) || "",
      color: (doc && doc.color) || undefined,
      density: (doc && doc.density) || undefined,
      grade: (doc && doc.grade) || undefined,
      tonnes: (doc && doc.tonnes) || undefined,
      status: (doc && doc.status) || "ACTIVE",
    };
  };

  const initialValues = parseMaterialData(material);

  const handleOnDelete = useCallback(
    (arg: string) => {
      dispatch(removeMaterial(arg));
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
      id: "category",
      name: "category",
      label: "Category",
      type: "select",
      options: MaterialCategories,
    },
    {
      id: "color",
      name: "color",
      label: "Color",
      type: "input",
      editable: true,
      inputType: "color",
    },
    {
      id: "density",
      name: "density",
      label: "Density",
      type: "input",
      editable: true,
      inputType: "number",
    },
    {
      id: "grade",
      name: "grade",
      label: "Grade",
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

  const checkMaterialNameUnique = debounce(async (value) => {
    try {
      const response = await isMaterialNameUnique(value);
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
          .min(2, "Material name must be at least 2 characters")
          .required("Please enter material name")
          .test(
            "unique",
            "Material with this name already exists",
            async function (value) {
              if (value && value.length >= 2) {
                return await checkMaterialNameUnique(value)
              }
              return true;
            }
          ),
    category: Yup.string().required("Please select the category"),
    color: Yup.string(),
    status: Yup.string(),
    density: Yup.number(),
    grade: Yup.number(),
  });

  const columns = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        dataType: "string",
        align: "center",
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        dataType: "string",
        align: "center",
      },
      {
        title: "Grade",
        dataIndex: "grade",
        key: "grade",
        dataType: "number",
        align: "center",
        render: (_, record) => round2Two(record.grade),
      },
      {
        title: "Density",
        dataIndex: "density",
        key: "density",
        dataType: "number",
        align: "center",
        render: (_, record) => round2Two(record.density),
      },
      {
        title: "Color",
        dataIndex: "color",
        key: "color",
        dataType: "",
        align: "center",
        render: (_, record) => {
          return (
            <div
              style={{
                height: "20px",
                backgroundColor: record.color,
              }}
            ></div>
          );
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        dataType: "string",
        align: "center",
        render: (_, record) => {
          return (
            <div className="badge badge-soft-primary font-size-11">
              {record.status}
            </div>
          );
        },
      },
      {
        title: "Actions",
        key: "actions",
        dataType: "",
        align: "center",
        render: (_, record) => {
          return (
            <div className="d-flex gap-3 justify-content-center">
              <a
                href="#!"
                className="text-success"
                onClick={(event: any) => {
                  event.preventDefault();
                  handleOnEdit(record);
                }}
              >
                <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
              </a>
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
    const _material = parseMaterialData(values);

    if (isEdit) {
      _material["id"] = material.id;
      delete _material.id;
      dispatch(updateMaterial(material.id, _material));
      setIsEdit(false);
    } else {
      delete _material.id;
      dispatch(addMaterial(_material));
    }
    // reset form after saving
    resetForm();
    // toggle the dialog
    toggle();
  };

  const handleOnAdd = () => {
    // setting as it is not edit
    setIsEdit(false);
    // clearing the resource state if previous value is set
    setMaterial("");
    // show dialog
    toggle();
  };

  const handleOnImport = () => {
    // setting as it is not edit
    setIsEdit(false);
    // clearing the resource state if previous value is set
    setMaterial("");
    // show import csv dialog
    importCsvModalToggle();
  };

  const handleUploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    await dispatch(upsertMaterials(formData));
    setIsUploading(false);
    importCsvModalToggle();
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return materials;
    return materials.filter((item) =>
      columns.some((col) =>
        String(item[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [materials, searchTerm, columns]);

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
          <Breadcrumb title="Resources" breadcrumbItem="Materials" />
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
                        <Dropdown.Button
                          menu={{ items, onClick: onMenuClick, }}
                          onClick={handleOnAdd}
                          style={{ width: 'auto' }}
                          overlayClassName="materials-dropdown"
                        >
                          <i className="mdi mdi-plus" />New Material
                        </Dropdown.Button >
                      </div>
                    </Col>
                  </Row>
                  <Table
                    columns={columns}
                    data={filteredData || []}
                    paginationPageSize={8}
                  />
                </CardBody>
              </Card>
              <FormModal
                fields={fields}
                modalOpen={modal}
                isEdit={isEdit}
                resource={"Material"}
                initialValues={initialValues}
                schema={validationSchema}
                handleOnSubmit={handleOnSubmit}
                handleOnCancel={toggle}
              />
              <ImportFileModal
                title="Upload Materials"
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

export default Materials;
