package com.keystone.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class DispatchRouteDTO {
    private Long technicianId;
    private String technicianName;
    private LocalDate date;
    private List<RouteStop> stops;

    public DispatchRouteDTO() {
    }

    public DispatchRouteDTO(Long technicianId, String technicianName, LocalDate date, List<RouteStop> stops) {
        this.technicianId = technicianId;
        this.technicianName = technicianName;
        this.date = date;
        this.stops = stops;
    }

    // Getters and Setters
    public Long getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
    }

    public String getTechnicianName() {
        return technicianName;
    }

    public void setTechnicianName(String technicianName) {
        this.technicianName = technicianName;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public List<RouteStop> getStops() {
        return stops;
    }

    public void setStops(List<RouteStop> stops) {
        this.stops = stops;
    }

    public static class RouteStop {
        private int sequenceOrder;
        private Long workOrderId;
        private String workOrderTitle;
        private String location;
        private LocalDateTime scheduledTime;
        private int estimatedTravelTimeMinutes;

        public RouteStop() {
        }

        public RouteStop(int sequenceOrder, Long workOrderId, String workOrderTitle, String location, LocalDateTime scheduledTime, int estimatedTravelTimeMinutes) {
            this.sequenceOrder = sequenceOrder;
            this.workOrderId = workOrderId;
            this.workOrderTitle = workOrderTitle;
            this.location = location;
            this.scheduledTime = scheduledTime;
            this.estimatedTravelTimeMinutes = estimatedTravelTimeMinutes;
        }

        // Getters and Setters
        public int getSequenceOrder() {
            return sequenceOrder;
        }

        public void setSequenceOrder(int sequenceOrder) {
            this.sequenceOrder = sequenceOrder;
        }

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

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public LocalDateTime getScheduledTime() {
            return scheduledTime;
        }

        public void setScheduledTime(LocalDateTime scheduledTime) {
            this.scheduledTime = scheduledTime;
        }

        public int getEstimatedTravelTimeMinutes() {
            return estimatedTravelTimeMinutes;
        }

        public void setEstimatedTravelTimeMinutes(int estimatedTravelTimeMinutes) {
            this.estimatedTravelTimeMinutes = estimatedTravelTimeMinutes;
        }
    }
}
