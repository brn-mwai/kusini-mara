/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as anchors from "../anchors.js";
import type * as batteries from "../batteries.js";
import type * as collections from "../collections.js";
import type * as containers from "../containers.js";
import type * as interests from "../interests.js";
import type * as labels from "../labels.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_joins from "../lib/joins.js";
import type * as lib_sha256 from "../lib/sha256.js";
import type * as model_custody from "../model/custody.js";
import type * as orgs from "../orgs.js";
import type * as permits from "../permits.js";
import type * as points from "../points.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";
import type * as trail from "../trail.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  anchors: typeof anchors;
  batteries: typeof batteries;
  collections: typeof collections;
  containers: typeof containers;
  interests: typeof interests;
  labels: typeof labels;
  "lib/auth": typeof lib_auth;
  "lib/joins": typeof lib_joins;
  "lib/sha256": typeof lib_sha256;
  "model/custody": typeof model_custody;
  orgs: typeof orgs;
  permits: typeof permits;
  points: typeof points;
  reports: typeof reports;
  seed: typeof seed;
  trail: typeof trail;
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
