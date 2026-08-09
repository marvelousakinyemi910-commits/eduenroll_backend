import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as authService from "../services/auth.service";
import { env } from "../config/env";

const REFRESH_COOKIE = "refreshToken";
const cookieOpts = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOpts);
  res.status(201).json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOpts);
  res.status(200).json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user) await authService.logoutUser(req.user.sub);
  res.clearCookie(REFRESH_COOKIE);
  res.status(200).json({ success: true, message: "Logged out" });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: "No refresh token provided" });
  const tokens = await authService.refreshTokens(token);
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieOpts);
  res.status(200).json({ success: true, data: { accessToken: tokens.accessToken } });
});

export const profile = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user!.sub);
  res.status(200).json({ success: true, data: user });
});
