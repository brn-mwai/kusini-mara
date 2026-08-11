import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  allNavHrefs,
  breadcrumbFor,
  CONSOLES,
} from "../src/lib/console-routes";

const APP_DIR = path.resolve(__dirname, "../src/app");

describe("console route registry", () => {
  it("every nav link points at a route that exists on disk", () => {
    for (const href of allNavHrefs()) {
      const page = path.join(APP_DIR, ...href.split("/").filter(Boolean), "page.tsx");
      expect(existsSync(page), `${href} → ${page}`).toBe(true);
    }
  });

  it("public and record routes exist", () => {
    for (const route of [
      "page.tsx",
      "impact/page.tsx",
      "q/[token]/page.tsx",
      "v/[reportId]/page.tsx",
      "field/collect/[containerId]/page.tsx",
      "admin/labels/[batchId]/print/page.tsx",
      "oem/records/[reportId]/page.tsx",
    ]) {
      expect(existsSync(path.join(APP_DIR, route)), route).toBe(true);
    }
  });

  it("basePath matches every console key's first group", () => {
    for (const def of Object.values(CONSOLES)) {
      expect(def.groups.length).toBeGreaterThan(0);
      for (const group of def.groups) {
        for (const item of group.items) {
          expect(item.href.startsWith(def.basePath), item.href).toBe(true);
        }
      }
    }
  });

  it("breadcrumbs resolve exact and nested paths", () => {
    expect(breadcrumbFor("admin", "/admin")).toEqual({
      section: "Control Tower",
      page: "Dashboard",
    });
    expect(breadcrumbFor("admin", "/admin/batteries")).toEqual({
      section: "Control Tower",
      page: "Batteries",
    });
    expect(breadcrumbFor("oem", "/oem/records/CC-123").page).toBe("Records");
  });
});
