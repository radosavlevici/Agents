import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  role: text("role").default("user"),
  subscription: text("subscription").default("free"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const securityServices = pgTable("security_services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  active: boolean("active").notNull().default(true),
});

export const securityScans = pgTable("security_scans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  scanType: text("scan_type").notNull(),
  status: text("status").notNull().default("pending"),
  result: text("result"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const securityAlerts = pgTable("security_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  level: text("level").notNull(),
  message: text("message").notNull(),
  source: text("source").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  resolved: boolean("resolved").default(false),
});

export const securityReports = pgTable("security_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  threatLevel: text("threat_level").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
  subscription: true,
});

export const insertSecurityServiceSchema = createInsertSchema(securityServices).pick({
  name: true,
  description: true,
  price: true,
  active: true,
});

export const insertSecurityScanSchema = createInsertSchema(securityScans).pick({
  userId: true,
  scanType: true,
  status: true,
  result: true,
});

export const insertSecurityAlertSchema = createInsertSchema(securityAlerts).pick({
  userId: true,
  level: true,
  message: true,
  source: true,
  resolved: true,
});

export const insertSecurityReportSchema = createInsertSchema(securityReports).pick({
  userId: true,
  title: true,
  summary: true,
  threatLevel: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSecurityService = z.infer<typeof insertSecurityServiceSchema>;
export type SecurityService = typeof securityServices.$inferSelect;

export type InsertSecurityScan = z.infer<typeof insertSecurityScanSchema>;
export type SecurityScan = typeof securityScans.$inferSelect;

export type InsertSecurityAlert = z.infer<typeof insertSecurityAlertSchema>;
export type SecurityAlert = typeof securityAlerts.$inferSelect;

export type InsertSecurityReport = z.infer<typeof insertSecurityReportSchema>;
export type SecurityReport = typeof securityReports.$inferSelect;
