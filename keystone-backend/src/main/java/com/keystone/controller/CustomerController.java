package com.keystone.controller;

import com.keystone.dto.*;
import com.keystone.entity.*;
import com.keystone.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // --- Customer Profiles ---

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerProfile>>> getAllCustomers() {
        List<CustomerProfile> list = customerService.getAllCustomers();
        return ResponseEntity.ok(ApiResponse.success(list, "Customers retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerProfile>> getCustomerById(@PathVariable Long id) {
        CustomerProfile profile = customerService.getCustomerById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.success(profile, "Customer retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerProfile>> createCustomer(@Valid @RequestBody CustomerProfileRequest request) {
        CustomerProfile profile = customerService.createCustomer(request);
        return ResponseEntity.ok(ApiResponse.success(profile, "Customer created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerProfile>> updateCustomer(@PathVariable Long id, @Valid @RequestBody CustomerProfileRequest request) {
        CustomerProfile profile = customerService.updateCustomer(id, request);
        return ResponseEntity.ok(ApiResponse.success(profile, "Customer updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer profile deleted successfully", "Deletion successful"));
    }

    // --- Buildings ---

    @GetMapping("/{customerId}/buildings")
    public ResponseEntity<ApiResponse<List<Building>>> getBuildingsByCustomer(@PathVariable Long customerId) {
        List<Building> list = customerService.getBuildingsByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success(list, "Buildings retrieved successfully"));
    }

    @PostMapping("/buildings")
    public ResponseEntity<ApiResponse<Building>> createBuilding(@Valid @RequestBody BuildingRequest request) {
        Building building = customerService.createBuilding(request);
        return ResponseEntity.ok(ApiResponse.success(building, "Building created successfully"));
    }

    @PutMapping("/buildings/{id}")
    public ResponseEntity<ApiResponse<Building>> updateBuilding(@PathVariable Long id, @Valid @RequestBody BuildingRequest request) {
        Building building = customerService.updateBuilding(id, request);
        return ResponseEntity.ok(ApiResponse.success(building, "Building updated successfully"));
    }

    @DeleteMapping("/buildings/{id}")
    public ResponseEntity<ApiResponse<String>> deleteBuilding(@PathVariable Long id) {
        customerService.deleteBuilding(id);
        return ResponseEntity.ok(ApiResponse.success("Building deleted successfully", "Deletion successful"));
    }

    // --- Sites ---

    @GetMapping("/buildings/{buildingId}/sites")
    public ResponseEntity<ApiResponse<List<Site>>> getSitesByBuilding(@PathVariable Long buildingId) {
        List<Site> list = customerService.getSitesByBuilding(buildingId);
        return ResponseEntity.ok(ApiResponse.success(list, "Sites retrieved successfully"));
    }

    @PostMapping("/sites")
    public ResponseEntity<ApiResponse<Site>> createSite(@Valid @RequestBody SiteRequest request) {
        Site site = customerService.createSite(request);
        return ResponseEntity.ok(ApiResponse.success(site, "Site created successfully"));
    }

    @PutMapping("/sites/{id}")
    public ResponseEntity<ApiResponse<Site>> updateSite(@PathVariable Long id, @Valid @RequestBody SiteRequest request) {
        Site site = customerService.updateSite(id, request);
        return ResponseEntity.ok(ApiResponse.success(site, "Site updated successfully"));
    }

    @DeleteMapping("/sites/{id}")
    public ResponseEntity<ApiResponse<String>> deleteSite(@PathVariable Long id) {
        customerService.deleteSite(id);
        return ResponseEntity.ok(ApiResponse.success("Site deleted successfully", "Deletion successful"));
    }

    // --- Contacts ---

    @GetMapping("/{customerId}/contacts")
    public ResponseEntity<ApiResponse<List<Contact>>> getContactsByCustomer(@PathVariable Long customerId) {
        List<Contact> list = customerService.getContactsByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success(list, "Contacts retrieved successfully"));
    }

    @PostMapping("/contacts")
    public ResponseEntity<ApiResponse<Contact>> createContact(@Valid @RequestBody ContactRequest request) {
        Contact contact = customerService.createContact(request);
        return ResponseEntity.ok(ApiResponse.success(contact, "Contact created successfully"));
    }

    @PutMapping("/contacts/{id}")
    public ResponseEntity<ApiResponse<Contact>> updateContact(@PathVariable Long id, @Valid @RequestBody ContactRequest request) {
        Contact contact = customerService.updateContact(id, request);
        return ResponseEntity.ok(ApiResponse.success(contact, "Contact updated successfully"));
    }

    @DeleteMapping("/contacts/{id}")
    public ResponseEntity<ApiResponse<String>> deleteContact(@PathVariable Long id) {
        customerService.deleteContact(id);
        return ResponseEntity.ok(ApiResponse.success("Contact deleted successfully", "Deletion successful"));
    }
}
