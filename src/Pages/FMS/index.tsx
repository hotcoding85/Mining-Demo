import React, { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import List from './List';
import { getAllFleet } from 'slices/fleet/thunk';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

const FMS = () => {
  document.title = "Dashboards";

  const dispatch = useDispatch<any>();

  const selectProperties = createSelector(
    (state: any) => state.Fleet,
    (fleetState) => ({
      fleetList: fleetState.data,
      loading: fleetState.loading
    })
  );

  const { fleetList, loading } = useSelector(selectProperties);

  const [diggers, setDiggers] = useState<any>();
  const [trucks, setTrucks] = useState<any>();
  
  const [isLoading, setLoading] = useState<boolean>(loading);

  useEffect(() => {
    setDiggers(fleetList.filter(vehicle => vehicle.category === "DIGGER"))
    setTrucks(fleetList.filter(vehicle => vehicle.category === "DUMP_TRUCK"))
  }, [fleetList])


  useEffect(() => {
    dispatch(getAllFleet()); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Dashboards" breadcrumbItem="FMS" />
          <List candidateDate={diggers} />
          <List candidateDate={trucks} />
        </Container>
      </div>
    </React.Fragment >
  );
}

export default FMS;