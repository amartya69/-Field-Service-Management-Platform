package com.keystone.config;

import com.keystone.dto.JwtResponse;
import com.keystone.entity.*;
import com.keystone.service.AuditLogService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditAspect {

    @Autowired
    private AuditLogService auditLogService;

    private String getCurrentUsername() {
        try {
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                return SecurityContextHolder.getContext().getAuthentication().getName();
            }
        } catch (Exception e) {
            // Ignored
        }
        return "SYSTEM";
    }

    // --- Authentication Auditing ---

    @AfterReturning(pointcut = "execution(* com.keystone.service.AuthService.authenticateUser(..))", returning = "result")
    public void logLogin(JoinPoint joinPoint, Object result) {
        if (result instanceof JwtResponse jwt) {
            auditLogService.log(
                    "LOGIN",
                    "User",
                    jwt.getId(),
                    jwt.getUsername(),
                    "User logged in successfully from client IP"
            );
        }
    }

    @Before("execution(* com.keystone.service.AuthService.logout(..)) && args(username)")
    public void logLogout(JoinPoint joinPoint, String username) {
        auditLogService.log(
                "LOGOUT",
                "User",
                null,
                username,
                "User logged out successfully"
        );
    }

    // --- Work Order Auditing ---

    @AfterReturning(pointcut = "execution(* com.keystone.service.WorkOrderService.createWorkOrder(..))", returning = "result")
    public void logWorkOrderCreate(JoinPoint joinPoint, Object result) {
        if (result instanceof WorkOrder wo) {
            auditLogService.log(
                    "CREATE",
                    "WorkOrder",
                    wo.getId(),
                    getCurrentUsername(),
                    "Created Work Order: '" + wo.getTitle() + "' at location: " + wo.getLocation()
            );
        }
    }

    @AfterReturning(pointcut = "execution(* com.keystone.service.WorkOrderService.updateWorkOrder(..))", returning = "result")
    public void logWorkOrderUpdate(JoinPoint joinPoint, Object result) {
        if (result instanceof WorkOrder wo) {
            String details = "Updated Work Order: '" + wo.getTitle() + "' - Status: " + wo.getStatus();
            if (wo.getAssignedTechnician() != null) {
                details += ", Assigned to: " + wo.getAssignedTechnician().getName();
            }
            auditLogService.log(
                    "UPDATE",
                    "WorkOrder",
                    wo.getId(),
                    getCurrentUsername(),
                    details
            );
        }
    }

    @Before("execution(* com.keystone.service.WorkOrderService.deleteWorkOrder(..)) && args(id)")
    public void logWorkOrderDelete(JoinPoint joinPoint, Long id) {
        auditLogService.log(
                "DELETE",
                "WorkOrder",
                id,
                getCurrentUsername(),
                "Deleted Work Order ID: " + id
        );
    }

    // --- Asset Auditing ---

    @AfterReturning(pointcut = "execution(* com.keystone.service.AssetService.createAsset(..))", returning = "result")
    public void logAssetCreate(JoinPoint joinPoint, Object result) {
        if (result instanceof Asset asset) {
            auditLogService.log(
                    "CREATE",
                    "Asset",
                    asset.getId(),
                    getCurrentUsername(),
                    "Created Asset: '" + asset.getName() + "' (SN: " + asset.getSerialNumber() + ")"
            );
        }
    }

    @AfterReturning(pointcut = "execution(* com.keystone.service.AssetService.updateAsset(..))", returning = "result")
    public void logAssetUpdate(JoinPoint joinPoint, Object result) {
        if (result instanceof Asset asset) {
            auditLogService.log(
                    "UPDATE",
                    "Asset",
                    asset.getId(),
                    getCurrentUsername(),
                    "Updated Asset: '" + asset.getName() + "' (SN: " + asset.getSerialNumber() + ")"
            );
        }
    }

    @Before("execution(* com.keystone.service.AssetService.deleteAsset(..)) && args(id)")
    public void logAssetDelete(JoinPoint joinPoint, Long id) {
        auditLogService.log(
                "DELETE",
                "Asset",
                id,
                getCurrentUsername(),
                "Deleted Asset ID: " + id
        );
    }

    // --- Dispatch Assignment Auditing ---

    @AfterReturning(pointcut = "execution(* com.keystone.service.DispatchService.assignTechnician(..))", returning = "result")
    public void logDispatcherAssignment(JoinPoint joinPoint, Object result) {
        if (result instanceof WorkOrder wo) {
            String techName = wo.getAssignedTechnician() != null ? wo.getAssignedTechnician().getName() : "Unassigned";
            auditLogService.log(
                    "ASSIGNMENT",
                    "WorkOrder",
                    wo.getId(),
                    getCurrentUsername(),
                    "Assigned Technician '" + techName + "' to Work Order ID: " + wo.getId()
            );
        }
    }

    // --- Customer Auditing ---

    @AfterReturning(pointcut = "execution(* com.keystone.service.CustomerService.createCustomer(..))", returning = "result")
    public void logCustomerCreate(JoinPoint joinPoint, Object result) {
        if (result instanceof CustomerProfile customer) {
            auditLogService.log(
                    "CREATE",
                    "CustomerProfile",
                    customer.getId(),
                    getCurrentUsername(),
                    "Created Customer Profile for company: '" + customer.getCompanyName() + "'"
            );
        }
    }
}
