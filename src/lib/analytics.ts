export interface AnalyticsEventProperties {
  newsletter_subscribed: {
    page: "home";
    form_type: "newsletter";
    email_domain: string;
  };
}

export type AnalyticsCapture = <EventName extends keyof AnalyticsEventProperties>(
  eventName: EventName,
  properties: AnalyticsEventProperties[EventName],
) => void;

const noOpCapture: AnalyticsCapture = () => undefined;

let captureImplementation: AnalyticsCapture = noOpCapture;

export function setAnalyticsCapture(
  implementation?: AnalyticsCapture,
): void {
  captureImplementation = implementation ?? noOpCapture;
}

export function captureAnalyticsEvent<
  EventName extends keyof AnalyticsEventProperties,
>(
  eventName: EventName,
  properties: AnalyticsEventProperties[EventName],
): void {
  try {
    captureImplementation(eventName, properties);
  } catch {
    // Analytics is observational and must never alter application behavior.
  }
}
