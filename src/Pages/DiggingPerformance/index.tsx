import React, { useEffect, useState } from 'react';
import { Container, Row } from 'reactstrap';
import Breadcrumb from 'Components/Common/Breadcrumb';
import DiggingExecutionCard from './DiggingExecutionCard';
import { pc2000, pc1250, hd1500, hd785, wa600 } from 'assets/images/equipment';
import { useDispatch, useSelector } from 'react-redux';
import { getAllFleet } from 'slices/thunk';
import { FleetSelector } from 'selectors';

const DiggingPerformance = () => {
  document.title = "Digging Performance | FMS Live";
  const [series, useSeries] = useState([67, 60, 90]); // Replace with actual data
  const [operationalDelay, useOperationalDelay] = useState([40, 50, 60]); // Replace with actual data
  const [availability, useAvailability] = useState([70, 80, 90]); // Replace with actual data
  const [progresses, useProgresses] = useState([{ min: 23, max: 35 }, { min: 21, max: 35 }, { min: 31, max: 35 }]); // Replace with actual data

  const dispatch = useDispatch<any>();

  const { fleet } = useSelector(FleetSelector);

  function containsCaseInsensitive(str: string, substr: string): boolean {

    return str ? str.toLowerCase().includes(substr.toLowerCase()) : false;
  }

  const getImage = (category: string) => {

    if (containsCaseInsensitive(category, "hd785")) {
      return hd785;
    } else if (containsCaseInsensitive(category, "hd1500")) {
      return hd1500;
    } else if (containsCaseInsensitive(category, "pc1250")) {
      return pc1250;
    } else if (containsCaseInsensitive(category, "pc2000")) {
      return pc2000;
    } else if (containsCaseInsensitive(category, "wa600")) {
      return wa600;
    }
  }

  useEffect(() => {
    dispatch(getAllFleet(1, 50, 'name', 'ASC', null, 'EXCAVATOR')); // Dispatch action to fetch data on component mount
  }, [dispatch]);

  const tbSeries = [[
    {
      name: "WASTE",
      data: [113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0],
    },
    {
      name: "ROM ORE",
      data: [12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3,],
    }
  ], [
    {
      name: "WASTE",
      data: [113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0],
    },
    {
      name: "ROM ORE",
      data: [12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3,],
    }
  ], [
    {
      name: "WASTE",
      data: [113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0, 113.0],
    },
    {
      name: "ROM ORE",
      data: [12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3, 12.3,],
    }
  ]];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumb title="Production" breadcrumbItem="Digging Performance" />
          {
            fleet.map((item: any, key: number) => (
              <Row>
                <DiggingExecutionCard
                  imgSrc={getImage(item.model)}
                  altText="excavator"
                  title={item.name}
                  cardTitle="Excavator 24 Hr. Planned Execution"
                  progressValue={progresses[key] ? progresses[key].min : 10}
                  progressMax={progresses[key] ? progresses[key].max: 100}
                  series={[series[key]]}
                  operationalDelay={[operationalDelay[0]]}
                  availability={[availability[0]]}
                  tbSeries={tbSeries[0]}
                  forecast={600}
                  forecastColor={'green'}
                />
              </Row>
            ))
          }
        </Container>
      </div>
    </React.Fragment>
  );
}

export default DiggingPerformance;
