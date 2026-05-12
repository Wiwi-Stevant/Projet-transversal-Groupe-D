import {
  validateUserRegistration,
  type UserRole,
} from "../utils/userValidator";

type RegistrationCase = [
  string, // description
  number, // age
  UserRole | string, // role (on autorise aussi une valeur invalide pour les tests)
  string, // email
  boolean | Error, // résultat attendu ou erreur attendue
];

/**
 * Catalogue de tests (black-box) + quelques cas pairwise
 * couvrant les valeurs limites et les erreurs.
 */
const registrationCases: RegistrationCase[] = [
  // Email invalide (pas de @)
  ["email sans @", 25, "user", "user.example.com", false],

  // Email invalide (pas de .)
  ["email sans point", 25, "user", "user@examplecom", false],

  // Email invalide (ni @ ni .)
  ["email sans @ ni .", 25, "user", "userexamplecom", false],

  // Âge < 0 => erreur
  ["âge négatif => erreur", -1, "user", "user@example.com", new Error("Âge invalide")],

  // Âge NaN => erreur
  [
    "âge NaN => erreur",
    Number.NaN,
    "user",
    "user@example.com",
    new Error("Âge invalide"),
  ],

  // Âge > 120 => erreur
  ["âge > 120 => erreur", 121, "user", "user@example.com", new Error("Âge invalide")],

  // Rôle invalide => erreur
  ["rôle invalide => erreur", 25, "guest", "user@example.com", new Error("Rôle invalide")],

  // Mineur non stagiaire => refus
  ["mineur non stagiaire", 17, "user", "user@example.com", false],

  // Mineur stagiaire => accepté
  ["mineur stagiaire", 17, "stagiaire", "stagiaire@example.com", true],

  // Mineur stagiaire mais email invalide => refus (priorité à l'email)
  [
    "mineur stagiaire mais email invalide",
    17,
    "stagiaire",
    "stagiaireexample.com",
    false,
  ],

  // Adulte 18 ans, admin => accepté
  ["adulte 18 ans admin", 18, "admin", "admin@example.com", true],

  // Adulte 30 ans, user => accepté
  ["adulte 30 ans user", 30, "user", "user@example.com", true],

  // Senior 120 ans, stagiaire => accepté
  ["senior 120 ans stagiaire", 120, "stagiaire", "senior@example.com", true],
];

describe("validateUserRegistration - catalogue + N-wise", () => {
  test.each(registrationCases)(
    "%s",
    (_description, age, role, email, expected) => {
      if (expected instanceof Error) {
        expect(() =>
          validateUserRegistration(age, role as UserRole, email),
        ).toThrow(expected.message);
      } else {
        expect(
          validateUserRegistration(age, role as UserRole, email),
        ).toBe(expected);
      }
    },
  );
});


