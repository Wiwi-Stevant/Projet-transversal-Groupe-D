import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UniqueConstraintError } from "sequelize";
import User from "../models/User.js";
import { HttpError } from "./userService.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AuthUserPayload {
  id: number;
  email: string;
}

function normalizeEmail(email: unknown): string {
  if (typeof email !== "string") {
    throw new HttpError(400, "Email invalide.");
  }
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
    throw new HttpError(400, "Format d’email invalide.");
  }
  return trimmed;
}

function validatePassword(password: unknown): string {
  if (typeof password !== "string" || password.length < 8) {
    throw new HttpError(400, "Le mot de passe doit contenir au moins 8 caractères.");
  }
  return password;
}

function toUserId(raw: unknown): number {
  if (typeof raw === "bigint") {
    return Number(raw);
  }
  const n = typeof raw === "string" ? Number(raw) : Number(raw);
  if (!Number.isFinite(n)) {
    throw new Error("ID utilisateur invalide.");
  }
  return n;
}

export async function registerUser(
  emailRaw: unknown,
  passwordRaw: unknown,
): Promise<AuthUserPayload> {
  const email = normalizeEmail(emailRaw);
  const password = validatePassword(passwordRaw);
  const password_hash = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ email, password_hash });
    return { id: toUserId(user.id), email: user.email };
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      throw new HttpError(409, "Cette adresse e-mail est déjà utilisée.");
    }
    throw err;
  }
}

export async function loginUser(
  emailRaw: unknown,
  passwordRaw: unknown,
): Promise<AuthUserPayload> {
  const email = normalizeEmail(emailRaw);
  if (typeof passwordRaw !== "string" || !passwordRaw) {
    throw new HttpError(400, "Mot de passe requis.");
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new HttpError(401, "Identifiants invalides.");
  }

  const ok = await bcrypt.compare(passwordRaw, user.password_hash);
  if (!ok) {
    throw new HttpError(401, "Identifiants invalides.");
  }

  return { id: toUserId(user.id), email: user.email };
}

export function createAccessToken(user: AuthUserPayload): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET non configuré");
  }
  return jwt.sign(
    { id: user.id, email: user.email },
    secret,
    { expiresIn: "15m", subject: String(user.id) },
  );
}

export function createRefreshToken(user: AuthUserPayload): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET non configuré");
  }
  return jwt.sign(
    { id: user.id, email: user.email },
    secret,
    { expiresIn: "7d", subject: String(user.id) },
  );
}

export async function loginWithTokens(
  emailRaw: unknown,
  passwordRaw: unknown,
): Promise<{ user: AuthUserPayload; accessToken: string; refreshToken: string }> {
  const user = await loginUser(emailRaw, passwordRaw);
  return {
    user,
    accessToken: createAccessToken(user),
    refreshToken: createRefreshToken(user),
  };
}
