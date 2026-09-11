import axiosClient from '../api/axiosClient';
import type {
  ApiResponse,
  JwtResponse,
  UserProfileResponse,
  WorkOrder,
  Technician,
  Attendance,
  TechnicianPerformance,
  CustomerProfile,
  Building,
  Site,
  Contact,
  Asset,
  SparePart,
  Warehouse,
  InventoryStock,
  PurchaseOrder,
  PurchaseOrderItem,
  SlaPolicy,
  SlaMonitoringDTO,
  AuditLog,
  CustomerRequest,
  RequestAttachment,
  DashboardStats,
  Notification,
} from '../types';

// ==========================================
// 1. AUTHENTICATION SERVICES
// ==========================================
export const authService = {
  login: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<JwtResponse>>('/api/auth/login', payload);
    return res.data.data;
  },
  signup: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<any>>('/api/auth/signup', payload);
    return res.data.data;
  },
  profile: async () => {
    const res = await axiosClient.get<ApiResponse<UserProfileResponse>>('/api/auth/profile');
    return res.data.data;
  },
  updateProfile: async (payload: any) => {
    const res = await axiosClient.put<ApiResponse<UserProfileResponse>>('/api/auth/profile', payload);
    return res.data.data;
  },
  changePassword: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<any>>('/api/auth/change-password', payload);
    return res.data;
  },
  forgotPassword: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<any>>('/api/auth/forgot-password', payload);
    return res.data;
  },
  resetPassword: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<any>>('/api/auth/reset-password', payload);
    return res.data;
  },
  logout: async (username: string) => {
    await axiosClient.post('/api/auth/logout', { username });
  },
};

// ==========================================
// 2. DASHBOARD SERVICES
// ==========================================
export const dashboardService = {
  getStats: async () => {
    const res = await axiosClient.get<ApiResponse<DashboardStats>>('/api/dashboard/stats');
    return res.data.data;
  },
};

// ==========================================
// 3. WORK ORDER SERVICES
// ==========================================
export const workOrderService = {
  getAll: async (params: {
    search?: string;
    status?: string;
    priority?: string;
    page: number;
    size: number;
    sortBy?: string;
    sortDir?: string;
  }) => {
    const res = await axiosClient.get<ApiResponse<any>>('/api/work-orders', { params });
    return res.data.data;
  },
  getById: async (id: number) => {
    const res = await axiosClient.get<ApiResponse<WorkOrder>>(`/api/work-orders/${id}`);
    return res.data.data;
  },
  create: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<WorkOrder>>('/api/work-orders', payload);
    return res.data.data;
  },
  update: async (id: number, payload: any) => {
    const res = await axiosClient.put<ApiResponse<WorkOrder>>(`/api/work-orders/${id}`, payload);
    return res.data.data;
  },
  delete: async (id: number) => {
    await axiosClient.delete(`/api/work-orders/${id}`);
  },
  // Lifecycle Transitions
  accept: async (id: number) => {
    const res = await axiosClient.post<ApiResponse<WorkOrder>>(`/api/work-orders/${id}/accept`);
    return res.data.data;
  },
  reject: async (id: number) => {
    const res = await axiosClient.post<ApiResponse<WorkOrder>>(`/api/work-orders/${id}/reject`);
    return res.data.data;
  },
  start: async (id: number) => {
    const res = await axiosClient.post<ApiResponse<WorkOrder>>(`/api/work-orders/${id}/start`);
    return res.data.data;
  },
  pause: async (id: number) => {
    const res = await axiosClient.post<ApiResponse<WorkOrder>>(`/api/work-orders/${id}/pause`);
    return res.data.data;
  },
  complete: async (id: number) => {
    const res = await axiosClient.post<ApiResponse<WorkOrder>>(`/api/work-orders/${id}/complete`);
    return res.data.data;
  },
  verify: async (id: number) => {
    const res = await axiosClient.post<ApiResponse<WorkOrder>>(`/api/work-orders/${id}/verify`);
    return res.data.data;
  },
  close: async (id: number) => {
    const res = await axiosClient.post<ApiResponse<WorkOrder>>(`/api/work-orders/${id}/close`);
    return res.data.data;
  },
  cancel: async (id: number) => {
    const res = await axiosClient.post<ApiResponse<WorkOrder>>(`/api/work-orders/${id}/cancel`);
    return res.data.data;
  },
};

