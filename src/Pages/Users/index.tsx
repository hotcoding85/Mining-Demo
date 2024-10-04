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
import _ from 'lodash';
import { Dropdown, Input, MenuProps, Tag } from 'antd';
import ImportFileModal from "Components/Common/ImportFileModal";
import './style.scss';
import Table from "Components/Common/Table";
import { UserSelector } from "selectors";

const Users = (props: any) => {
  document.title = "Users | FMS Live";

  const dispatch: any = useDispatch();

  const [user, setUser] = useState<any>();
  const [modal, setModal] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [importCsvModal, setImportFileModal] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const importCsvModalToggle = useCallback(() => {
    setImportFileModal(!importCsvModal);
  }, [importCsvModal]);

  const { users } = useSelector(UserSelector);

  useEffect(() => {
    dispatch(getAllUsers(1, 100)); // Dispatch action to fetch data on component mount
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

  const checkUserNameUnique = _.debounce(async (value) => {
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
  }, 500);

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
              return await checkUserNameUnique(value);
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

  const columns = useMemo(
    () => [
      {
        title: "#ID",
        dataIndex: "employeeId",
        key: "employeeId",
        dataType: "string",
      },
      {
        title: "Username",
        dataIndex: "username",
        key: "username",
        dataType: "string",
      },
      {
        title: "First Name",
        dataIndex: "firstName",
        key: "firstName",
        dataType: "string",
      },
      {
        title: "Last Name",
        dataIndex: "lastName",
        key: "lastName",
        dataType: "string",
      },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        dataType: "string",
      },
      {
        title: "Skills",
        dataIndex: "skills",
        key: "skills",
        dataType: "any",
        render: (skillsData: any) => (
          <>
            {
              skillsData?.map((item, key) => <Tag color='#87d068'>{item}</Tag>)
            }
          </>
        )
      },
      {
        title: "Actions",
        dataIndex: "actions",
        key: "actions",
        dataType: "any",
        render: (text, record) => {
          const name = `${record.firstName} ${record.lastName}`;
          const id = record.id;
          return (
            <div className="d-flex gap-3">
              <Link
                to="#!"
                className="text-success"
                onClick={(event: any) => {
                  event.preventDefault();
                  const vehicleData = record;
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

  const filteredData = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter((item) =>
      columns.some((col) =>
        String(item[col.key])
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }, [users, searchTerm, columns]);

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
          <Breadcrumb title="Resources" breadcrumbItem="Users" />
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
                          menu={{ items, onClick: onMenuClick,}}
                          onClick={handleOnAdd}
                          style={{ width: 'auto' }}
                          overlayClassName="users-dropdown"
                        >
                         <i className="mdi mdi-plus" />New User
                        </Dropdown.Button >
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
