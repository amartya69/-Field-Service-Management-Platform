package com.keystone.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class TechnicianAssignmentRequest {
    @NotNull
    private Long workOrderId;

    @NotNull
    private Long technicianId;

    private LocalDateTime scheduledDate;

    public TechnicianAssignmentRequest() {
    }

    public Long getWorkOrderId() {
        return workOrderId;
    }

    public void setWorkOrderId(Long workOrderId) {
        this.workOrderId = workOrderId;
    }

    public Long getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
    }

    public LocalDateTime getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDateTime scheduledDate) {
        this.scheduledDate = scheduledDate;
    }
}
