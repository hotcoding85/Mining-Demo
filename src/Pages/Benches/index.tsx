import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import {
  getAllBenches,
  addBench,
  updateBench,
  removeBench,
  upsertBenches,
  getAllMaterials,
} from "slices/thunk";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { BenchCategories, StatusOptions } from "common/options";
import DeleteButton from "Components/Common/DeleteButton";
import FormModal from "Components/Common/FormModal";
import { isBenchNameUnique } from "../../Helpers/api_benches_helper";
import ImportFileModal from "Components/Common/ImportFileModal";
import { csvFileToJson } from "utils/csvConverter";
import { round2Two } from "utils/common";
import Table from "Components/Common/Table";
import { Dropdown, Input, MenuProps } from "antd";
import { debounce } from "lodash";
import './style.scss';
import { BenchSelector, MaterialSelector } from "selectors";

const Benches = (props: any) => {
  document.title = "Benches | FMS Live";

  const dispatch: any = useDispatch();
  const [bench, setBench] = useState<any>();

  const [modal, setModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [importCsvModal, setImportFileModal] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");

  const { benches } = useSelector(BenchSelector);
  const { materials } = useSelector(MaterialSelector);

  useEffect(() => {
    dispatch(getAllBenches(1, 100)); // Dispatch action to fetch data on component mount
    dispatch(getAllMaterials(1, 100));
  }, [dispatch]);

  const toggle = useCallback(() => {
    setModal(!modal);
  }, [modal]);

  const importCsvModalToggle = useCallback(() => {
    setImportFileModal(!importCsvModal);
  }, [importCsvModal]);

  const parseBenchData = (doc) => {
    return {
      id: (doc && doc.id) || "",
      name: (doc && doc.name) || "",
      category: (doc && doc.category) || "",
      elevation: (doc && doc.elevation) || "",
      grade: (doc && doc.grade) || undefined,
      tonnes: (doc && doc.tonnes) || undefined,
      volume: (doc && doc.volume) || undefined,
      density: (doc && doc.density) || undefined,
      status: (doc && doc.status) || "ACTIVE",
      blockId: doc && doc.blockId,
      materialId:
        (doc &&
          materials?.find((material) => material.name === doc.blockId)?.id) ||
        undefined,
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

  const checkBenchNameUnique = debounce(async (value) => {
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
  }, 500);

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
              return await checkBenchNameUnique(value);
            }
            return true;
          }
        ),
    blockId: Yup.string().required("Please select the material"),
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
      id: "blockId",
      name: "blockId",
      label: "Material",
      type: "select",
      options: materials?.map((item, key) => ({
        key: key,
        value: item.name,
        label: item.name,
      })),
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
      id: "grade",
      name: "grade",
      label: "Grade",
      type: "input",
      editable: true,
      inputType: "number",
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
      id: "tonnes",
      name: "tonnes",
      label: "Estimated Tonnes",
      type: "input",
      editable: true,
      inputType: "number",
    },
    {
      id: "volume",
      name: "volume",
      label: "Estimated BCM",
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
    importCsvModalToggle();
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
        dataType: "",
        align: "center",
      },
      {
        title: "Category",
        key: "category",
        dataIndex: "category",
        dataType: "string",
        align: "center",

        render: (text) => (
          <div className="badge badge-soft-primary font-size-11">{text}</div>
        ),
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
        title: "Est. Tonnes",
        key: "tonnes",
        dataIndex: "tonnes",
        dataType: "number",
        align: "center",
        render: (text) => round2Two(text),
      },
      {
        title: "Est. Volume",
        key: "volume",
        dataIndex: "volume",
        dataType: "number",
        align: "center",
        render: (text) => round2Two(text),
      },
      {
        title: "Extracted",
        key: "tonnes",
        dataIndex: "tonnes",
        dataType: "number",
        align: "center",
        render: (text) => (
          <div style={{color:'red'}}>{round2Two(text)}</div>
        ),
      },
      {
        title: "Est. Remainder",
        key: "tonnes",
        dataIndex: "tonnes",
        dataType: "number",
        align: "center",
        render: (text) => (
          <div style={{color:'red'}}>{round2Two(text)}</div>
        ),
      },
      {
        title: "Status",
        key: "status",
        dataIndex: "status",
        dataType: "string",
        align: "center",
        render: (text) => (
          <div className="badge badge-soft-primary font-size-11">{text}</div>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        dataIndex: "",
        dataType: "",
        align: "center",
        render: (_, benchData) => {
          return (
            <div className="d-flex gap-3 justify-content-center">
              <Link
                to="#!"
                className="text-success"
                onClick={(event: any) => {
                  event.preventDefault();
                  handleOnEdit(benchData);
                }}
              >
                <i className="mdi mdi-pencil font-size-18" id="edittooltip" />
              </Link>
              <DeleteButton
                item={benchData.name}
                onDelete={() => handleOnDelete(benchData.id)}
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
    csvFileToJson(file, async (data: any) => {
      setIsUploading(true);

      const benchData = data.map((item) => ({
        name: item.source,
        source: item["source_type"],
        grade: item["au_g/t"],
        blockId: item["block_id"],
        density: item["digblock_density"],
        tonnes: item["digblock_tonnes"],
        volume: item["digblock_volume"],
        status: "ACTIVE",
      }));

      await dispatch(upsertBenches({ data: benchData }));

      importCsvModalToggle();
      setIsUploading(false);
    });
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return benches;
    return benches.filter((item) =>
      columns.some((col) =>
        String(item[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [benches, searchTerm, columns]);

  const onMenuClick: MenuProps['onClick'] = (e) => {
    console.log('click', e);
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
          <Breadcrumb title="Resources" breadcrumbItem="Benches" />
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
                          menu={{ items, onClick: onMenuClick }}
                          onClick={handleOnAdd}
                          style={{ width: 'auto' }}
                          overlayClassName="benche-dropdown"
                        >
                          <i className="mdi mdi-plus" />New Bench
                        </Dropdown.Button>
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
                resource={"Bench"}
                initialValues={initialValues}
                schema={validationSchema}
                handleOnSubmit={handleOnSubmit}
                handleOnCancel={toggle}
              />
              <ImportFileModal
                title="Upload benches"
                isOpen={importCsvModal}
                onClose={importCsvModalToggle}
                onUpload={handleUploadBenches}
                isUploading={isUploading}
              />
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Benches;
