export type UserRole = "admin" | "user" | "stagiaire";

/**
 * Valide les données d'inscription d'un utilisateur.
 *
 * Règles (spécification du TP) :
 * - Âge :
 *   - Doit être un nombre valide.
 *   - Si < 18 ans : inscription refusée (false), sauf si le rôle est "stagiaire" (true).
 *   - Si > 120 ans : lève une erreur "Âge invalide".
 * - Rôle :
 *   - N'accepte que "admin", "user" ou "stagiaire".
 *   - Toute autre valeur lève une erreur "Rôle invalide".
 * - Email :
 *   - Doit contenir un "@"" et un ".".
 *   - Sinon, retourne false.
 */
export function validateUserRegistration(
  age: number,
  role: UserRole,
  email: string,
): boolean {
  // 1. Validation de l'âge (type + bornes)
  if (typeof age !== "number" || Number.isNaN(age)) {
    throw new Error("Âge invalide");
  }

  if (age < 0 || age > 120) {
    throw new Error("Âge invalide");
  }

  // 2. Validation du rôle
  if (role !== "admin" && role !== "user" && role !== "stagiaire") {
    throw new Error("Rôle invalide");
  }

  // 3. Validation de l'email (format très simple)
  const hasAt = email.includes("@");
  const hasDot = email.includes(".");

  if (!hasAt || !hasDot) {
    // Email invalide => inscription refusée
    return false;
  }

  // 4. Logique métier liée à l'âge et au rôle
  if (age < 18) {
    // Mineur : uniquement autorisé si stagiaire
    if (role === "stagiaire") {
      return true;
    }
    return false;
  }

  // 5. Adulte / senior (18 à 120 inclus) avec email valide et rôle valide => accepté
  return true;
}


