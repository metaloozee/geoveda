const TRACE_ROUTE_PREFIX = "/trace/";

const buildTracePath = (lotNumber: string): string => {
  return `${TRACE_ROUTE_PREFIX}${encodeURIComponent(lotNumber)}`;
};

const resolveAppOrigin = (): string => {
  const siteUrl = process.env.SITE_URL?.trim();
  if (siteUrl) {
    return siteUrl;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3005";
};

export const buildTraceUrl = (lotNumber: string): string => {
  return new URL(buildTracePath(lotNumber), resolveAppOrigin()).toString();
};

export type ScanNavigationTarget =
  | {
      type: "external";
      href: string;
    }
  | {
      type: "internal";
      href: string;
    };

export const resolveScanNavigationTarget = (
  rawValue: string,
  currentOrigin: string
): ScanNavigationTarget => {
  try {
    const parsedUrl = new URL(rawValue);

    if (parsedUrl.origin === currentOrigin) {
      return {
        type: "internal",
        href: `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
      };
    }

    return {
      type: "external",
      href: parsedUrl.toString(),
    };
  } catch {
    return {
      type: "internal",
      href: buildTracePath(rawValue),
    };
  }
};
