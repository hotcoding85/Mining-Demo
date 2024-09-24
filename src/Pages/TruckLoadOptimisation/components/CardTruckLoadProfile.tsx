import { useState, FC, useMemo } from "react";
import "../styles/card.scss";
import { Card } from "reactstrap";
import styled from "styled-components";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import backheoArm from '../../../assets/images/equipment/backhoe-arm.png'

const getStatusColor = (status: string) => {
  switch (status) {
    case "Schedule Refuel":
      return "#f4b400";
    case "Critical":
      return "#db4437";
    case "Healthy":
      return "#0f9d58";
    default:
      return "#4285f4";
  }
};

export interface TruckLoadProfileData {
  id: string;
  status: string;
  loadTime: number;
  passes: number;
  fuelRate: number;
  lastUpdated: number;
  sync: "manual" | "inactive" | "active";
}

const CardTruckLoadProfile: FC<TruckLoadProfileData> = ({
  id,
  status,
  loadTime,
  passes,
  fuelRate,
  lastUpdated,
  sync,
}) => {
  const statusColor = getStatusColor(status);
  const [isHoveringSync, setIsHoveringSync] = useState(false);

  const handleSyncHover = () => {
    setIsHoveringSync(!isHoveringSync);
  };

  const getSyncIcon = () => {
    switch (sync) {
      case "manual":
        return <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.99996 5.99996C5.26663 5.99996 4.63885 5.73885 4.11663 5.21663C3.5944 4.6944 3.33329 4.06663 3.33329 3.33329C3.33329 2.59996 3.5944 1.97218 4.11663 1.44996C4.63885 0.927737 5.26663 0.666626 5.99996 0.666626C6.73329 0.666626 7.36107 0.927737 7.88329 1.44996C8.40551 1.97218 8.66663 2.59996 8.66663 3.33329C8.66663 4.06663 8.40551 4.6944 7.88329 5.21663C7.36107 5.73885 6.73329 5.99996 5.99996 5.99996ZM0.666626 11.3333V9.46663C0.666626 9.08885 0.763959 8.74151 0.958626 8.42463C1.15285 8.10818 1.41107 7.86663 1.73329 7.69996C2.42218 7.35551 3.12218 7.09707 3.83329 6.92463C4.5444 6.75263 5.26663 6.66663 5.99996 6.66663C6.73329 6.66663 7.45551 6.75263 8.16663 6.92463C8.87774 7.09707 9.57774 7.35551 10.2666 7.69996C10.5888 7.86663 10.8471 8.10818 11.0413 8.42463C11.236 8.74151 11.3333 9.08885 11.3333 9.46663V11.3333H0.666626Z"
            fill={`${lastUpdated > 120 ? '#CF1322' : (lastUpdated <= 120 && lastUpdated >= 30) ? '#FAAD14' : '#389E0D'}`} />
        </svg>
          ;
      case "inactive":
        return <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.28335 9.36667L11.0667 5.6L10.1167 4.65L7.28335 7.48333L5.86669 6.06667L4.93335 7L7.28335 9.36667ZM0.666687 14V12.6667H15.3334V14H0.666687ZM2.66669 12C2.30002 12 1.98613 11.8694 1.72502 11.6083C1.46391 11.3472 1.33335 11.0333 1.33335 10.6667V3.33333C1.33335 2.96667 1.46391 2.65278 1.72502 2.39167C1.98613 2.13056 2.30002 2 2.66669 2H13.3334C13.7 2 14.0139 2.13056 14.275 2.39167C14.5361 2.65278 14.6667 2.96667 14.6667 3.33333V10.6667C14.6667 11.0333 14.5361 11.3472 14.275 11.6083C14.0139 11.8694 13.7 12 13.3334 12H2.66669ZM2.66669 10.6667H13.3334V3.33333H2.66669V10.6667Z"
            fill={`${lastUpdated > 120 ? '#CF1322' : (lastUpdated <= 120 && lastUpdated >= 30) ? '#FAAD14' : '#389E0D'}`}
          />
        </svg>;
      case "active":
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.28341 9.36667L11.0667 5.6L10.1167 4.65L7.28341 7.48333L5.86675 6.06667L4.93341 7L7.28341 9.36667ZM0.666748 14V12.6667H15.3334V14H0.666748ZM2.66675 12C2.30008 12 1.98619 11.8694 1.72508 11.6083C1.46397 11.3472 1.33341 11.0333 1.33341 10.6667V3.33333C1.33341 2.96667 1.46397 2.65278 1.72508 2.39167C1.98619 2.13056 2.30008 2 2.66675 2H13.3334C13.7001 2 14.014 2.13056 14.2751 2.39167C14.5362 2.65278 14.6667 2.96667 14.6667 3.33333V10.6667C14.6667 11.0333 14.5362 11.3472 14.2751 11.6083C14.014 11.8694 13.7001 12 13.3334 12H2.66675ZM2.66675 10.6667H13.3334V3.33333H2.66675V10.6667Z" fill="#389E0D" />
          </svg>

        );
      default:
        return null;
    }
  };

  const getSyncText = () => {
    switch (sync) {
      case "manual":
        return `Updated ${getLastUpdated()} ago`;
      case "inactive":
        return `Synced ${getLastUpdated()} ago`;
      case "active":
        return `Synced ${getLastUpdated()} ago`;
      default:
        return "";
    }
  };

  const getLastUpdated = () => {
    if (lastUpdated < 60) {
      return `${lastUpdated} m`;
    } else if (lastUpdated >= 60 && lastUpdated < 1440) {
      return `${Math.floor(lastUpdated / 60)} h`;
    } else if (lastUpdated >= 1440 && lastUpdated < 525600) {
      return `${Math.floor(lastUpdated / 1440)} d`;
    } else if (lastUpdated >= 525600) {
      return `${Math.floor(lastUpdated / 525600)} y`;
    }
  };

  const ChartWrapper = styled.div`
  height: 185px;
  .apexcharts-radialbar-track.apexcharts-track {
    path {
      stroke: #fff;
    }
  }
  .apexcharts-datalabel-value {
    fill: #fff
  }
`;
  const color = "#0f9d58";
  const bgColor = "#fff";
  const pctValue = 60;
  const value = 50;
  const maxValue = 100;
  const width = 200;
  const height = 200;
  const options: ApexOptions = {
    chart: {
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        startAngle: 0,
        endAngle: 360,
        track: {
          background: bgColor,
          show: true,
          strokeWidth: "100%",
          margin: 1,
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            blur: 2,
            opacity: 0.15,
          },
        },
        hollow: {
          margin: 15,
          size: '70%',
          image: backheoArm,
          imageWidth: 64,
          imageHeight: 64,
          imageClipped: false
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            show: false,
          },
        },
      },
    },
    fill: {
      colors: [color],
    },
  };


  const series = useMemo(() => {
    const value: number | undefined = 100;
    const maxValue: number | undefined = 0;
    if (typeof value === "number" && typeof maxValue === "number" && maxValue !== 0) {
      return Number(((value / maxValue) * 100).toFixed(2));
    }
    return 0;
  }, [maxValue, value]);

  return (
    <Card className="card-optimisation truck-load-profile" >
      <div className="fuel-card-header">
        <div>
          <div className="vehicle-name">
            {id}
          </div>

          <div className="fuel-card-sync">
            <div
              className="fuel-card-sync-icon"
              onMouseEnter={handleSyncHover}
              onMouseLeave={handleSyncHover}
            >
              <div className="img">{getSyncIcon()}</div>
              <div style={{ paddingLeft: '6px' }}>
                <em>{getSyncText()}</em>
              </div>
            </div>
          </div>
        </div>
        <span
          className="fuel-card-status"
          style={{ backgroundColor: statusColor }}
        >
          {status}
        </span>
      </div>
      <div className="fuel-card-details">
        <p className="fuel-card-props">
          <span className="fuel-label">Total Load</span>
          <span className="fuel-value">{loadTime}t/{loadTime}t</span>
        </p>
        <div>
          <div className="progress">
            <div
              className="progress-bar w-75"
              role="progressbar"
              aria-valuenow={25}
              aria-valuemin={0}
              aria-valuemax={100}
            >
            </div>
          </div>
        </div>
        <p className="fuel-card-props">
          <span className="fuel-label">Current Load</span>
          <span className="fuel-value">{loadTime} t</span>
        </p>
        <p className="fuel-card-props">
          <span className="fuel-label">Cycle Time</span>
          <span className="fuel-value">{passes} min</span>
        </p>
        <p className="fuel-card-props">
          <span className="fuel-label">Que Time</span>
          <span className="fuel-value">{fuelRate} min</span>
        </p>
        <p className="fuel-card-props">
          <span className="fuel-label">Load Time</span>
          <span className="fuel-value">{fuelRate} min</span>
        </p>
        <ChartWrapper>
          <Chart
            key={`${color}-${bgColor}-${pctValue}`}
            options={options}
            series={[pctValue || series]}
            type="radialBar"
            width={width}
            height={height}
          />
          <div className="text-center fw-bold">3/5</div>
        </ChartWrapper>

      </div>
    </Card>
  );
};

export default CardTruckLoadProfile;