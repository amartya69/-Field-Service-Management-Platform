package com.keystone.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "sla_policies")
public class SlaPolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private WorkOrderPriority priority;

    @Column(name = "response_time_hours", nullable = false)
    private Integer responseTimeHours = 2;

    @Column(name = "resolution_time_hours", nullable = false)
    private Integer resolutionTimeHours = 24;

    public SlaPolicy() {
    }

    public SlaPolicy(Long id, String name, WorkOrderPriority priority, Integer responseTimeHours, Integer resolutionTimeHours) {
        this.id = id;
        this.name = name;
        this.priority = priority;
        this.responseTimeHours = responseTimeHours;
        this.resolutionTimeHours = resolutionTimeHours;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public WorkOrderPriority getPriority() {
        return priority;
    }

    public void setPriority(WorkOrderPriority priority) {
        this.priority = priority;
    }

    public Integer getResponseTimeHours() {
        return responseTimeHours;
    }

    public void setResponseTimeHours(Integer responseTimeHours) {
        this.responseTimeHours = responseTimeHours;
    }

    public Integer getResolutionTimeHours() {
        return resolutionTimeHours;
    }

    public void setResolutionTimeHours(Integer resolutionTimeHours) {
        this.resolutionTimeHours = resolutionTimeHours;
    }
}
