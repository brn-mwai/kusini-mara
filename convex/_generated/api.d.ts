/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ack from "../ack.js";
import type * as board from "../board.js";
import type * as bookings from "../bookings.js";
import type * as broadcasts from "../broadcasts.js";
import type * as calendarq from "../calendarq.js";
import type * as duties from "../duties.js";
import type * as guests from "../guests.js";
import type * as leave from "../leave.js";
import type * as lib_base from "../lib/base.js";
import type * as lib_ids from "../lib/ids.js";
import type * as lib_tenancy from "../lib/tenancy.js";
import type * as movements from "../movements.js";
import type * as notificationsq from "../notificationsq.js";
import type * as print from "../print.js";
import type * as reports from "../reports.js";
import type * as rooms from "../rooms.js";
import type * as searchq from "../searchq.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as staffm from "../staffm.js";
import type * as stays from "../stays.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ack: typeof ack;
  board: typeof board;
  bookings: typeof bookings;
  broadcasts: typeof broadcasts;
  calendarq: typeof calendarq;
  duties: typeof duties;
  guests: typeof guests;
  leave: typeof leave;
  "lib/base": typeof lib_base;
  "lib/ids": typeof lib_ids;
  "lib/tenancy": typeof lib_tenancy;
  movements: typeof movements;
  notificationsq: typeof notificationsq;
  print: typeof print;
  reports: typeof reports;
  rooms: typeof rooms;
  searchq: typeof searchq;
  seed: typeof seed;
  settings: typeof settings;
  staffm: typeof staffm;
  stays: typeof stays;
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
