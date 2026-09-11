package com.keystone.dto;

import java.util.List;
import java.util.Map;

public class DashboardStats {
    private long totalWorkOrders;
    private long openWorkOrders;
    private long inProgressWorkOrders;
    private long completedWorkOrders;
    private long pendingCustomerRequests;
    private long activeTechnicians;
    private long activeTechniciansCount;
    private long slaBreachCount;
    private long inventoryReorderCount;
    private double slaComplianceRate;

    private Map<String, Long> monthlyTrends;
    private Map<String, Long> categoryDistribution;
    private List<CategoryBreakdown> categoryBreakdowns;
    private List<RecentActivity> recentActivities;

    public DashboardStats() {
    }

    public DashboardStats(long totalWorkOrders, long openWorkOrders, long inProgressWorkOrders, long completedWorkOrders, long pendingCustomerRequests, long activeTechnicians, long activeTechniciansCount, long slaBreachCount, long inventoryReorderCount, double slaComplianceRate, Map<String, Long> monthlyTrends, Map<String, Long> categoryDistribution, List<CategoryBreakdown> categoryBreakdowns, List<RecentActivity> recentActivities) {
        this.totalWorkOrders = totalWorkOrders;
        this.openWorkOrders = openWorkOrders;
        this.inProgressWorkOrders = inProgressWorkOrders;
        this.completedWorkOrders = completedWorkOrders;
        this.pendingCustomerRequests = pendingCustomerRequests;
        this.activeTechnicians = activeTechnicians;
        this.activeTechniciansCount = activeTechniciansCount;
        this.slaBreachCount = slaBreachCount;
        this.inventoryReorderCount = inventoryReorderCount;
        this.slaComplianceRate = slaComplianceRate;
        this.monthlyTrends = monthlyTrends;
        this.categoryDistribution = categoryDistribution;
        this.categoryBreakdowns = categoryBreakdowns;
        this.recentActivities = recentActivities;
    }

    public static DashboardStatsBuilder builder() {
        return new DashboardStatsBuilder();
    }

    // Getters and Setters
    public long getTotalWorkOrders() { return totalWorkOrders; }
    public void setTotalWorkOrders(long totalWorkOrders) { this.totalWorkOrders = totalWorkOrders; }

    public long getOpenWorkOrders() { return openWorkOrders; }
    public void setOpenWorkOrders(long openWorkOrders) { this.openWorkOrders = openWorkOrders; }

    public long getInProgressWorkOrders() { return inProgressWorkOrders; }
    public void setInProgressWorkOrders(long inProgressWorkOrders) { this.inProgressWorkOrders = inProgressWorkOrders; }

    public long getCompletedWorkOrders() { return completedWorkOrders; }
    public void setCompletedWorkOrders(long completedWorkOrders) { this.completedWorkOrders = completedWorkOrders; }

    public long getPendingCustomerRequests() { return pendingCustomerRequests; }
    public void setPendingCustomerRequests(long pendingCustomerRequests) { this.pendingCustomerRequests = pendingCustomerRequests; }

    public long getActiveTechnicians() { return activeTechnicians; }
    public void setActiveTechnicians(long activeTechnicians) { this.activeTechnicians = activeTechnicians; }

    public long getActiveTechniciansCount() { return activeTechniciansCount; }
    public void setActiveTechniciansCount(long activeTechniciansCount) { this.activeTechniciansCount = activeTechniciansCount; }

    public long getSlaBreachCount() { return slaBreachCount; }
    public void setSlaBreachCount(long slaBreachCount) { this.slaBreachCount = slaBreachCount; }

    public long getInventoryReorderCount() { return inventoryReorderCount; }
    public void setInventoryReorderCount(long inventoryReorderCount) { this.inventoryReorderCount = inventoryReorderCount; }

    public double getSlaComplianceRate() { return slaComplianceRate; }
    public void setSlaComplianceRate(double slaComplianceRate) { this.slaComplianceRate = slaComplianceRate; }

    public Map<String, Long> getMonthlyTrends() { return monthlyTrends; }
    public void setMonthlyTrends(Map<String, Long> monthlyTrends) { this.monthlyTrends = monthlyTrends; }

