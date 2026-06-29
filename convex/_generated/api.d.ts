/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as arrivals from "../arrivals.js";
import type * as crons from "../crons.js";
import type * as duties from "../duties.js";
import type * as escalation from "../escalation.js";
import type * as fleet from "../fleet.js";
import type * as flights from "../flights.js";
import type * as leave from "../leave.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_events from "../lib/events.js";
import type * as lib_providers from "../lib/providers.js";
import type * as lib_tenancy from "../lib/tenancy.js";
import type * as notifications from "../notifications.js";
import type * as rooms from "../rooms.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as staff from "../staff.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  arrivals: typeof arrivals;
  crons: typeof crons;
  duties: typeof duties;
  escalation: typeof escalation;
  fleet: typeof fleet;
  flights: typeof flights;
  leave: typeof leave;
  "lib/constants": typeof lib_constants;
  "lib/events": typeof lib_events;
  "lib/providers": typeof lib_providers;
  "lib/tenancy": typeof lib_tenancy;
  notifications: typeof notifications;
  rooms: typeof rooms;
  seed: typeof seed;
  settings: typeof settings;
  staff: typeof staff;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
