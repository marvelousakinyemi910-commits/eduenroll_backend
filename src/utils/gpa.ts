import { GradeLetter } from "@prisma/client";

// Standard 5-point grading scale used across the app (matches the
// A–F letter grades called for in the product spec).
export const GRADE_POINTS: Record<GradeLetter, number> = {
  A: 5.0,
  B: 4.0,
  C: 3.0,
  D: 2.0,
  E: 1.0,
  F: 0.0,
};

export function letterToPoint(letter: GradeLetter): number {
  return GRADE_POINTS[letter];
}

interface GradedCourse {
  credits: number;
  gradePoint: number;
}

// Weighted GPA = sum(credits * gradePoint) / sum(credits)
export function computeGPA(courses: GradedCourse[]): number {
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  if (totalCredits === 0) return 0;
  const totalPoints = courses.reduce((sum, c) => sum + c.credits * c.gradePoint, 0);
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}
