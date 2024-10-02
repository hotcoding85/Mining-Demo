import { Formik, ErrorMessage } from "formik";
import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  Row,
  Col,
  Label,
  Input,
  Button,
} from "reactstrap";
import CustomSelect from "./Select";
import { DatePicker } from "antd";
import moment from "moment";
import dayjs from "dayjs";

const FormModal = ({
  fields,
  modalOpen,
  isEdit,
  resource,
  initialValues,
  schema,
  handleOnSubmit,
  handleOnCancel,
}) => {
  return (
    <React.Fragment>
      <Modal isOpen={modalOpen}>
        <ModalHeader tag="h4">
          {" "}
          {isEdit ? "Update" : "New"} {resource}
        </ModalHeader>
        <ModalBody>
          <Formik
            initialValues={initialValues}
            validationSchema={schema}
            onSubmit={handleOnSubmit}
          >
            {({
              values,
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              errors,
              touched,
            }) => (
              <Form onSubmit={handleSubmit} autoComplete="off">
                <Row>
                  <Col xs={12}>
                    {fields.map((field, key) => {
                      switch (field.type) {
                        case "input":
                          return (
                            <div className="mb-3" key={key}>
                              <Label>{field.label}</Label>
                              <Input
                                name={field.name}
                                type={field.inputType}
                                disabled={!field.editable}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values[field.name] || ""}
                                invalid={
                                  touched[field.name] && errors[field.name]
                                    ? true
                                    : false
                                }
                              />
                              <ErrorMessage
                                name={field.name}
                                component="div"
                                className="error"
                              />
                            </div>
                          );
                        case "select":
                          return (
                            <div className="mb-3" key={key}>
                              <Label>{field.label}</Label>
                              <CustomSelect
                                id={field.id}
                                name={field.name}
                                formValues={values}
                                options={field.options}
                                allowMultiple={field.allowMultiple}
                                setFieldValue={setFieldValue}
                                onBlur={handleBlur}
                              />
                              <ErrorMessage
                                name={field.name}
                                component="div"
                                className="error"
                              />
                            </div>
                          );
                        case "date":
                          return (
                            <div
                              className="mb-3"
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                              key={key}
                            >
                              <Label>{field.label}</Label>
                              <DatePicker
                                showTime
                                id={field.id}
                                name={field.name}
                                value={
                                  values[field.name]
                                    ? dayjs(values[field.name])
                                    : null
                                }
                                onChange={(date) =>
                                  setFieldValue(
                                    field.name,
                                    date ? date.toISOString() : ""
                                  )
                                }
                                format="YYYY-MM-DD HH:mm"
                              />
                              <ErrorMessage
                                name={field.name}
                                component="div"
                                className="error"
                              />
                            </div>
                          );
                      }
                    })}
                  </Col>
                </Row>
                <Row>
                  <Col className="text-end">
                    <Button
                      color="secondary"
                      style={{ marginRight: "10px" }}
                      onClick={() => handleOnCancel()}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" color="success">
                      {" "}
                      {isEdit ? "Update" : "Save"}{" "}
                    </Button>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};
export default FormModal;
