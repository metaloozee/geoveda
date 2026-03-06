const TRACE_ROUTE_PREFIX = "/trace/";

const siteUrl = process.env.SITE_URL;

if (!siteUrl) {
  throw new Error("SITE_URL is required to build trace QR URLs");
}

const buildTracePath = (lotNumber: string): string => {
  return `${TRACE_ROUTE_PREFIX}${encodeURIComponent(lotNumber)}`;
};

export const buildTraceUrl = (lotNumber: string): string => {
  return new URL(buildTracePath(lotNumber), siteUrl).toString();
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
