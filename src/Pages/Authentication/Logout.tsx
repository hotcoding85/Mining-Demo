import React, { useEffect } from "react"
import withRouter from "Components/Common/withRouter";
import { Navigate } from "react-router-dom";

import { logoutUser } from "slices/thunk";

//redux
import { useSelector, useDispatch } from "react-redux";
import { ProfileSelector } from "selectors";

const Logout = () => {
  const dispatch = useDispatch<any>();
  const { isUserLogout } = useSelector(ProfileSelector);

  useEffect(() => {
    dispatch(logoutUser());
    localStorage.getItem('equipments') && localStorage.removeItem('equipments');
  }, [dispatch]);

  if (isUserLogout) {
    return <Navigate to="/login" />;
  }

  return <></>;
}


export default withRouter(Logout)
