export function calculateShipping(
  distance: number,
  weight: number,
  type: "standard" | "express",
): number {
  // 1. Validation des entrées
  if (distance < 0) {
    throw new Error("Invalid distance");
  }

  if (weight <= 0 || weight > 50) {
    throw new Error("Invalid weight");
  }

  // 2. Calcul du coût de base (selon distance)
  let price = 0;

  if (distance <= 50) {
    price = 10;
  } else if (distance <= 500) {
    price = 25;
  } else {
    price = 50;
  }

  // 3. Application de la majoration (selon poids)
  if (weight >= 10) {
    price = price * 1.5; // +50%
  }

  // 4. Application du multiplicateur (selon type)
  if (type === "express") {
    price = price * 2;
  }

  return price;
}


