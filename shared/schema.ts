import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Pitch Practice AI schemas
export const pitchPracticeMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export const pitchPracticeRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  conversationHistory: z.array(pitchPracticeMessageSchema).optional().default([]),
});

export type PitchPracticeMessage = z.infer<typeof pitchPracticeMessageSchema>;
export type PitchPracticeRequest = z.infer<typeof pitchPracticeRequestSchema>;

// Equity Dilution Calculator schemas
export const equityCalculationRequestSchema = z.object({
  currentOwnership: z.number().min(0).max(100),
  fundraisingAmount: z.number().min(0),
  preMoneyValuation: z.number().min(0),
});

export const equityCalculationResultSchema = z.object({
  preMoneyValuation: z.number(),
  postMoneyValuation: z.number(),
  newInvestorOwnership: z.number(),
  founderOwnershipAfter: z.number(),
  fundraisingAmount: z.number(),
  sharePrice: z.number(),
  dilutionPercentage: z.number(),
});

export type EquityCalculationRequest = z.infer<typeof equityCalculationRequestSchema>;
export type EquityCalculationResult = z.infer<typeof equityCalculationResultSchema>;

// Pitch Deck Audit schemas
export const pitchDeckCriteriaScoreSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(10),
  feedback: z.string(),
});

export const pitchDeckAuditResultSchema = z.object({
  totalScore: z.number().min(0).max(100),
  status: z.enum(['not_ready', 'promising', 'investment_ready']),
  summaryReport: z.string(),
  criteriaScores: z.array(pitchDeckCriteriaScoreSchema),
  suggestedQuestions: z.array(z.string()),
});

export type PitchDeckCriteriaScore = z.infer<typeof pitchDeckCriteriaScoreSchema>;
export type PitchDeckAuditResult = z.infer<typeof pitchDeckAuditResultSchema>;
