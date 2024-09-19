import React from "react";
import { Card, CardBody } from "reactstrap";
import { round } from "lodash";
import { getImage } from "utils/fleet";
import { hd1500, hd785, pc1250, pc2000, placeHolder, wa600, d375, t45 } from "assets/images/equipment";
import { divide12HoursRandomlyFormatted, minutesToHhMm, round2One } from "utils/common";
import { getRandomInt } from "utils/random";

const Item = (data: any) => {
  const stateConfig = [
    {
      name: "Active",
      key: "ACTIVE",
      color: "#14E010",
    },
    {
      name: "Standby",
      key: "STANDBY",
      color: "#F7B31A",
    },
    {
      name: "Delay",
      key: "DELAY",
      color: "#9143DE",
    },
    {
      name: "Down",
      key: "DOWN",
      color: "#ED3A0F",
    },
  ];

  const getStateColor = (state) => {
    switch (state) {
      case "ACTIVE":
        return "#009D10";
      case "STANDBY":
        return "#F7B31A";
      case "DELAY":
        return "#9143DE";
      case "DOWN":
        return "#ED3A0F";
      default:
        return "#F7B31A";
    }
  }

  function containsCaseInsensitive(str: string, substr: string): boolean {
    return str.toLowerCase().includes(substr.toLowerCase());
  }

  const getImage = (category: string) => {
    if (!category) {
      return placeHolder;
    }

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
    } else if (containsCaseInsensitive(category, "d375")) {
      return d375;
    } else if (containsCaseInsensitive(category, "t45")) {
      return t45;
    } else {
      return placeHolder;
    }
  }

  const imageStyle: React.CSSProperties = {
    height: "7.5rem",
  };

  const getStateValue = (stateInfo, key: string) => {
    let info = stateInfo.find((info) => info.state === key);
    return info ? info.hours : "00:00";
  };

  const statusColor = "#F7B31A";
  console.log(data.data)

  const getCurrentLoads = (category: string) => {
    if(category == 'EXCAVATOR') {
      return getRandomInt(120, 170);
    } else if (category == 'DUMP_TRUCK') {
      return getRandomInt(20, 30)
    } else if (category == 'LOADER') {
      return getRandomInt(40, 60)
    }
  }

  const getCurrentTonnes = (category: string, capacity: number) => {
    
    if(category == 'EXCAVATOR') {
      return getRandomInt(120, 170);
    } else if (category == 'DUMP_TRUCK') {
      let loads = getRandomInt(20, 30)
      console.log(category, capacity, loads)
      return loads * capacity
    } else if (category == 'LOADER') {
      return getRandomInt(40, 60) * 7
    }
  }
  
  return (
    <React.Fragment>
      <Card className="status-card">
        <div className="status-card-header">
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.6em', fontWeight: '500' }}>{data.data.name}</span>
            <span>{(data.model)}</span>
          </div>
          <span className="card-status" style={{ backgroundColor: getStateColor(data.data.state) }}>{data.data.state}</span>
        </div>
        <div className="status-card-secondary-header">
          <div style={{ fontSize: '16px' }}>J. Brown</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
            <div className="img">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.99996 5.99996C5.26663 5.99996 4.63885 5.73885 4.11663 5.21663C3.5944 4.6944 3.33329 4.06663 3.33329 3.33329C3.33329 2.59996 3.5944 1.97218 4.11663 1.44996C4.63885 0.927737 5.26663 0.666626 5.99996 0.666626C6.73329 0.666626 7.36107 0.927737 7.88329 1.44996C8.40551 1.97218 8.66663 2.59996 8.66663 3.33329C8.66663 4.06663 8.40551 4.6944 7.88329 5.21663C7.36107 5.73885 6.73329 5.99996 5.99996 5.99996ZM0.666626 11.3333V9.46663C0.666626 9.08885 0.763959 8.74151 0.958626 8.42463C1.15285 8.10818 1.41107 7.86663 1.73329 7.69996C2.42218 7.35551 3.12218 7.09707 3.83329 6.92463C4.5444 6.75263 5.26663 6.66663 5.99996 6.66663C6.73329 6.66663 7.45551 6.75263 8.16663 6.92463C8.87774 7.09707 9.57774 7.35551 10.2666 7.69996C10.5888 7.86663 10.8471 8.10818 11.0413 8.42463C11.236 8.74151 11.3333 9.08885 11.3333 9.46663V11.3333H0.666626Z"
                  fill='#CF1322' />
              </svg>
            </div>
            <em style={{ marginLeft: '4px' }}>Updated {getRandomInt(1,5)}m ago</em>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", padding: '0px 16px', marginTop: '16px' }}>
          <div style={{ flex: '1', }}>
            <div className="loadsView" style={{ display: 'flex', flex: '1', alignItems: 'baseline', justifyContent: 'center', alignContent: 'center', borderRadius: '6px', padding: '8px 16px', }}>
              <div>
                <span style={{ fontSize: '2.0em', fontWeight: '500' }}>{getCurrentLoads(data.data.category)}<span style={{ fontSize: '0.6em' }}>{ data.data.category && data.data.category == 'DRILLER' ? '' : '/'+data.data.plannedLoads}</span></span>
              </div>
              <span style={{ marginLeft: '6px', fontSize: '18px' }}>{ data.data.category && data.data.category == 'DRILLER' ? 'Holes' : 'Loads'}</span>
            </div>
            <div>
              {
                isNaN(data.data.plannedTonnes) ? '' : <div className="tonnesView" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px', marginTop: '8px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '2.0em', fontWeight: '500' }}>{getCurrentTonnes(data.data.category, data.data.capacity)}<span style={{ fontSize: '0.6em' }}>/{data.data.plannedTonnes} t</span></span></div>
              }
            </div>
          </div>

          <div style={{ display: 'flex', flex: '.7', placeContent: 'flex-end', justifyContent: 'end', }}>
            <img src={getImage(data.data.model)} width={'100px'} />
          </div>
        </div>

        <div className="d-flex justify-content-between gap-2 text-muted" style={{ padding: '0px 16px', marginTop: '8px' }}>
          {stateConfig.map((config, key) => {
            const hours = divide12HoursRandomlyFormatted(stateConfig.length)
            return (
              <div className='d-flex align-items-center'>
                {/* <i className='bx bxs-circle font-size-12' style={{ color: config.color }}></i> */}
                <span style={{ margin: '0 0 0 1px', fontSize: '1.6em', color: config.color }}>{hours[key]}</span>
              </div>
            )
          })}
        </div>
      </Card>
    </React.Fragment>
  );
};
export default Item;