    public Map<String, Long> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(Map<String, Long> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

    public List<CategoryBreakdown> getCategoryBreakdowns() { return categoryBreakdowns; }
    public void setCategoryBreakdowns(List<CategoryBreakdown> categoryBreakdowns) { this.categoryBreakdowns = categoryBreakdowns; }

    public List<RecentActivity> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<RecentActivity> recentActivities) { this.recentActivities = recentActivities; }

    public static class CategoryBreakdown {
        private String name;
        private long value;

        public CategoryBreakdown() {}
        public CategoryBreakdown(String name, long value) {
            this.name = name;
            this.value = value;
        }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public long getValue() { return value; }
        public void setValue(long value) { this.value = value; }
    }

    public static class RecentActivity {
        private String id;
        private String type;
        private String title;
        private String description;
        private String timestamp;
        private String status;

        public RecentActivity() {}
        public RecentActivity(String id, String type, String title, String description, String timestamp, String status) {
            this.id = id;
            this.type = type;
            this.title = title;
            this.description = description;
            this.timestamp = timestamp;
            this.status = status;
        }

        public static RecentActivityBuilder builder() {
            return new RecentActivityBuilder();
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class DashboardStatsBuilder {
        private long totalWorkOrders;
        private long openWorkOrders;
        private long inProgressWorkOrders;
        private long completedWorkOrders;
        private long pendingCustomerRequests;
        private long activeTechnicians;
        private long activeTechniciansCount;
        private long slaBreachCount;
        private long inventoryReorderCount;
        private double slaComplianceRate;
        private Map<String, Long> monthlyTrends;
        private Map<String, Long> categoryDistribution;
        private List<CategoryBreakdown> categoryBreakdowns;
        private List<RecentActivity> recentActivities;

        public DashboardStatsBuilder totalWorkOrders(long val) { this.totalWorkOrders = val; return this; }
        public DashboardStatsBuilder openWorkOrders(long val) { this.openWorkOrders = val; return this; }
        public DashboardStatsBuilder inProgressWorkOrders(long val) { this.inProgressWorkOrders = val; return this; }
        public DashboardStatsBuilder completedWorkOrders(long val) { this.completedWorkOrders = val; return this; }
        public DashboardStatsBuilder pendingCustomerRequests(long val) { this.pendingCustomerRequests = val; return this; }
        public DashboardStatsBuilder activeTechnicians(long val) { this.activeTechnicians = val; return this; }
        public DashboardStatsBuilder activeTechniciansCount(long val) { this.activeTechniciansCount = val; return this; }
        public DashboardStatsBuilder slaBreachCount(long val) { this.slaBreachCount = val; return this; }
        public DashboardStatsBuilder inventoryReorderCount(long val) { this.inventoryReorderCount = val; return this; }
        public DashboardStatsBuilder slaComplianceRate(double val) { this.slaComplianceRate = val; return this; }
        public DashboardStatsBuilder monthlyTrends(Map<String, Long> val) { this.monthlyTrends = val; return this; }
        public DashboardStatsBuilder categoryDistribution(Map<String, Long> val) { this.categoryDistribution = val; return this; }
        public DashboardStatsBuilder categoryBreakdowns(List<CategoryBreakdown> val) { this.categoryBreakdowns = val; return this; }
        public DashboardStatsBuilder recentActivities(List<RecentActivity> val) { this.recentActivities = val; return this; }

        public DashboardStats build() {
            return new DashboardStats(totalWorkOrders, openWorkOrders, inProgressWorkOrders, completedWorkOrders, pendingCustomerRequests, activeTechnicians, activeTechniciansCount, slaBreachCount, inventoryReorderCount, slaComplianceRate, monthlyTrends, categoryDistribution, categoryBreakdowns, recentActivities);
        }
    }

    public static class RecentActivityBuilder {
        private String id;
        private String type;
        private String title;
        private String description;
        private String timestamp;
        private String status;

        public RecentActivityBuilder id(String val) { this.id = val; return this; }
        public RecentActivityBuilder type(String val) { this.type = val; return this; }
        public RecentActivityBuilder title(String val) { this.title = val; return this; }
        public RecentActivityBuilder description(String val) { this.description = val; return this; }
        public RecentActivityBuilder timestamp(String val) { this.timestamp = val; return this; }
        public RecentActivityBuilder status(String val) { this.status = val; return this; }

        public RecentActivity build() {
            return new RecentActivity(id, type, title, description, timestamp, status);
        }
    }
}
