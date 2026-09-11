export type Role = 'ROLE_ADMIN' | 'ROLE_DISPATCHER' | 'ROLE_TECHNICIAN' | 'ROLE_CUSTOMER' | 'ROLE_AUDITOR';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
}

export interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  role: Role;
  customerProfile?: CustomerProfile | null;
  technicianProfile?: Technician | null;
}

export interface JwtResponse {
  id: number;
  token: string;
  refreshToken: string;
  username: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Customers Module
export interface CustomerProfile {
  id: number;
  companyName: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Building {
  id: number;
  customerProfile?: CustomerProfile;
  name: string;
  address: string;
}

export interface Site {
  id: number;
  building?: Building;
  name: string;
  description: string;
}

export interface Contact {
  id: number;
  customerProfile?: CustomerProfile;
  name: string;
  email: string;
  phone: string;
  role: string;
}

// Customer Requests
export type CustomerRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface CustomerRequest {
  id: number;
  customer: User;
  title: string;
  description: string;
  category: string;
  status: CustomerRequestStatus;
  createdAt: string;
}

// Work Orders
export type WorkOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface WorkOrder {
  id: number;
  title: string;
  description: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignedTechnician?: Technician | null;
  customerRequest?: CustomerRequest | null;
  location: string;
  scheduledDate?: string | null;
  completedDate?: string | null;
  partsUsed?: string;
  timeSpentMinutes: number;
  createdAt: string;
}

// Technicians
export type TechnicianStatus = 'AVAILABLE' | 'ON_SITE' | 'OFF_DUTY';

export interface Technician {
  id: number;
  user?: User;
  name: string;
  skills: string;
  status: TechnicianStatus;
  contactNumber: string;
  rating: number;
  shift?: string;
}

export interface Attendance {
  id: number;
  technician?: Technician;
  date: string;
  checkIn: string;
  checkOut?: string | null;
  status: string;
}

export interface TechnicianPerformance {
  technicianId: number;
  name: string;
  rating: number;
  completedWorkOrdersCount: number;
  averageCompletionTimeMinutes: number;
  slaComplianceRate: number;
}

// Assets
export interface Asset {
  id: number;
  name: string;
  serialNumber: string;
  model: string;
  purchaseDate?: string;
  warrantyExpiration?: string;
  customerProfile: CustomerProfile;
  building?: Building | null;
  maintenanceHistory?: string;
  qrCodeData?: string;
}

// Inventory
export interface SparePart {
  id: number;
  name: string;
  code: string;
  description: string;
  unitPrice: number;
  stockLevel: number;
  reorderPoint: number;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
}

export interface InventoryStock {
  id: number;
  sparePart: SparePart;
  warehouse: Warehouse;
  quantity: number;
}

export type PurchaseOrderStatus = 'PENDING' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  vendorName: string;
  status: PurchaseOrderStatus;
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: number;
  sparePart: SparePart;
  quantity: number;
  unitPrice: number;
}

// SLA
export interface SlaPolicy {
  id: number;
  name: string;
  priority: string;
  responseTimeHours: number;
  resolutionTimeHours: number;
}

export interface SlaMonitoringDTO {
  workOrderId: number;
  title: string;
  priority: string;
  createdAt: string;
  maxResolutionTimeHours: number;
  elapsedTimeHours: number;
  remainingTimeHours: number;
  isBreached: boolean;
}

// Notifications
export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Audit Logs
export interface AuditLog {
  id: number;
  action: string;
  entityName: string;
  entityId?: number | null;
  performedBy: string;
  timestamp: string;
  details: string;
}

// Request Attachments
export interface RequestAttachment {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
  uploadedAt: string;
}

// Dashboard
export interface DashboardStats {
  totalWorkOrders: number;
  openWorkOrders: number;
  inProgressWorkOrders: number;
  completedWorkOrders: number;
  slaBreachCount: number;
  activeTechniciansCount: number;
  inventoryReorderCount: number;
  monthlyTrends: Record<string, number>;
  categoryDistribution: Record<string, number>;
}
