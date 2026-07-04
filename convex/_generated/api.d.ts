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
import type * as duties from "../duties.js";
import type * as lib_base from "../lib/base.js";
import type * as lib_ids from "../lib/ids.js";
import type * as lib_tenancy from "../lib/tenancy.js";
import type * as movements from "../movements.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ack: typeof ack;
  board: typeof board;
  duties: typeof duties;
  "lib/base": typeof lib_base;
  "lib/ids": typeof lib_ids;
  "lib/tenancy": typeof lib_tenancy;
  movements: typeof movements;
  seed: typeof seed;
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
