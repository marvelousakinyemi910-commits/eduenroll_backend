import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { hashPassword, comparePassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { RegisterInput, LoginInput } from "../validations/auth.validation";

function tokensFor(user: { id: string; email: string; role: "STUDENT" | "INSTRUCTOR" | "ADMIN" }) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id });
  return { accessToken, refreshToken };
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict("Email already registered");

  const hashed = await hashPassword(input.password);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: { email: input.email, password: hashed, role: input.role },
    });

    if (input.role === "STUDENT") {
      if (!input.departmentId || !input.level) {
        throw ApiError.badRequest("departmentId and level are required for student registration");
      }
      const studentNo = `STU-${Date.now().toString().slice(-8)}`;
      await tx.student.create({
        data: {
          userId: createdUser.id,
          studentNo,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          departmentId: input.departmentId,
          faculty: input.faculty ?? "",
          level: input.level,
        },
      });
    } else if (input.role === "ADMIN") {
      await tx.admin.create({ data: { userId: createdUser.id, fullName: input.fullName } });
    }
    // INSTRUCTOR accounts are created by an admin via the instructor module,
    // not via public self-registration.

    return createdUser;
  });

  const tokens = tokensFor(user);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });

  return { user: sanitizeUser(user), ...tokens };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) throw ApiError.unauthorized("Invalid email or password");

  const valid = await comparePassword(input.password, user.password);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  const tokens = tokensFor(user);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });

  return { user: sanitizeUser(user), ...tokens };
}

export async function logoutUser(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
}

export async function refreshTokens(token: string) {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.refreshToken !== token) {
    throw ApiError.unauthorized("Refresh token does not match");
  }

  const tokens = tokensFor(user);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });
  return tokens;
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { student: { include: { department: true } }, instructor: { include: { department: true } }, admin: true },
  });
  if (!user) throw ApiError.notFound("User not found");
  return sanitizeUser(user);
}

function sanitizeUser<T extends { password?: string; refreshToken?: string | null }>(user: T) {
  const { password, refreshToken, ...rest } = user as any;
  return rest;
}
