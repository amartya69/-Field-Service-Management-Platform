package com.keystone.dto;

import jakarta.validation.constraints.NotBlank;

public class CustomerProfileRequest {
    private Long userId;

    @NotBlank
    private String companyName;

    @NotBlank
    private String address;

    private String status = "ACTIVE";

    public CustomerProfileRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
