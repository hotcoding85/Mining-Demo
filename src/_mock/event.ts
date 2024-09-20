import { formatTime, getShiftTimes } from "./common";
import { v4 as uuidv4 } from "uuid";

export const generateMockEventMetaData = (plans: any[]) => {
  const eventMetas = plans.flatMap((plan) =>
    plan.supporting.map((support) => ({
      id: uuidv4(),
      planId: plan.id,
      roster: plan.roster,
      materialId: plan.materialId,
      sourceId: plan.sourceId,
      destinationId: plan.destinationId,
      truckId: support,
      excavatorId: plan.vehicleId,
    }))
  );

  const events = generateEventData(eventMetas);

  return { eventMetas, events };
};

const reasons = [
  { reason: "TRAVELLING", state: "ACTIVE" },
  { reason: "QUEUING", state: "ACTIVE" },
  { reason: "LOADING", state: "ACTIVE" },
  { reason: "Smoke Break", state: "STANDBY" },
  { reason: "HOLDING", state: "ACTIVE" },
  { reason: "Crib Break", state: "DELAY" },
  { reason: "DUMPING", state: "ACTIVE" },
];

export const generateEventData = (eventMetas: any[]) => {
  const events: any[] = [];

  eventMetas.forEach((eventMeta) => {
    const { startDateTime } = getShiftTimes(eventMeta.roster);
    let currentTime = startDateTime;

    for (let trip = 1; trip <= 35; trip += 1) {
      reasons.forEach((reason) => {
        const eventStartTime = currentTime;
        const eventEndTime = new Date(currentTime.getTime() + 4 * 60000);

        events.push({
          tripId: trip.toString(),
          eventMetaId: eventMeta.id,
          roster: eventMeta.roster,
          state: reason.state,
          reason: reason.reason,
          payload: 90,
          lng: "120.44438970741732",
          lat: "-29.146627309426933",
          startTime: eventStartTime.getTime(),
          endTime: eventEndTime.getTime(),
        });

        currentTime = eventEndTime;
      });
    }
  });

  return events;
};
