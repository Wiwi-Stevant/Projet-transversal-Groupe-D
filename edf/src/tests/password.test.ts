import { validatePassword } from "../utils/password";

describe("Password Validator - White Box Testing", () => {
  // Test initial pour initialiser le rapport de couverture
  // Ce test ne couvre que la première ligne de la fonction (Branch 1)
  it("devrait rejeter un mot de passe vide", () => {
    const result = validatePassword("", 25);
    expect(result).toBe(false);
  });

  // Longueur du mot de passe
  it("devrait rejeter un mot de passe trop court (< 8 caractères)", () => {
    const result = validatePassword("Ab1!", 25);
    expect(result).toBe(false);
  });

  it("devrait rejeter un mot de passe trop long (> 20 caractères)", () => {
    const longPwd = "Abcdefghijklmnopqrstu1!"; // > 20 caractères
    const result = validatePassword(longPwd, 25);
    expect(result).toBe(false);
  });

  // Utilisateur enfant (< 12 ans)
  it("devrait rejeter un mot de passe enfant sans lettre minuscule", () => {
    const result = validatePassword("ABCDEFG1!", 10);
    expect(result).toBe(false); // hasLowerCase === false
  });

  it("devrait accepter un mot de passe enfant avec au moins une minuscule", () => {
    const result = validatePassword("abc123!!", 10);
    expect(result).toBe(true);
  });

  // Utilisateur adulte (12 <= âge < 65) - règles strictes
  it("devrait rejeter un mot de passe adulte sans majuscule", () => {
    const result = validatePassword("abc123!!", 30); // pas de majuscule
    expect(result).toBe(false);
  });

  it("devrait rejeter un mot de passe adulte sans minuscule", () => {
    const result = validatePassword("ABC123!!", 30); // pas de minuscule
    expect(result).toBe(false);
  });

  it("devrait rejeter un mot de passe adulte sans chiffre", () => {
    const result = validatePassword("Abcdef!!", 30); // pas de chiffre
    expect(result).toBe(false);
  });

  it("devrait rejeter un mot de passe adulte sans caractère spécial", () => {
    const result = validatePassword("Abcdef12", 30); // pas de spécial
    expect(result).toBe(false);
  });

  it("devrait accepter un mot de passe adulte respectant toutes les règles", () => {
    const result = validatePassword("Abcdef1!", 30);
    expect(result).toBe(true);
  });

  // Utilisateur senior (>= 65 ans)
  it("devrait rejeter un mot de passe senior sans chiffre et sans majuscule", () => {
    const result = validatePassword("abcdef!!", 70); // pas de chiffre, pas de majuscule
    expect(result).toBe(false);
  });

  it("devrait accepter un mot de passe senior avec au moins un chiffre (même sans majuscule)", () => {
    const result = validatePassword("abcdef1!", 70); // chiffre présent, pas de majuscule
    expect(result).toBe(true);
  });
});


