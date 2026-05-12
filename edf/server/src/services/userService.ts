import User, { type UserRole } from "../models/User.js";

/**
 * CommonException pour les erreurs métier
 */
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

export interface CreateUserInput {
  nom: string;
  prenom: string;
  role?: string;
}

/**
 * Validates user name format
 * @throws {HttpError} If name is empty or has invalid characters
 */
function validateName(value: string, fieldLabel: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new HttpError(400, `${fieldLabel} est obligatoire.`);
  }

  if (!NAME_REGEX.test(trimmed)) {
    throw new HttpError(
      400,
      `${fieldLabel} ne peut contenir que des lettres (avec accents), l'apostrophe (') et le tiret (-).`
    );
  }

  return trimmed;
}

/**
 * Validates and normalizes user role
 * @throws {HttpError} If role is invalid
 */
function validateRole(role?: string): UserRole {
  const normalized = (role ?? "student").trim();

  if (normalized !== "student" && normalized !== "teacher") {
    throw new HttpError(400, "Le rôle doit être soit 'student', soit 'teacher'.");
  }

  return normalized;
}

/**
 * Service métier pour la gestion des utilisateurs
 * Encapsule toute la logique métier indépendante de HTTP
 */
export class UserService {
  /**
   * Récupère tous les utilisateurs
   */
  async findAll() {
    return User.findAll();
  }

  /**
   * Récupère tous les utilisateurs actifs
   */
  async findActive() {
    return User.findAll({ where: { isActive: true } });
  }

  /**
   * Crée un nouvel utilisateur avec validation
   * @throws {HttpError} En cas d'erreur de validation
   */
  async create(input: CreateUserInput) {
    const nom = validateName(input.nom, "Nom");
    const prenom = validateName(input.prenom, "Prénom");
    const role = validateRole(input.role);

    const user = await User.create({
      nom,
      prenom,
      role,
      isActive: true,
    });

    return user;
  }

  /**
   * Bascule le statut actif/inactif d'un utilisateur
   * @throws {HttpError} Si l'utilisateur n'existe pas
   */
  async toggleActive(id: number) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new HttpError(404, "Utilisateur non trouvé.");
    }

    user.isActive = !user.isActive;
    await user.save();

    return user;
  }

  /**
   * Supprime un utilisateur
   * @throws {HttpError} Si l'utilisateur n'existe pas
   */
  async delete(id: number) {
    const deletedCount = await User.destroy({ where: { id } });

    if (deletedCount === 0) {
      throw new HttpError(404, "Utilisateur non trouvé.");
    }
  }
}

// Export les fonctions pour compatibilité retroactive
export async function findAllUsers() {
  const service = new UserService();
  return service.findAll();
}

export async function findActiveUsers() {
  const service = new UserService();
  return service.findActive();
}

export async function createUser(input: CreateUserInput) {
  const service = new UserService();
  return service.create(input);
}

export async function toggleActive(id: number) {
  const service = new UserService();
  return service.toggleActive(id);
}

export async function deleteUser(id: number) {
  const service = new UserService();
  return service.delete(id);
}

