import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { HttpError } from "../services/userService.js";
import User from "../models/User.js"; 

const SALT_ROUNDS = 10;

/**
 * Génère l'Access Token
 */
const createAccessToken = (user: any) => {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  if (!accessSecret) throw new Error("JWT_ACCESS_SECRET non configuré dans le .env");

  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    accessSecret,
    { expiresIn: "15m" }
  );
};

/**
 * Génère le Refresh Token
 */
const createRefreshToken = (user: any) => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret) throw new Error("JWT_REFRESH_SECRET non configuré dans le .env");

  return jwt.sign({ id: user.id }, refreshSecret, { expiresIn: "7d" });
};

/**
 * Inscription (POST /api/auth/register)
 */
export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new HttpError(400, "Email et mot de passe requis.");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = await User.create({
    email,
    password_hash: hashedPassword
  });

  res.status(201).json({ 
    message: "Utilisateur créé avec succès.",
    user: { id: newUser.id, email: newUser.email }
  });
};

/**
 * Connexion (POST /api/auth/login)
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  console.log("--- Tentative de connexion ---");
  console.log("Email reçu du front:", email);

  if (!email || !password) {
    throw new HttpError(400, "Email et mot de passe requis.");
  }

  // 1. Recherche de l'utilisateur
  const user = await User.findOne({ where: { email } });

  if (!user) {
    console.log("❌ ÉCHEC: Utilisateur introuvable dans la base de données.");
    throw new HttpError(401, "Identifiants invalides.");
  }

  console.log("✅ Utilisateur trouvé. Hash en base:", user.password_hash);
  console.log("Mot de passe reçu du front (clair):", password);
  console.log("Longueur du mot de passe:", password.length);
  // 2. Comparaison Bcrypt
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    console.log("❌ ÉCHEC: Le mot de passe ne correspond pas au hash.");
    throw new HttpError(401, "Identifiants invalides.");
  }

  console.log("✅ Mot de passe correct ! Génération des tokens...");

  // 3. Création des tokens
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  // Cookie HttpOnly pour le Refresh Token
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    },
  });
};

/**
 * Refresh Token (POST /api/auth/refresh)
 */
export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    throw new HttpError(400, "Refresh token manquant.");
  }

  try {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    const decoded = jwt.verify(refreshToken, refreshSecret!) as any;
    
    const user = await User.findByPk(decoded.id);
    if (!user) throw new Error();

    const newAccessToken = createAccessToken(user);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    throw new HttpError(403, "Session expirée.");
  }
};

/**
 * Profil (GET /api/auth/me)
 */
export const getProfile = async (req: Request, res: Response) => {
  // @ts-ignore
  if (!req.user) {
    throw new HttpError(401, "Non autorisé.");
  }
  // @ts-ignore
  res.status(200).json({ user: req.user });
};