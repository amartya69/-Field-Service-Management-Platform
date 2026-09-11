package com.keystone.controller;

import com.keystone.dto.*;
import com.keystone.entity.Technician;
import com.keystone.entity.User;
import com.keystone.entity.WorkOrder;
import com.keystone.entity.WorkOrderPriority;
import com.keystone.entity.WorkOrderStatus;
import com.keystone.repository.UserRepository;
import com.keystone.service.TechnicianService;
import com.keystone.service.WorkOrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    @Autowired
    private WorkOrderService workOrderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TechnicianService technicianService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<WorkOrder>>> getAllWorkOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) WorkOrderPriority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Error: User not found."));

        // If user is a technician, return only their assigned work orders
        if (user.getRole().name().equals("ROLE_TECHNICIAN")) {
            Technician tech = technicianService.getTechnicianByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Error: Technician profile not found."));
            // Filter directly via the repository filtered pageable, scoped to the specific technician
            Page<WorkOrder> pageResult = workOrderService.getWorkOrdersFilteredAndTechnician(search, status, priority, tech, pageable);
            return ResponseEntity.ok(ApiResponse.success(pageResult, "Assigned work orders retrieved"));
        }

        Page<WorkOrder> list = workOrderService.getWorkOrdersFiltered(search, status, priority, pageable);
        return ResponseEntity.ok(ApiResponse.success(list, "Work orders retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkOrder>> getWorkOrderById(@PathVariable @NonNull Long id) {
        WorkOrder order = workOrderService.getWorkOrderById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.success(order, "Work order retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WorkOrder>> createWorkOrder(@Valid @RequestBody WorkOrderRequest request) {
        WorkOrder order = workOrderService.createWorkOrder(request);
        return ResponseEntity.ok(ApiResponse.success(order, "Work order created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkOrder>> updateWorkOrder(@PathVariable @NonNull Long id, @Valid @RequestBody WorkOrderRequest request) {
        WorkOrder order = workOrderService.updateWorkOrder(id, request);
        return ResponseEntity.ok(ApiResponse.success(order, "Work order updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteWorkOrder(@PathVariable @NonNull Long id) {
        workOrderService.deleteWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Work order deleted successfully", "Deletion successful"));
    }

    // --- Work Order Lifecycle Mappings ---

    @PostMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<WorkOrder>> acceptWorkOrder(@PathVariable @NonNull Long id) {
        WorkOrder order = workOrderService.acceptWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success(order, "Work order accepted successfully"));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<WorkOrder>> rejectWorkOrder(@PathVariable @NonNull Long id) {
        WorkOrder order = workOrderService.rejectWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success(order, "Work order rejected/unassigned successfully"));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<ApiResponse<WorkOrder>> startWorkOrder(@PathVariable @NonNull Long id) {
        WorkOrder order = workOrderService.startWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success(order, "Work order started successfully"));
    }

    @PostMapping("/{id}/pause")
    public ResponseEntity<ApiResponse<WorkOrder>> pauseWorkOrder(@PathVariable @NonNull Long id) {
        WorkOrder order = workOrderService.pauseWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success(order, "Work order paused successfully"));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<WorkOrder>> completeWorkOrder(@PathVariable @NonNull Long id) {
        WorkOrder order = workOrderService.completeWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success(order, "Work Order marked as completed"));
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<WorkOrder>> verifyWorkOrder(@PathVariable @NonNull Long id) {
        WorkOrder order = workOrderService.verifyWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success(order, "Work Order customer verification saved"));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<ApiResponse<WorkOrder>> closeWorkOrder(@PathVariable @NonNull Long id) {
        WorkOrder order = workOrderService.closeWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success(order, "Work Order closed successfully"));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<WorkOrder>> cancelWorkOrder(@PathVariable @NonNull Long id) {
        WorkOrder order = workOrderService.cancelWorkOrder(id);
        return ResponseEntity.ok(ApiResponse.success(order, "Work Order cancelled successfully"));
    }
}
