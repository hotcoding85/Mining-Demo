import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Col, Container, Form, Row, Input, Label, FormFeedback, Alert } from "reactstrap";

// Formik validation
import * as Yup from "yup";
import { useFormik } from "formik";

// import images
import logodark from "../../assets/images/logo-dark.png";
import logolight from "../../assets/images/logo-light.png";
import CarouselPage from "./CarouselPage";

import { changeLayoutMode, loginuser, resetLoginFlagState } from "slices/thunk";

import withRouter from "Components/Common/withRouter";
import { useDispatch, useSelector } from "react-redux";
import { ProfileSelector } from "selectors";

const LoginPage = (props: any) => {

  const dispatch: any = useDispatch();
  const [passwordShow, setPasswordShow] = useState<boolean>(false);

  //meta title
  document.title = "Login | FMS Live";

  const layout = useSelector((state: any) => state.Layout)
  dispatch(changeLayoutMode(layout.layoutModeTypes))

  const { error, errorMsg } = useSelector(ProfileSelector);

  // Form validation 
  const validation: any = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      email: "support",
      password: "12345678",
    },
    validationSchema: Yup.object({
      email: Yup.string().required("Please enter your username or email"),
      password: Yup.string().required("Please enter your password"),
    }),
    onSubmit: (values: any) => {
      dispatch(loginuser(values, props.router.navigate));

      setTimeout(() => {
        dispatch(resetLoginFlagState());
      }, 5000)
    }
  });

  return (
    <React.Fragment>
      <div id="layout-wrapper">
        <Container fluid className="p-0">
          <Row className="g-0">
            <CarouselPage />
            <Col xl={3}>
              <div className="auth-full-page-content p-md-5 p-4">
                <div className="w-100">
                  <div className="d-flex flex-column h-100">
                    <div className="mb-4 mb-md-5">
                      <Link to="/" className="d-block auth-logo">
                        <img
                          src={logodark}
                          alt=""
                          height="100"
                          style={{ margin: 'auto' }}
                          className="auth-logo-dark"
                        />
                        <img
                          src={logolight}
                          alt=""
                          height="100"
                          style={{ margin: 'auto' }}
                          className="auth-logo-light"
                        />
                      </Link>
                    </div>
                    <div className="my-auto">
                      <div>
                        <h5 className="text-primary">Welcome to FMS Live</h5>
                        <p className="text-muted">
                          Sign in to continue
                        </p>
                      </div>

                      <div className="mt-4">
                        <Form className="form-horizontal"
                          onSubmit={(e) => {
                            e.preventDefault();
                            validation.handleSubmit();
                            return false;
                          }}
                        >
                          <div className="mb-3">
                            {error ? <Alert color="danger">{errorMsg}</Alert> : null}
                            <Label className="form-label">Username</Label>
                            <Input
                              name="email"
                              className="form-control"
                              placeholder="Enter email"
                              type="text"
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.email || ""}
                              invalid={
                                validation.touched.email && validation.errors.email ? true : false
                              }
                            />
                            {validation.touched.email && validation.errors.email ? (
                              <FormFeedback type="invalid">{validation.errors.email}</FormFeedback>
                            ) : null}
                          </div>

                          <div className="mb-3">
                            <Label className="form-label">Password</Label>
                            <div className="input-group auth-pass-inputgroup">
                              <Input
                                name="password"
                                value={validation.values.password || ""}
                                type={passwordShow ? "text" : "password"}
                                placeholder="Enter Password"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                invalid={
                                  validation.touched.password && validation.errors.password ? true : false
                                }
                              />
                              <button onClick={() => setPasswordShow(!passwordShow)} className="btn btn-light " type="button" id="password-addon">
                                <i className="mdi mdi-eye-outline"></i></button>
                            </div>
                            {validation.touched.password && validation.errors.password ? (
                              <FormFeedback type="invalid">{validation.errors.password}</FormFeedback>
                            ) : null}
                          </div>

                          <div className="form-check">
                            <Input
                              type="checkbox"
                              className="form-check-input"
                              id="auth-remember-check"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="auth-remember-check"
                            >
                              Remember me
                            </label>
                          </div>

                          <div className="mt-3 d-grid">
                            <button
                              className="btn btn-primary btn-block "
                              type="submit"
                            >
                              Sign In
                            </button>
                          </div>

                        </Form>
                      </div>
                    </div>

                    <div className="mt-4 mt-md-5 text-center">
                      <p className="mb-0">
                       OP v{process.env.REACT_APP_VERSION} © {new Date().getFullYear()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default withRouter(LoginPage);

