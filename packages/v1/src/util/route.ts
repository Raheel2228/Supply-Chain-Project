import { PrivilegeLevel } from "../admin/ClientPrivilegeLevelSelector";

/**
 * Constructs a path (for use in router Link/Redirect) to the
 * given destination. If destination is “home,” it redirects to
 * models or reports, depending on user privilege level.
 */
export function clientPath(
  clientId: string,
  destination:
    | "home"
    | "models"
    | "reports"
    | "datasets"
    | "users"
    | "datasetTypes",
  privilegeLevel?: PrivilegeLevel
): string {
  // Handle client “home” that redirects depending on privilege level
  let finalDestination = destination;
  if (destination === "home") {
    switch (privilegeLevel) {
      case PrivilegeLevel.CLIENT_OBSERVER:
        finalDestination = "reports";
        break;
      default:
        finalDestination = "models";
    }
  }

  return `/${finalDestination}?clientId=${clientId}`;
}
