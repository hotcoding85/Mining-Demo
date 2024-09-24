import React, { useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { Tabs, TabsProps } from "antd";
import Breadcrumb from "Components/Common/Breadcrumb";
import TruckLoadOptimisationMapView from "./components/TruckLoadOptimisationMapView";
import TruckLoadOptimisationTableView from "./components/TruckLoadOptimisationTableView";
import "./styles/index.scss";
import { TextColor } from "Components/Charts/interfaces/general";
import TruckLoadProfileView from "./components/TruckLoadProfileView";

const TruckLoadOptimisation = (props: any) => {
  document.title = "Truck Load Optimisation | FMS Live";

  const [displayType, setDisplayType] = useState("TABLE");

  const tabItems: TabsProps["items"] = [
    {
      key: "table",
      label: "Table View",
    },
    {
      key: "map",
      label: "Map View",
    },
    {
      key: "profile",
      label: "Truck Load Profile",
    },
  ];

  const barData = {
    labels: [
      "200",
      "220",
      "240",
      "260",
      "280",
      "300",
      "320",
      "340",
      "360",
      "380",
      "400",
      "420",
      "440",
      "460",
      "480",
      "500",
    ],
    datasets: [
      {
        label: "Ton Target",
        data: [1, 1, 2, 4, 10, 16, 20, 18, 13, 7, 3, 2, 1, 0, 0, 0],
        backgroundColor: "#FAAD14",
        barPercentage: 1,
        categoryPercentage: 0.4,
        barThickness: 33,
        borderRadius: {
          topLeft: 3,
          topRight: 3,
        },
      },
    ],
  };
  
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        display: false,
      },
      datalabels: {
        anchor: "end" as const,
        align: "top" as const,
        color: "#fff",
        font: {
          size: 10,
          weight: "bold" as const,
        },
        formatter: (value: string | number) => {
          return value + "%"; 
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'red',
          font: {
            size: 14,
          },
        },
      },
      y: {
        beginAtZero: true, 
        grid: {
          display: true,
          color: "#9CA3B1",
          lineWidth: 0.2,
        },
        ticks: {
          color: 'red',
          font: {
            size: 14,
          },
          stepSize: 5,
          callback: function (value: string | number) {
            return value + "%"; 
          },
        },
      },
    },
  };

  const textColor: TextColor[] = [
    { text: "Ton Target", color: "#9CA3B1" },
  ];

  const onTabChange = (key: string) => {
    if (key === "table") {
      setDisplayType("TABLE");
    } else if (key === "map") {
      setDisplayType("MAP");
    } else {
      setDisplayType("PROFILE");
    }
  };

  return (
    <React.Fragment>
      <div className="page-content col-lg-12">
        <Container className="truck-optimisation" fluid>
          <Breadcrumb
            title="Mine Dynamics"
            breadcrumbItem="Truck Load Optimisation"
          />
          <Row>
            <Col lg="12">
              <Tabs
                className="truck-optimisation-tabs"
                defaultActiveKey="1"
                items={tabItems}
                onChange={onTabChange}
              />
            </Col>
          </Row>

          {displayType === "TABLE" ? (
            <TruckLoadOptimisationTableView />
          ) : displayType === "MAP" ? (
            <TruckLoadOptimisationMapView />
          ) : (
            <TruckLoadProfileView />
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default TruckLoadOptimisation;
