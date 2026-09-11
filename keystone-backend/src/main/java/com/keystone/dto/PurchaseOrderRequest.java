package com.keystone.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class PurchaseOrderRequest {
    @NotBlank
    private String orderNumber;

    @NotBlank
    private String vendorName;

    private String status = "PENDING"; // PENDING, ORDERED, RECEIVED, CANCELLED

    @NotEmpty
    @Valid
    private List<PurchaseOrderItemDTO> items;

    public PurchaseOrderRequest() {
    }

    // Getters and Setters
    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public String getVendorName() {
        return vendorName;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<PurchaseOrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<PurchaseOrderItemDTO> items) {
        this.items = items;
    }
}
