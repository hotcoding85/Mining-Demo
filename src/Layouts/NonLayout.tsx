import React, { useEffect } from 'react';
import withRouter from "../Components/Common/withRouter";
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { changeLayoutMode } from "Slices/thunk";

const NonAuthLayout = (props: any) => {

  const dispatch = useDispatch<any>();

  const selectProperties = createSelector(
    (state: any) => state.Layout,
    (layout) => ({
      layoutModeTypes: layout.layoutModeTypes,
    })
  );
  const { layoutModeTypes } = useSelector(selectProperties);

  useEffect(() => {
    dispatch(changeLayoutMode(layoutModeTypes));
  }, [dispatch, layoutModeTypes]);

  return (
    <React.Fragment>{props.children}</React.Fragment>
  );
}

export default withRouter(NonAuthLayout)
