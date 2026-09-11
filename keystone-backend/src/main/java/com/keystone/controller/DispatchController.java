package com.keystone.controller;

import com.keystone.dto.*;
import com.keystone.entity.WorkOrder;
import com.keystone.service.DispatchService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dispatch")
public class DispatchController {

    @Autowired
    private DispatchService dispatchService;

    @GetMapping("/calendar")
    public ResponseEntity<ApiResponse<List<WorkOrder>>> getCalendar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null) startDate = LocalDate.now();
        if (endDate == null) endDate = startDate.plusDays(7);

        List<WorkOrder> calendarOrders = dispatchService.getCalendarWorkOrders(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(calendarOrders, "Calendar work orders retrieved"));
    }

    @GetMapping("/routes")
    public ResponseEntity<ApiResponse<DispatchRouteDTO>> getTechnicianRoute(
            @RequestParam @NonNull Long technicianId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        DispatchRouteDTO route = dispatchService.getTechnicianRoute(technicianId, date);
        return ResponseEntity.ok(ApiResponse.success(route, "Technician route retrieved"));
    }

    @PostMapping("/assign")
    public ResponseEntity<ApiResponse<WorkOrder>> assignTechnician(
            @Valid @RequestBody TechnicianAssignmentRequest request) {

        WorkOrder order = dispatchService.assignTechnician(request);
        return ResponseEntity.ok(ApiResponse.success(order, "Technician assigned successfully"));
    }
}
