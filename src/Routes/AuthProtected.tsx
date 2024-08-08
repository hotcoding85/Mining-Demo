import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

const AuthProtected = (props) => {

  const selectProperties = createSelector(
    (state: any) => state.Auth,
    (profile) => ({
      user: profile.user,
      token: profile.token,
    })
  );

  const { user, token } = useSelector(selectProperties);

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