// ==========================================
// 4. TECHNICIAN SERVICES
// ==========================================
export const technicianService = {
  getAll: async () => {
    const res = await axiosClient.get<ApiResponse<Technician[]>>('/api/technicians');
    return res.data.data;
  },
  getById: async (id: number) => {
    const res = await axiosClient.get<ApiResponse<Technician>>(`/api/technicians/${id}`);
    return res.data.data;
  },
  updateDetails: async (id: number, payload: any) => {
    const res = await axiosClient.put<ApiResponse<Technician>>(`/api/technicians/${id}`, null, { params: payload });
    return res.data.data;
  },
  updateStatus: async (id: number, status: string) => {
    const res = await axiosClient.put<ApiResponse<Technician>>(`/api/technicians/${id}/status`, null, { params: { status } });
    return res.data.data;
  },
  // Attendance Clocking
  clockIn: async (id: number) => {
    const res = await axiosClient.post<ApiResponse<Attendance>>(`/api/technicians/${id}/clock-in`);
    return res.data.data;
  },
  clockOut: async (id: number) => {
    const res = await axiosClient.post<ApiResponse<Attendance>>(`/api/technicians/${id}/clock-out`);
    return res.data.data;
  },
  getAttendanceLogs: async (id: number) => {
    const res = await axiosClient.get<ApiResponse<Attendance[]>>(`/api/technicians/${id}/attendance`);
    return res.data.data;
  },
  getPerformanceStats: async (id: number) => {
    const res = await axiosClient.get<ApiResponse<TechnicianPerformance>>(`/api/technicians/${id}/performance`);
    return res.data.data;
  },
};

// ==========================================
// 5. CUSTOMER REGISTRY SERVICES
// ==========================================
export const customerService = {
  getAllProfiles: async () => {
    const res = await axiosClient.get<ApiResponse<CustomerProfile[]>>('/api/customers');
    return res.data.data;
  },
  getProfileById: async (id: number) => {
    const res = await axiosClient.get<ApiResponse<CustomerProfile>>(`/api/customers/${id}`);
    return res.data.data;
  },
  createProfile: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<CustomerProfile>>('/api/customers', payload);
    return res.data.data;
  },
  updateProfile: async (id: number, payload: any) => {
    const res = await axiosClient.put<ApiResponse<CustomerProfile>>(`/api/customers/${id}`, payload);
    return res.data.data;
  },
  deleteProfile: async (id: number) => {
    await axiosClient.delete(`/api/customers/${id}`);
  },
  // Buildings
  getBuildings: async (profileId: number) => {
    const res = await axiosClient.get<ApiResponse<Building[]>>(`/api/customers/${profileId}/buildings`);
    return res.data.data;
  },
  createBuilding: async (profileId: number, payload: any) => {
    const res = await axiosClient.post<ApiResponse<Building>>(`/api/customers/${profileId}/buildings`, payload);
    return res.data.data;
  },
  // Sites
  getSites: async (buildingId: number) => {
    const res = await axiosClient.get<ApiResponse<Site[]>>(`/api/customers/buildings/${buildingId}/sites`);
    return res.data.data;
  },
  createSite: async (buildingId: number, payload: any) => {
    const res = await axiosClient.post<ApiResponse<Site>>(`/api/customers/buildings/${buildingId}/sites`, payload);
    return res.data.data;
  },
  // Contacts
  getContacts: async (profileId: number) => {
    const res = await axiosClient.get<ApiResponse<Contact[]>>(`/api/customers/${profileId}/contacts`);
    return res.data.data;
  },
  createContact: async (profileId: number, payload: any) => {
    const res = await axiosClient.post<ApiResponse<Contact>>(`/api/customers/${profileId}/contacts`, payload);
    return res.data.data;
  },
};

