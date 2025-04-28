import { 
  type User, type InsertUser,
  type SecurityService, type InsertSecurityService,
  type SecurityScan, type InsertSecurityScan,
  type SecurityAlert, type InsertSecurityAlert,
  type SecurityReport, type InsertSecurityReport
} from "@shared/schema";

// Interfaces for all business entities
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Security Services methods
  getSecurityServices(): Promise<SecurityService[]>;
  getSecurityService(id: number): Promise<SecurityService | undefined>;
  createSecurityService(service: InsertSecurityService): Promise<SecurityService>;
  
  // Security Scans methods
  getSecurityScans(userId?: number): Promise<SecurityScan[]>;
  getSecurityScan(id: number): Promise<SecurityScan | undefined>;
  createSecurityScan(scan: InsertSecurityScan): Promise<SecurityScan>;
  updateSecurityScan(id: number, data: Partial<SecurityScan>): Promise<SecurityScan | undefined>;
  
  // Security Alerts methods
  getSecurityAlerts(userId?: number): Promise<SecurityAlert[]>;
  getSecurityAlert(id: number): Promise<SecurityAlert | undefined>;
  createSecurityAlert(alert: InsertSecurityAlert): Promise<SecurityAlert>;
  resolveSecurityAlert(id: number): Promise<SecurityAlert | undefined>;
  
  // Security Reports methods
  getSecurityReports(userId?: number): Promise<SecurityReport[]>;
  getSecurityReport(id: number): Promise<SecurityReport | undefined>;
  createSecurityReport(report: InsertSecurityReport): Promise<SecurityReport>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private securityServices: Map<number, SecurityService>;
  private securityScans: Map<number, SecurityScan>;
  private securityAlerts: Map<number, SecurityAlert>;
  private securityReports: Map<number, SecurityReport>;
  
  private userIdCounter: number;
  private serviceIdCounter: number;
  private scanIdCounter: number;
  private alertIdCounter: number;
  private reportIdCounter: number;

  constructor() {
    this.users = new Map();
    this.securityServices = new Map();
    this.securityScans = new Map();
    this.securityAlerts = new Map();
    this.securityReports = new Map();
    
    this.userIdCounter = 1;
    this.serviceIdCounter = 1;
    this.scanIdCounter = 1;
    this.alertIdCounter = 1;
    this.reportIdCounter = 1;
    
    // Initialize with some default security services
    this.initDefaultServices();
  }

  private initDefaultServices() {
    const defaultServices = [
      {
        name: "Basic System Scan",
        description: "Scans your system for basic vulnerabilities and security issues.",
        price: "9.99",
        active: true
      },
      {
        name: "Advanced Threat Detection",
        description: "Deep analysis of potential security threats with real-time monitoring.",
        price: "29.99",
        active: true
      },
      {
        name: "Quantum Encryption Shield",
        description: "State-of-the-art encryption using quantum algorithms to protect your data.",
        price: "49.99",
        active: true
      },
      {
        name: "Secure Network Analysis",
        description: "Comprehensive evaluation of network security and potential vulnerabilities.",
        price: "39.99",
        active: true
      }
    ];
    
    defaultServices.forEach(service => {
      this.createSecurityService(service as InsertSecurityService);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      name: insertUser.name || null,
      email: insertUser.email || null,
      role: insertUser.role || 'user',
      subscription: insertUser.subscription || 'free'
    };
    this.users.set(id, user);
    return user;
  }
  
  // Security Services methods
  async getSecurityServices(): Promise<SecurityService[]> {
    return Array.from(this.securityServices.values());
  }
  
  async getSecurityService(id: number): Promise<SecurityService | undefined> {
    return this.securityServices.get(id);
  }
  
  async createSecurityService(service: InsertSecurityService): Promise<SecurityService> {
    const id = this.serviceIdCounter++;
    const securityService: SecurityService = { 
      ...service, 
      id,
      active: service.active !== undefined ? service.active : true
    };
    this.securityServices.set(id, securityService);
    return securityService;
  }
  
  // Security Scans methods
  async getSecurityScans(userId?: number): Promise<SecurityScan[]> {
    const scans = Array.from(this.securityScans.values());
    if (userId) {
      return scans.filter(scan => scan.userId === userId);
    }
    return scans;
  }
  
  async getSecurityScan(id: number): Promise<SecurityScan | undefined> {
    return this.securityScans.get(id);
  }
  
  async createSecurityScan(scan: InsertSecurityScan): Promise<SecurityScan> {
    const id = this.scanIdCounter++;
    const startedAt = new Date();
    const securityScan: SecurityScan = { 
      ...scan, 
      id, 
      startedAt,
      status: scan.status || 'pending',
      completedAt: null
    };
    this.securityScans.set(id, securityScan);
    return securityScan;
  }
  
  async updateSecurityScan(id: number, data: Partial<SecurityScan>): Promise<SecurityScan | undefined> {
    const scan = this.securityScans.get(id);
    if (!scan) return undefined;
    
    const updatedScan = { ...scan, ...data };
    this.securityScans.set(id, updatedScan);
    return updatedScan;
  }
  
  // Security Alerts methods
  async getSecurityAlerts(userId?: number): Promise<SecurityAlert[]> {
    const alerts = Array.from(this.securityAlerts.values());
    if (userId) {
      return alerts.filter(alert => alert.userId === userId);
    }
    return alerts;
  }
  
  async getSecurityAlert(id: number): Promise<SecurityAlert | undefined> {
    return this.securityAlerts.get(id);
  }
  
  async createSecurityAlert(alert: InsertSecurityAlert): Promise<SecurityAlert> {
    const id = this.alertIdCounter++;
    const timestamp = new Date();
    const securityAlert: SecurityAlert = { 
      ...alert, 
      id, 
      timestamp,
      resolved: alert.resolved || false
    };
    this.securityAlerts.set(id, securityAlert);
    return securityAlert;
  }
  
  async resolveSecurityAlert(id: number): Promise<SecurityAlert | undefined> {
    const alert = this.securityAlerts.get(id);
    if (!alert) return undefined;
    
    alert.resolved = true;
    this.securityAlerts.set(id, alert);
    return alert;
  }
  
  // Security Reports methods
  async getSecurityReports(userId?: number): Promise<SecurityReport[]> {
    const reports = Array.from(this.securityReports.values());
    if (userId) {
      return reports.filter(report => report.userId === userId);
    }
    return reports;
  }
  
  async getSecurityReport(id: number): Promise<SecurityReport | undefined> {
    return this.securityReports.get(id);
  }
  
  async createSecurityReport(report: InsertSecurityReport): Promise<SecurityReport> {
    const id = this.reportIdCounter++;
    const createdAt = new Date();
    const securityReport: SecurityReport = { ...report, id, createdAt };
    this.securityReports.set(id, securityReport);
    return securityReport;
  }
}

export const storage = new MemStorage();
