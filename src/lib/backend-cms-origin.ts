const LOCAL_BACKEND_CMS_ORIGIN = "http://localhost:3001";

export function resolveBackendCMSOrigin(
  configured: string | undefined,
  isDevelopment: boolean,
): string | undefined {
  if (configured) return new URL(configured).origin;
  if (isDevelopment) return LOCAL_BACKEND_CMS_ORIGIN;

  console.warn(
    "VITE_BACKEND_CMS_ORIGIN is not set; News Articles and Live Preview are unavailable in this build.",
  );
  return undefined;
}

export const BACKEND_CMS_ORIGIN = resolveBackendCMSOrigin(
  import.meta.env.VITE_BACKEND_CMS_ORIGIN,
  import.meta.env.DEV,
);
