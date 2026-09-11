package com.keystone.dto;

public class TechnicianPerformanceDTO {
    private Long technicianId;
    private String technicianName;
    private Double rating;
    private long completedWorkOrdersCount;
    private double averageCompletionTimeMinutes;
    private double slaComplianceRate;

    public TechnicianPerformanceDTO() {
    }

    public TechnicianPerformanceDTO(Long technicianId, String technicianName, Double rating, long completedWorkOrdersCount, double averageCompletionTimeMinutes, double slaComplianceRate) {
        this.technicianId = technicianId;
        this.technicianName = technicianName;
        this.rating = rating;
        this.completedWorkOrdersCount = completedWorkOrdersCount;
        this.averageCompletionTimeMinutes = averageCompletionTimeMinutes;
        this.slaComplianceRate = slaComplianceRate;
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

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public long getCompletedWorkOrdersCount() {
        return completedWorkOrdersCount;
    }

    public void setCompletedWorkOrdersCount(long completedWorkOrdersCount) {
        this.completedWorkOrdersCount = completedWorkOrdersCount;
    }

    public double getAverageCompletionTimeMinutes() {
        return averageCompletionTimeMinutes;
    }

    public void setAverageCompletionTimeMinutes(double averageCompletionTimeMinutes) {
        this.averageCompletionTimeMinutes = averageCompletionTimeMinutes;
    }

    public double getSlaComplianceRate() {
        return slaComplianceRate;
    }

    public void setSlaComplianceRate(double slaComplianceRate) {
        this.slaComplianceRate = slaComplianceRate;
    }
}
