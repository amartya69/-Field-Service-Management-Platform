package com.keystone.dto;

import jakarta.validation.constraints.NotBlank;

public class WarehouseRequest {
    @NotBlank
    private String name;

    private String location;

    public WarehouseRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
