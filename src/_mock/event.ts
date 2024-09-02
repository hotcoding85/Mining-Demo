import { formatTime, getShiftTimes } from "./common";

export const generateMockEventMetaData = (plans: any[]) => {
  return plans.flatMap((plan) =>
    plan.supporting.map((support) => ({
      planId: plan.id,
      roster: plan.roster,
      materialId: plan.materialId,
      sourceId: plan.sourceId,
      destinationId: plan.destinationId,
      truckId: support,
      excavatorId: plan.vehicleId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }))
  );
};

const Reasons = ["TRAVELING", "QUEUING", "LOADING", "HOLDING", "DUMPING"];

export const generateEventData = (eventMetas: any[]) => {
  const events: any[] = [];

  eventMetas.forEach((eventMeta) => {
    const { startDateTime } = getShiftTimes(eventMeta.roster);
    let currentTime = startDateTime;

    for (let trip = 1; trip <= 35; trip += 1) {
      Reasons.forEach((reason) => {
        const eventStartTime = currentTime;
        const eventEndTime = new Date(currentTime.getTime() + 4 * 60000);

        events.push({
          tripId: trip.toString(),
          materialId: eventMeta.materialId,
          sourceId: eventMeta.sourceId,
          destinationId: eventMeta.destinationId,
          truckId: eventMeta.truckId,
          excavatorId: eventMeta.excavatorId,
          status: "ACTIVE",
          reason: reason,
          payload: 90,
          startTime: formatTime(eventStartTime),
          endTime: formatTime(eventEndTime),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        currentTime = eventEndTime;
      });
    }
  });

  return events;
};