// ==========================================
// 6. ASSET MANAGEMENT SERVICES
// ==========================================
export const assetService = {
  getAll: async () => {
    const res = await axiosClient.get<ApiResponse<Asset[]>>('/api/assets');
    return res.data.data;
  },
  getById: async (id: number) => {
    const res = await axiosClient.get<ApiResponse<Asset>>(`/api/assets/${id}`);
    return res.data.data;
  },
  create: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<Asset>>('/api/assets', payload);
    return res.data.data;
  },
  update: async (id: number, payload: any) => {
    const res = await axiosClient.put<ApiResponse<Asset>>(`/api/assets/${id}`, payload);
    return res.data.data;
  },
  delete: async (id: number) => {
    await axiosClient.delete(`/api/assets/${id}`);
  },
  getQrCodeUrl: (id: number) => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    return `${apiBase}/api/assets/${id}/qrcode`;
  },
};

// ==========================================
// 7. INVENTORY SERVICES
// ==========================================
export const inventoryService = {
  getParts: async () => {
    const res = await axiosClient.get<ApiResponse<SparePart[]>>('/api/inventory/parts');
    return res.data.data;
  },
  createPart: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<SparePart>>('/api/inventory/parts', payload);
    return res.data.data;
  },
  getWarehouses: async () => {
    const res = await axiosClient.get<ApiResponse<Warehouse[]>>('/api/inventory/warehouses');
    return res.data.data;
  },
  createWarehouse: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<Warehouse>>('/api/inventory/warehouses', payload);
    return res.data.data;
  },
  getStocks: async () => {
    const res = await axiosClient.get<ApiResponse<InventoryStock[]>>('/api/inventory/stocks');
    return res.data.data;
  },
  updateStock: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<InventoryStock>>('/api/inventory/stocks', payload);
    return res.data.data;
  },
  // Purchase Orders
  getPurchaseOrders: async () => {
    const res = await axiosClient.get<ApiResponse<PurchaseOrder[]>>('/api/inventory/purchase-orders');
    return res.data.data;
  },
  createPurchaseOrder: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<PurchaseOrder>>('/api/inventory/purchase-orders', payload);
    return res.data.data;
  },
  updatePurchaseOrderStatus: async (id: number, status: string) => {
    const res = await axiosClient.put<ApiResponse<PurchaseOrder>>(`/api/inventory/purchase-orders/${id}/status`, null, { params: { status } });
    return res.data.data;
  },
  getPurchaseOrderItems: async (id: number) => {
    const res = await axiosClient.get<ApiResponse<PurchaseOrderItem[]>>(`/api/inventory/purchase-orders/${id}/items`);
    return res.data.data;
  },
};

// ==========================================
// 8. SLA SERVICES
// ==========================================
export const slaService = {
  getPolicies: async () => {
    const res = await axiosClient.get<ApiResponse<SlaPolicy[]>>('/api/sla/policies');
    return res.data.data;
  },
  createPolicy: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<SlaPolicy>>('/api/sla/policies', payload);
    return res.data.data;
  },
  getMonitoringTimeline: async () => {
    const res = await axiosClient.get<ApiResponse<SlaMonitoringDTO[]>>('/api/sla/monitoring');
    return res.data.data;
  },
};

