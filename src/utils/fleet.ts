import {
  hd1500,
  hd785,
  pc1250,
  pc2000,
  wa600,
  placeHolder,
} from "assets/images/equipment";

export const FleetName: { [key: string]: string } = {
  DUMP_TRUCK: "Trucks",
  EXCAVATOR: "Excuvator",
  LOADER: "Loader",
};

function containsCaseInsensitive(str: string, substr: string): boolean {
  return str.toLowerCase().includes(substr.toLowerCase());
}

export const getImage = (category: string) => {
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
  } else {
    return placeHolder;
  }
};

export const MaintenanceStatus = [
  "HEALTHY",
  "SCHEDULED",
  "CRITICAL",
  "NO_TRUCKS",
];

export const MaintenanceStatusConfig = {
  HEALTHY: {
    name: "Healthy",
    color: "#389E0D",
  },
  SCHEDULED: {
    name: "Schedule Refuel",
    color: "#FAAD14",
  },
  CRITICAL: {
    name: "Critical",
    color: "#CF1322",
  },
  NO_TRUCKS: {
    name: "No Trucks",
    color: "#FAAD14",
  },
};

export const getSyncText = (sync: string, lastUpdated: string) => {
  switch (sync) {
    case "manual":
      return `Updated ${lastUpdated} ago`;
    case "inactive":
      return `Synced ${lastUpdated} ago`;
    case "active":
      return `Synced ${lastUpdated} ago`;
    default:
      return "";
  }
};

export const getSyncIcon = (sync: string) => {
  switch (sync) {
    case "manual":
      return "mdi mdi-user";
    case "inactive":
      return `mdi mdi-checkbox-marked`;
    case "active":
      return `mdi mdi-checkbox-marked`;
    default:
      return "";
  }
};
