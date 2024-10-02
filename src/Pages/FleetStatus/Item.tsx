import React from "react";
import {
  hd1500,
  hd785,
  pc1250,
  pc2000,
  placeHolder,
  wa600,
  d375,
  t45,
} from "assets/images/equipment";
import { getRandomInt } from "utils/random";
import TruckCard from "./components/TruckCard";
import DrillerCard from "./components/DrillerCard";
import LoaderCard from "./components/LoaderCard";
import ExcavatorCard from "./components/ExcavatorCard";

const Item = (props) => {

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
  };

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
  };

  const getCurrentLoads = (category: string) => {
    if (category === "EXCAVATOR") {
      return getRandomInt(120, 170);
    } else if (category === "DUMP_TRUCK") {
      return getRandomInt(20, 30);
    } else if (category === "LOADER") {
      return getRandomInt(40, 60);
    }
  };

  const getCurrentTonnes = (category: string, capacity: number) => {
    if (category === "EXCAVATOR") {
      return getRandomInt(120, 170);
    } else if (category === "DUMP_TRUCK") {
      let loads = getRandomInt(20, 30);
      return loads * capacity;
    } else if (category === "LOADER") {
      return getRandomInt(40, 60) * 7;
    }
  };

  const data = props.data;

  data.stateConfig = stateConfig
  data.img = getImage(data.model)
  data.stateColor = getStateColor(data.state)
  data.currentLoads = getCurrentLoads(data.category)
  data.currentTonnes = getCurrentTonnes(data.category, data.capacity)

  return (
    <React.Fragment>
      {
        data.category == 'DUMP_TRUCK' && <TruckCard data={data} units={props.units}  />
      }
      {
        data.category == 'DRILLER' && <DrillerCard data={data} />
      }
      {
        data.category == 'LOADER' && <LoaderCard data={data} units={props.units} />
      }
      {
        data.category == 'EXCAVATOR' && <ExcavatorCard data={data} units={props.units} />
      }
    </React.Fragment>
  );

};
export default Item;
