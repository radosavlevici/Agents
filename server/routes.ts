import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertSecurityScanSchema, 
  insertSecurityAlertSchema, insertSecurityReportSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for the Quantum Terminal Cybersecurity Platform
  
  // User API
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      // Don't send the password back in the response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: "Failed to create user" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Don't send the password back in the response
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ error: "Login failed" });
    }
  });
  
  // Security Services API
  app.get("/api/services", async (_req, res) => {
    try {
      const services = await storage.getSecurityServices();
      return res.status(200).json(services);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch security services" });
    }
  });
  
  app.get("/api/services/:id", async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      if (isNaN(serviceId)) {
        return res.status(400).json({ error: "Invalid service ID" });
      }
      
      const service = await storage.getSecurityService(serviceId);
      
      if (!service) {
        return res.status(404).json({ error: "Security service not found" });
      }
      
      return res.status(200).json(service);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch security service" });
    }
  });
  
  // Security Scans API
  app.get("/api/scans", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const scans = await storage.getSecurityScans(userId);
      return res.status(200).json(scans);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch security scans" });
    }
  });
  
  app.get("/api/scans/:id", async (req, res) => {
    try {
      const scanId = parseInt(req.params.id);
      if (isNaN(scanId)) {
        return res.status(400).json({ error: "Invalid scan ID" });
      }
      
      const scan = await storage.getSecurityScan(scanId);
      
      if (!scan) {
        return res.status(404).json({ error: "Security scan not found" });
      }
      
      return res.status(200).json(scan);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch security scan" });
    }
  });
  
  app.post("/api/scans", async (req, res) => {
    try {
      const scanData = insertSecurityScanSchema.parse(req.body);
      const scan = await storage.createSecurityScan(scanData);
      
      // Simulate a scan process
      setTimeout(async () => {
        const results = ["No threats found", "Possible intrusion detected", "Vulnerable software found"];
        const statusOptions = ["completed", "failed", "cancelled"];
        const randomResult = results[Math.floor(Math.random() * results.length)];
        const randomStatus = Math.random() > 0.2 ? "completed" : statusOptions[Math.floor(Math.random() * statusOptions.length)];
        
        await storage.updateSecurityScan(scan.id, {
          status: randomStatus,
          result: randomResult,
          completedAt: new Date()
        });
      }, 5000);
      
      return res.status(201).json(scan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: "Failed to create security scan" });
    }
  });
  
  // Security Alerts API
  app.get("/api/alerts", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const alerts = await storage.getSecurityAlerts(userId);
      return res.status(200).json(alerts);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch security alerts" });
    }
  });
  
  app.get("/api/alerts/:id", async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      if (isNaN(alertId)) {
        return res.status(400).json({ error: "Invalid alert ID" });
      }
      
      const alert = await storage.getSecurityAlert(alertId);
      
      if (!alert) {
        return res.status(404).json({ error: "Security alert not found" });
      }
      
      return res.status(200).json(alert);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch security alert" });
    }
  });
  
  app.post("/api/alerts", async (req, res) => {
    try {
      const alertData = insertSecurityAlertSchema.parse(req.body);
      const alert = await storage.createSecurityAlert(alertData);
      return res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: "Failed to create security alert" });
    }
  });
  
  app.patch("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      if (isNaN(alertId)) {
        return res.status(400).json({ error: "Invalid alert ID" });
      }
      
      const alert = await storage.resolveSecurityAlert(alertId);
      
      if (!alert) {
        return res.status(404).json({ error: "Security alert not found" });
      }
      
      return res.status(200).json(alert);
    } catch (error) {
      return res.status(500).json({ error: "Failed to resolve security alert" });
    }
  });
  
  // Security Reports API
  app.get("/api/reports", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const reports = await storage.getSecurityReports(userId);
      return res.status(200).json(reports);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch security reports" });
    }
  });
  
  app.get("/api/reports/:id", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      if (isNaN(reportId)) {
        return res.status(400).json({ error: "Invalid report ID" });
      }
      
      const report = await storage.getSecurityReport(reportId);
      
      if (!report) {
        return res.status(404).json({ error: "Security report not found" });
      }
      
      return res.status(200).json(report);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch security report" });
    }
  });
  
  app.post("/api/reports", async (req, res) => {
    try {
      const reportData = insertSecurityReportSchema.parse(req.body);
      const report = await storage.createSecurityReport(reportData);
      return res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: "Failed to create security report" });
    }
  });
  
  // System status API
  app.get("/api/system/status", async (_req, res) => {
    try {
      const statuses = [
        { name: "System Integration", status: "ACTIVE" },
        { name: "Reset Workflow", status: "ACTIVE" },
        { name: "Development Enabler", status: "ACTIVE" },
        { name: "DNA Protection", status: "ACTIVE" },
        { name: "Simultaneous Processes", status: "ACTIVE" }
      ];
      
      return res.status(200).json(statuses);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch system status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
