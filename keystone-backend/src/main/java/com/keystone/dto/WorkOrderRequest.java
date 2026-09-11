package com.keystone.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class WorkOrderRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String priority;

    @NotBlank
    private String status;

    private Long technicianId;

    private Long customerRequestId;

    @NotBlank
    private String location;

    private LocalDateTime scheduledDate;

    private LocalDateTime completedDate;

    private String partsUsed;

    private Integer timeSpentMinutes = 0;

    public WorkOrderRequest() {
    }

    public WorkOrderRequest(String title, String description, String priority, String status, Long technicianId, Long customerRequestId, String location, LocalDateTime scheduledDate, LocalDateTime completedDate, String partsUsed, Integer timeSpentMinutes) {
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.technicianId = technicianId;
        this.customerRequestId = customerRequestId;
        this.location = location;
        this.scheduledDate = scheduledDate;
        this.completedDate = completedDate;
        this.partsUsed = partsUsed;
        this.timeSpentMinutes = timeSpentMinutes;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public Long getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
    }

    public Long getCustomerRequestId() {
        return customerRequestId;
    }

    public void setCustomerRequestId(Long customerRequestId) {
        this.customerRequestId = customerRequestId;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public LocalDateTime getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDateTime completedDate) {
        this.completedDate = completedDate;
    }

    public String getPartsUsed() {
        return partsUsed;
    }

    public void setPartsUsed(String partsUsed) {
        this.partsUsed = partsUsed;
    }

    public Integer getTimeSpentMinutes() {
        return timeSpentMinutes;
    }

    public void setTimeSpentMinutes(Integer timeSpentMinutes) {
        this.timeSpentMinutes = timeSpentMinutes;
    }
}