// ==========================================
// 9. CUSTOMER REQUESTS & FILES (PORTAL)
// ==========================================
export const customerRequestService = {
  getAll: async () => {
    const res = await axiosClient.get<ApiResponse<CustomerRequest[]>>('/api/customer-requests');
    return res.data.data;
  },
  getMyRequests: async () => {
    const res = await axiosClient.get<ApiResponse<CustomerRequest[]>>('/api/customer-requests/my');
    return res.data.data;
  },
  create: async (payload: any) => {
    const res = await axiosClient.post<ApiResponse<CustomerRequest>>('/api/customer-requests', payload);
    return res.data.data;
  },
  updateStatus: async (id: number, status: string) => {
    const res = await axiosClient.put<ApiResponse<CustomerRequest>>(`/api/customer-requests/${id}/status`, null, { params: { status } });
    return res.data.data;
  },
  // Attachments
  uploadAttachment: async (requestId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosClient.post<ApiResponse<RequestAttachment>>(`/api/customer-requests/${requestId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },
  getAttachments: async (requestId: number) => {
    const res = await axiosClient.get<ApiResponse<RequestAttachment[]>>(`/api/customer-requests/${requestId}/attachments`);
    return res.data.data;
  },
};

// ==========================================
// 10. DISPATCH SERVICES
// ==========================================
export const dispatchService = {
  getCalendar: async (startDate?: string, endDate?: string) => {
    const res = await axiosClient.get<ApiResponse<WorkOrder[]>>('/api/dispatch/calendar', {
      params: { startDate, endDate },
    });
    return res.data.data;
  },
  getRoutes: async (technicianId: number, date: string) => {
    const res = await axiosClient.get<ApiResponse<any>>('/api/dispatch/routes', {
      params: { technicianId, date },
    });
    return res.data.data;
  },
  assign: async (payload: { workOrderId: number; technicianId: number; scheduledDate?: string }) => {
    const res = await axiosClient.post<ApiResponse<WorkOrder>>('/api/dispatch/assign', payload);
    return res.data.data;
  },
};

// ==========================================
// 11. AUDIT LOG SERVICES
// ==========================================
export const auditLogService = {
  getAll: async () => {
    const res = await axiosClient.get<ApiResponse<AuditLog[]>>('/api/audit-logs');
    return res.data.data;
  },
};

// ==========================================
// 12. REPORT EXPORT SERVICES (CSV FILES)
// ==========================================
export const reportService = {
  downloadDashboardCsv: async () => {
    const res = await axiosClient.get('/api/reports/dashboard', { responseType: 'blob' });
    triggerDownload(res.data, 'dashboard_report.csv');
  },
  downloadTechnicianCsv: async () => {
    const res = await axiosClient.get('/api/reports/technicians', { responseType: 'blob' });
    triggerDownload(res.data, 'technicians_report.csv');
  },
  downloadCustomerCsv: async () => {
    const res = await axiosClient.get('/api/reports/customers', { responseType: 'blob' });
    triggerDownload(res.data, 'customers_report.csv');
  },
  downloadInventoryCsv: async () => {
    const res = await axiosClient.get('/api/reports/inventory', { responseType: 'blob' });
    triggerDownload(res.data, 'inventory_report.csv');
  },
};

// ==========================================
// 13. NOTIFICATION SERVICES
// ==========================================
export const notificationService = {
  getAll: async () => {
    const res = await axiosClient.get<ApiResponse<Notification[]>>('/api/notifications');
    return res.data.data;
  },
  getUnread: async () => {
    const res = await axiosClient.get<ApiResponse<Notification[]>>('/api/notifications/unread');
    return res.data.data;
  },
  getUnreadCount: async () => {
    const res = await axiosClient.get<ApiResponse<number>>('/api/notifications/unread-count');
    return res.data.data;
  },
  markAsRead: async (id: number) => {
    const res = await axiosClient.put<ApiResponse<Notification>>(`/api/notifications/${id}/read`);
    return res.data.data;
  },
  markAllAsRead: async () => {
    const res = await axiosClient.post<ApiResponse<string>>('/api/notifications/read-all');
    return res.data.data;
  },
};

function triggerDownload(blobData: Blob, filename: string) {
  const url = window.URL.createObjectURL(new Blob([blobData]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
