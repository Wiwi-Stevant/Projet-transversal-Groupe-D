import User from "../models/User.js";

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

/**
 * Service métier — liste des comptes (schéma PostgreSQL : email uniquement côté public).
 */
export class UserService {
  async findAll() {
    return User.findAll({
      attributes: ["id", "email", "createdAt"],
      order: [["id", "ASC"]],
    });
  }

  /**
   * Pas de colonne `is_active` dans `edf/db.sql` : même liste que `findAll`.
   */
  async findActive() {
    return this.findAll();
  }
}

export async function findAllUsers() {
  const service = new UserService();
  return service.findAll();
}

export async function findActiveUsers() {
  const service = new UserService();
  return service.findActive();
}
