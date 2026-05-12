import { calculateShipping } from "../utils/shipping";

type ShippingType = "standard" | "express";

type ShippingCase = [
  string, // description
  number, // distance
  number, // weight
  ShippingType, // type
  number | Error, // expected result or error
];

const shippingCases: ShippingCase[] = [
  // Cas normaux
  ["distance courte, poids léger, standard", 10, 5, "standard", 10],
  ["distance courte, poids léger, express", 10, 5, "express", 20],

  // Bordures distance
  ["distance 0 km, poids 5kg, standard", 0, 5, "standard", 10],
  ["distance 50 km, poids 5kg, standard", 50, 5, "standard", 10],
  ["distance 51 km, poids 5kg, standard", 51, 5, "standard", 25],
  ["distance 500 km, poids 5kg, standard", 500, 5, "standard", 25],
  ["distance 501 km, poids 5kg, standard", 501, 5, "standard", 50],

  // Bordures poids
  ["poids 10kg, standard", 10, 10, "standard", 15],
  ["poids 50kg, standard", 10, 50, "standard", 15],

  // Hors limites distance
  ["distance négative => erreur", -1, 10, "standard", new Error("Invalid distance")],

  // Hors limites poids
  ["poids 0 => erreur", 10, 0, "standard", new Error("Invalid weight")],
  ["poids > 50 => erreur", 10, 51, "standard", new Error("Invalid weight")],
];

describe("calculateShipping - catalogue de tests", () => {
  test.each(shippingCases)(
    "%s",
    (_description, distance, weight, type, expected) => {
      if (expected instanceof Error) {
        expect(() => calculateShipping(distance, weight, type)).toThrow(
          expected.message,
        );
      } else {
        expect(calculateShipping(distance, weight, type)).toBe(expected);
      }
    },
  );
});

// 5.2 - N-Wise (Pairwise) testing : 6 scénarios valides
const nWiseCases: ShippingCase[] = [
  // 1 - D1 (courte), W1 (léger), T1 (standard)
  ["NWise-1 D1 W1 T1", 10, 5, "standard", 10],

  // 2 - D1 (courte), W2 (lourd), T2 (express)
  ["NWise-2 D1 W2 T2", 10, 20, "express", 30],

  // 3 - D2 (moyenne), W1 (léger), T2 (express)
  ["NWise-3 D2 W1 T2", 100, 5, "express", 50],

  // 4 - D2 (moyenne), W2 (lourd), T1 (standard)
  ["NWise-4 D2 W2 T1", 100, 20, "standard", 37.5],

  // 5 - D3 (longue), W1 (léger), T2 (express)
  ["NWise-5 D3 W1 T2", 600, 5, "express", 100],

  // 6 - D3 (longue), W2 (lourd), T1 (standard)
  ["NWise-6 D3 W2 T1", 600, 20, "standard", 75],
];

describe("calculateShipping - N-wise (pairwise)", () => {
  test.each(nWiseCases)(
    "%s",
    (_description, distance, weight, type, expected) => {
      expect(calculateShipping(distance, weight, type)).toBe(expected);
    },
  );
});


