package com.keystone.dto;

import java.time.LocalDateTime;

public class SlaMonitoringDTO {
    private Long workOrderId;
    private String workOrderTitle;
    private String priority;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime deadline;
    private double hoursRemaining;
    private boolean isCompliant;
    private boolean isEscalated;

    public SlaMonitoringDTO() {
    }

    public SlaMonitoringDTO(Long workOrderId, String workOrderTitle, String priority, String status, LocalDateTime createdAt, LocalDateTime deadline, double hoursRemaining, boolean isCompliant, boolean isEscalated) {
        this.workOrderId = workOrderId;
        this.workOrderTitle = workOrderTitle;
        this.priority = priority;
        this.status = status;
        this.createdAt = createdAt;
        this.deadline = deadline;
        this.hoursRemaining = hoursRemaining;
        this.isCompliant = isCompliant;
        this.isEscalated = isEscalated;
    }

    // Getters and Setters
    public Long getWorkOrderId() {
        return workOrderId;
    }

    public void setWorkOrderId(Long workOrderId) {
        this.workOrderId = workOrderId;
    }

    public String getWorkOrderTitle() {
        return workOrderTitle;
    }

    public void setWorkOrderTitle(String workOrderTitle) {
        this.workOrderTitle = workOrderTitle;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public double getHoursRemaining() {
        return hoursRemaining;
    }

    public void setHoursRemaining(double hoursRemaining) {
        this.hoursRemaining = hoursRemaining;
    }

    public boolean isCompliant() {
        return isCompliant;
    }

    public void setCompliant(boolean compliant) {
        this.isCompliant = compliant;
    }

    public boolean isEscalated() {
        return isEscalated;
    }

    public void setEscalated(boolean escalated) {
        this.isEscalated = escalated;
    }
}
