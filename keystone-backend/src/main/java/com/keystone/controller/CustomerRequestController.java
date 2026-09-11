package com.keystone.controller;

import com.keystone.dto.*;
import com.keystone.entity.CustomerRequest;
import com.keystone.entity.CustomerRequestStatus;
import com.keystone.entity.RequestAttachment;
import com.keystone.entity.User;
import com.keystone.repository.UserRepository;
import com.keystone.service.CustomerRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.lang.NonNull;

import java.util.List;

@RestController
@RequestMapping("/api/customer-requests")
public class CustomerRequestController {

    @Autowired
    private CustomerRequestService customerRequestService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerRequest>>> getAllRequests() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Error: User not found."));

        List<CustomerRequest> list;
        // Customers can only see their own requests
        if (user.getRole().name().equals("ROLE_CUSTOMER")) {
            list = customerRequestService.getRequestsByCustomer(user);
        } else {
            list = customerRequestService.getAllRequests();
        }
        return ResponseEntity.ok(ApiResponse.success(list, "Requests retrieved successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<CustomerRequest>>> getMyRequests() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Error: User not found."));

        List<CustomerRequest> list = customerRequestService.getRequestsByCustomer(user);
        return ResponseEntity.ok(ApiResponse.success(list, "My requests retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerRequest>> createRequest(@Valid @RequestBody CustomerRequestRequest request) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Error: User not found."));

        CustomerRequest created = customerRequestService.createRequest(user, request);
        return ResponseEntity.ok(ApiResponse.success(created, "Customer request created successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CustomerRequest>> updateStatus(
            @PathVariable @NonNull Long id,
            @RequestParam CustomerRequestStatus status) {
        CustomerRequest request = customerRequestService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(request, "Request status updated successfully"));
    }

    // --- File Attachments Support ---

    @PostMapping("/{id}/attachments")
    public ResponseEntity<ApiResponse<RequestAttachment>> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        RequestAttachment attachment = customerRequestService.addAttachment(id, file);
        return ResponseEntity.ok(ApiResponse.success(attachment, "Attachment uploaded successfully"));
    }

    @GetMapping("/{id}/attachments")
    public ResponseEntity<ApiResponse<List<RequestAttachment>>> getAttachments(@PathVariable Long id) {
        List<RequestAttachment> list = customerRequestService.getAttachments(id);
        return ResponseEntity.ok(ApiResponse.success(list, "Attachments retrieved successfully"));
    }
}
