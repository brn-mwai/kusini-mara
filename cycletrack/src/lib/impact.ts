// Indicative avoided-burden averages for a mixed portable lithium-ion battery
// stream. These are deliberately conservative sector averages for public
// communication — NOT a certified footprint, and the UI must say so.

export const IMPACT_FACTORS = {
  /** kg CO2e avoided per kg of battery diverted to recovery (indicative). */
  avoidedCo2ePerKg: 2.1,
  /** Recoverable material yields per kg of mixed stream (indicative). */
  materials: [
    { name: "Aluminium & steel", kgPerKg: 0.24 },
    { name: "Copper", kgPerKg: 0.09 },
    { name: "Nickel", kgPerKg: 0.08 },
    { name: "Graphite", kgPerKg: 0.12 },
    { name: "Lithium (as carbonate)", kgPerKg: 0.035 },
    { name: "Cobalt", kgPerKg: 0.02 },
  ],
} as const;

export type ImpactResult = {
  avoidedCo2eKg: number;
  materials: { name: string; kg: number }[];
};

export function computeImpact(weightKg: number): ImpactResult {
  return {
    avoidedCo2eKg: weightKg * IMPACT_FACTORS.avoidedCo2ePerKg,
    materials: IMPACT_FACTORS.materials.map((m) => ({
      name: m.name,
      kg: weightKg * m.kgPerKg,
    })),
  };
}
