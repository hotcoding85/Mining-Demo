import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import Breadcrumb from "Components/Common/Breadcrumb";
import TableContainer, {
  TableColumn,
} from "../../Components/Common/TableContainer";
import { AppState } from "store";
import {
  getAllUsers,
  addUser,
  updateUser,
  removeUser,
  upsertUsers,
} from "slices/thunk";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { Link } from 'react-router-dom';
import { UserRoleOptions, StatusOptions, UserSkillOptions } from 'common/options';
import DeleteButton from 'Components/Common/DeleteButton';
import FormModal from 'Components/Common/FormModal';
import axios from 'axios';
import { createSelector } from 'reselect';
import _ from 'lodash';
import { Tag } from 'antd';
import ImportFileModal from "Components/Common/ImportFileModal";

const Users = (props: any) => {
  document.title = "Users | FMS Live";

  const dispatch: any = useDispatch();

  const [user, setUser] = useState<any>();
  const [modal, setModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [xda, setXda] = useState([])
  const [importCsvModal, setImportFileModal] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const importCsvModalToggle = useCallback(() => {
    setImportFileModal(!importCsvModal);
  }, [importCsvModal]);

  const selectProperties = createSelector(
    (state: any) => state.Users,
    (users) => ({
      data: users.data,
      total: users.total,
    })
  );

  const { data, total } = useSelector(selectProperties);

  useEffect(() => {

    const xdata = _.cloneDeep(data).map((item) => {
      item.skills = ['PC1250', 'HD785', 'HD1500']
      return item
    })
    setXda(xdata)
  }, [data])

  useEffect(() => {
    dispatch(getAllUsers()); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  const toggle = useCallback(() => {
    setModal(!modal);
  }, [modal]);

  const parseUserData = (doc) => {
    return {
      id: (doc && doc.id) || undefined,
      employeeId: (doc && doc.employeeId) || "",
      username: (doc && doc.username) || "",
      firstName: (doc && doc.firstName) || "",
      lastName: (doc && doc.lastName) || "",
      crew: (doc && doc.crew) || "",
      password: !isEdit
        ? doc && doc.password
          ? doc.password
          : undefined
        : undefined,
      skills: (doc && doc.skills) || undefined,
      role: (doc && doc.role) || "",
      email: (doc && doc.email) || undefined,
      mobile: (doc && doc.mobile) || undefined,
      status: (doc && doc.status) || "ACTIVE",
    };
  };

  const newFields = [
    {
      id: "employeeId",
      name: "employeeId",
      label: "Employee ID",
      editable: true,
      type: "input",
      inputType: "text",
    },
    {
      id: "username",
      name: "username",
      label: "Username",
      type: "input",
      editable: true,
      inputType: "text",
    },
    {
      id: "firstName",
      name: "firstName",
      label: "First Name",
      type: "input",
      editable: true,
      inputType: "text",
    },
    {
      id: "lastName",
      name: "lastName",
      label: "Last Name",
      type: "input",
      editable: true,
      inputType: "text",
    },
    {
      id: "crew",
      name: "crew",
      label: "Crew",
      type: "input",
      editable: true,
      inputType: "text",
    },
    {
      id: "role",
      name: "role",
      label: "Role",
      type: "select",
      options: UserRoleOptions,
    },
    {
      id: "password",
      name: "password",
      label: "Password",
      type: "input",
      editable: true,
      inputType: "password",
    },
    {
      id: 'skills',
      name: 'skills',
      label: 'Skills',
      type: 'select',
      allowMultiple: true,
      options: UserSkillOptions
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email',
      type: 'input',
      editable: true,
      inputType: "email",
    },
    {
      id: "mobile",
      name: "mobile",
      label: "Mobile",
      editable: true,
      type: "input",
      inputType: "text",
    },
    {
      id: "b_status",
      name: "status",
      label: "Status",
      type: "select",
      options: StatusOptions,
    },
  ];

  const editFields = [
    {
      id: "employeeId",
      name: "employeeId",
      label: "Employee ID",
      editable: false,
      type: "input",
      inputType: "text",
    },
    {
      id: "username",
      name: "username",
      label: "Username",
      type: "input",
      editable: false,
      inputType: "text",
    },
    {
      id: "firstName",
      name: "firstName",
      label: "First Name",
      type: "input",
      editable: true,
      inputType: "text",
    },
    {
      id: "lastName",
      name: "lastName",
      label: "Last Name",
      type: "input",
      editable: true,
      inputType: "text",
    },
    {
      id: "crew",
      name: "crew",
      label: "Crew",
      type: "input",
      editable: true,
      inputType: "text",
    },
    {
      id: "role",
      name: "role",
      label: "Role",
      type: "select",
      options: UserRoleOptions,
    },
    {
      id: "password",
      name: "password",
      label: "Password",
      type: "input",
      editable: true,
      inputType: "password",
    },
    {
      id: 'skills',
      name: 'skills',
      label: 'Skills',
      type: 'select',
      allowMultiple: true,
      options: UserSkillOptions
    },
    {
      id: 'email',
      name: 'email',
      label: 'Email',
      type: 'input',
      editable: true,
      inputType: "email",
    },
    {
      id: "mobile",
      name: "mobile",
      label: "Mobile",
      type: "input",
      editable: true,
      inputType: "text",
    },
    {
      id: "b_status",
      name: "status",
      label: "Status",
      type: "select",
      options: StatusOptions,
    },
  ];

  const handleOnEdit = useCallback(
    (arg: any) => {
      // setting the dialog to show as edit
      setIsEdit(true);

      const doc = arg;
      // reading the row data from table
      const user = {
        id: (doc && doc.id) || undefined,
        employeeId: (doc && doc.employeeId) || "",
        username: (doc && doc.username) || "",
        firstName: (doc && doc.firstName) || "",
        lastName: (doc && doc.lastName) || "",
        crew: (doc && doc.crew) || "",
        password: undefined,
        role: (doc && doc.role) || "",
        email: (doc && doc.email) || undefined,
        mobile: (doc && doc.mobile) || undefined,
        status: (doc && doc.status) || "ACTIVE",
      };
      // saving to state
      setUser(user);

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

  const handleOnDelete = useCallback(
    (arg: string) => {
      dispatch(removeUser(arg));
      onPaginationPageChange(1);
    },
    [dispatch]
  );

  const initialValues = parseUserData(user);

  const validationSchema = Yup.object().shape({
    employeeId: Yup.string().required("Please enter employee id"),
    username: isEdit
      ? Yup.string()
      : Yup.string()
        .min(5, "Username must be at least 5 characters")
        .required("Please enter username")
        .test(
          "unique",
          "User with this username already exists",
          async function (value) {
            if (value && value.length >= 5) {
              try {
                const response = await axios.get(
                  `/users/check-username/${value}`
                );
                return response.available; // assuming your API returns { available: true } if username is unique
              } catch (error) {
                console.error("Error checking username uniqueness:", error);
                if (error && error["data"] && error["data"]["available"]) {
                  return true;
                }
                return false; // treat as not unique on error
              }
            }
            return true;
          }
        ),
    firstName: Yup.string().required("Please enter user first name"),
    lastName: Yup.string().required("Please enter user last name"),
    crew: Yup.string().required("Please enter crew"),
    role: Yup.string().required("Please select a role"),
    password: isEdit
      ? Yup.string().optional()
      : Yup.string().when(["role"], {
        is: (role) => role !== "OPERATOR",
        then: () => Yup.string().required(),
        otherwise: () => Yup.string().optional(),
      }),
    email: Yup.string().email(),
    mobile: Yup.string(),
    status: Yup.string(),
  });

  const columns: TableColumn[] = useMemo(
    () => [
      {
        header: "#ID",
        accessorKey: "employeeId",
        enableColumnFilter: false,
        enableSorting: true,
      },
      {
        header: "Username",
        accessorKey: "username",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'left', }}>{cellProps.row.original.username}</div>
          );
        },
      },
      {
        header: "First Name",
        accessorKey: "firstName",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'left', }}>{cellProps.row.original.firstName}</div>
          );
        },
      },
      {
        header: "Last Name",
        accessorKey: "lastName",
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          return (
            <div style={{ textAlign: 'left', }}>{cellProps.row.original.lastName}</div>
          );
        },
      },
      {
        header: "Role",
        accessorKey: "role",
        enableColumnFilter: false,
        enableSorting: true,
        // cell: (cellProps: any) => {
        //   return (
        //     <div className="badge badge-soft-primary font-size-11 m-1">{cellProps.row.original.role}</div>
        //   );
        // },
      },
      {
        header: 'Skills',
        accessorKey: 'skills',
        enableColumnFilter: false,
        enableSorting: true,
        cell: (cellProps: any) => {
          const skillsData = cellProps.row.original.skills
          console.log('columns props', skillsData)
          return (
            <>
              {
                skillsData?.map((item, key) => <Tag color='#87d068'>{item}</Tag>)
              }
            </>
          );
        },
      },
      {
        header: "Actions",
        enableColumnFilter: false,
        accessorKey: "",
        enableSorting: false,
        cell: (cellProps: any) => {
          const name = `${cellProps.row.original.firstName} ${cellProps.row.original.lastName}`;
          const id = cellProps.row.original.id;
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

  const handleOnAdd = () => {
    // setting as it is not edit
    setIsEdit(false);
    // clearing the resource state if previous value is set
    setUser("");
    // show dialog
    toggle();
  };

  const handleOnSubmit = (values, { resetForm }) => {
    const _user = parseUserData(values);

    if (isEdit) {
      // _user['id'] = user.id
      delete _user.id;
      dispatch(updateUser(user.id, _user));
      setIsEdit(false);
    } else {
      dispatch(addUser(_user));
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
    setUser("");
    // show import csv dialog
    importCsvModalToggle();
  };

  const handleUploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    await dispatch(upsertUsers(formData));
    setIsUploading(false);
    importCsvModalToggle();
  };

  console.log(xda)
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Resources" breadcrumbItem="Users" />
          <Row>
            <Col lg="12">
              <Card>
                <CardBody>
                  <TableContainer
                    columns={columns}
                    data={xda || []}
                    // total={total || 0}
                    isGlobalFilter={true}
                    handleOnAddClick={handleOnAdd}
                    handleOnImportClick={handleOnImport}
                    isPagination={true}
                    isAddButton={true}
                    buttonName="New User"
                    isImportButton={true}
                    importButtonName="Import Users"
                  />
                </CardBody>
              </Card>
              <FormModal
                fields={isEdit ? editFields : newFields}
                modalOpen={modal}
                isEdit={isEdit}
                resource={"User"}
                initialValues={initialValues}
                schema={validationSchema}
                handleOnSubmit={handleOnSubmit}
                handleOnCancel={toggle}
              />
              <ImportFileModal
                title="Upload Users"
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

export default Users;
