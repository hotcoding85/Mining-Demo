export const getStatusColor = (status: string) => {
    switch (status) {
      case "Schedule Refuel":
        return "#f4b400"; // Yellow
      case "Critical":
        return "#db4437"; // Red
      case "Healthy":
        return "#0f9d58"; // Green
      default:
        return "#4285f4"; // Blue
    }
};

export const getSyncText = (sync, lastUpdated) => {
    switch (sync) {
      case "manual":
        return `Updated ${getLastUpdated(lastUpdated)} ago`;
      case "inactive":
        return `Synced ${getLastUpdated(lastUpdated)} ago`;
      case "ACTIVE":
        return `Synced ${getLastUpdated(lastUpdated)} ago`;
      default:
        return `Updated ${getLastUpdated(lastUpdated)} ago`;;
    }
};

export const getLastUpdated = (lastUpdated) => {
    if (lastUpdated < 60) {
      return `${lastUpdated} m`;
    } else if (lastUpdated >= 60 && lastUpdated < 1440) {
      return `${Math.floor(lastUpdated / 60)} h`;
    } else if (lastUpdated >= 1440 && lastUpdated < 525600) {
      return `${Math.floor(lastUpdated / 1440)} d`;
    } else if (lastUpdated >= 525600) {
      return `${Math.floor(lastUpdated / 525600)} y`;
    }

    return `${lastUpdated} m`;
};
export const getMinutesDifference = (lastUpdatedTime: any): number => {
    const currentDate: Date = new Date();
    const lastUpdatedDate: Date = new Date(lastUpdatedTime);
    const diffMs: number = currentDate.getTime() - lastUpdatedDate.getTime();
    const diffMinutes: number = diffMs / (1000 * 60);
    return Math.abs(diffMinutes);
  }