import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ProfileSelector } from "selectors";

const AuthProtected = (props) => {

  const { user, token } = useSelector(ProfileSelector);

  if (!token && !user) {
    return (
      <Navigate to={{ pathname: "/login" }} />
    );
  }

  return (
    <React.Fragment>
      {props.children}
    </React.Fragment>
  );
};

export default AuthProtected;
