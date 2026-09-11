package com.keystone.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SlaPolicyRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String priority;

    @NotNull
    @Min(1)
    private Integer responseTimeHours;

    @NotNull
    @Min(1)
    private Integer resolutionTimeHours;

    public SlaPolicyRequest() {
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
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
