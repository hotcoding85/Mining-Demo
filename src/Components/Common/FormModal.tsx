import { Formik, ErrorMessage } from "formik";
import React from "react";
import { Modal, ModalHeader, ModalBody, Form, Row, Col, Label, Input, Button } from "reactstrap";
import CustomSelect from "./Select";

const FormModal = ({ fields, modalOpen, isEdit, resource, initialValues, schema, handleOnSubmit, handleOnCancel }) => {

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
                        onSubmit={handleOnSubmit}>
                        {({
                            values,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            setFieldValue,
                            errors,
                            touched,
                        }) => (
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col xs={12}>
                                        {
                                            fields.map((field, key) => {
                                                switch (field.type) {
                                                    case 'input':
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
                                                                        touched[field.name] && errors[field.name] ? true : false
                                                                    }
                                                                />
                                                                <ErrorMessage
                                                                    name={field.name}
                                                                    component="div"
                                                                    className="error"
                                                                />
                                                            </div>
                                                        )
                                                    case 'select':
                                                        return (
                                                            <div className="mb-3" key={key}>
                                                                <Label>{field.label}</Label>
                                                                <CustomSelect
                                                                    id={field.id}
                                                                    name={field.name}
                                                                    formValues={values}
                                                                    options={field.options}
                                                                    setFieldValue={setFieldValue}
                                                                    onBlur={handleBlur}
                                                                />
                                                                <ErrorMessage
                                                                    name={field.name}
                                                                    component="div"
                                                                    className="error"
                                                                />
                                                            </div>
                                                        )
                                                }

                                            })
                                        }
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="text-end">
                                        <Button color="secondary" style={{ marginRight: '10px' }} onClick={() => handleOnCancel()}>Cancel</Button>
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
    )
}
export default FormModal;