package com.keystone.controller;

import com.keystone.dto.*;
import com.keystone.entity.SlaPolicy;
import com.keystone.service.SlaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sla")
public class SlaController {

    @Autowired
    private SlaService slaService;

    @GetMapping("/policies")
    public ResponseEntity<ApiResponse<List<SlaPolicy>>> getAllPolicies() {
        List<SlaPolicy> list = slaService.getAllPolicies();
        return ResponseEntity.ok(ApiResponse.success(list, "SLA policies retrieved successfully"));
    }

    @GetMapping("/policies/{id}")
    public ResponseEntity<ApiResponse<SlaPolicy>> getPolicyById(@PathVariable @NonNull Long id) {
        SlaPolicy policy = slaService.getPolicyById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SLA policy not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.success(policy, "SLA policy retrieved successfully"));
    }

    @PostMapping("/policies")
    public ResponseEntity<ApiResponse<SlaPolicy>> createPolicy(@Valid @RequestBody SlaPolicyRequest request) {
        SlaPolicy policy = slaService.createPolicy(request);
        return ResponseEntity.ok(ApiResponse.success(policy, "SLA policy created successfully"));
    }

    @PutMapping("/policies/{id}")
    public ResponseEntity<ApiResponse<SlaPolicy>> updatePolicy(@PathVariable @NonNull Long id, @Valid @RequestBody SlaPolicyRequest request) {
        SlaPolicy policy = slaService.updatePolicy(id, request);
        return ResponseEntity.ok(ApiResponse.success(policy, "SLA policy updated successfully"));
    }

    @DeleteMapping("/policies/{id}")
    public ResponseEntity<ApiResponse<String>> deletePolicy(@PathVariable @NonNull Long id) {
        slaService.deletePolicy(id);
        return ResponseEntity.ok(ApiResponse.success("SLA policy deleted successfully", "Deletion successful"));
    }

    @GetMapping("/monitoring")
    public ResponseEntity<ApiResponse<List<SlaMonitoringDTO>>> getSlaMonitoring() {
        List<SlaMonitoringDTO> list = slaService.getSlaMonitoringData();
        return ResponseEntity.ok(ApiResponse.success(list, "Active SLA monitoring data retrieved"));
    }

    @PostMapping("/trigger-check")
    public ResponseEntity<ApiResponse<String>> triggerEscalationCheck() {
        slaService.checkAndTriggerEscalations();
        return ResponseEntity.ok(ApiResponse.success("SLA escalation check manually triggered and executed.", "Check complete"));
    }
}
