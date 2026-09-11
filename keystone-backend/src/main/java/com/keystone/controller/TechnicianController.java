package com.keystone.controller;

import com.keystone.dto.*;
import com.keystone.entity.Attendance;
import com.keystone.entity.Technician;
import com.keystone.entity.TechnicianStatus;
import com.keystone.entity.User;
import com.keystone.repository.UserRepository;
import com.keystone.service.TechnicianService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
public class TechnicianController {

    @Autowired
    private TechnicianService technicianService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Technician>>> getAllTechnicians() {
        List<Technician> list = technicianService.getAllTechnicians();
        return ResponseEntity.ok(ApiResponse.success(list, "Technicians retrieved successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Technician>> getMyTechnicianProfile() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Error: User not found."));

        return technicianService.getTechnicianByUser(user)
                .map(tech -> ResponseEntity.ok(ApiResponse.success(tech, "Profile retrieved successfully")))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Technician>> getTechnicianById(@PathVariable @NonNull Long id) {
        Technician tech = technicianService.getTechnicianById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.success(tech, "Technician retrieved successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Technician>> updateStatus(@PathVariable @NonNull Long id, @RequestParam TechnicianStatus status) {
        Technician tech = technicianService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(tech, "Technician status updated successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Technician>> updateDetails(
            @PathVariable @NonNull Long id,
            @RequestParam(required = false) String skills,
            @RequestParam(required = false) String contactNumber,
            @RequestParam(required = false) Double rating) {
        Technician tech = technicianService.updateTechnicianDetails(id, skills, contactNumber, rating);
        return ResponseEntity.ok(ApiResponse.success(tech, "Technician details updated successfully"));
    }

    // --- Clock-In / Clock-Out and Attendance Logs ---

    @PostMapping("/{id}/clock-in")
    public ResponseEntity<ApiResponse<Attendance>> clockIn(@PathVariable @NonNull Long id) {
        Attendance attendance = technicianService.clockIn(id);
        return ResponseEntity.ok(ApiResponse.success(attendance, "Technician clocked in successfully"));
    }

    @PostMapping("/{id}/clock-out")
    public ResponseEntity<ApiResponse<Attendance>> clockOut(@PathVariable @NonNull Long id) {
        Attendance attendance = technicianService.clockOut(id);
        return ResponseEntity.ok(ApiResponse.success(attendance, "Technician clocked out successfully"));
    }

    @GetMapping("/{id}/attendance")
    public ResponseEntity<ApiResponse<List<Attendance>>> getAttendanceLogs(@PathVariable @NonNull Long id) {
        List<Attendance> list = technicianService.getAttendanceLogs(id);
        return ResponseEntity.ok(ApiResponse.success(list, "Attendance logs retrieved successfully"));
    }

    // --- Performance Tracking ---

    @GetMapping("/{id}/performance")
    public ResponseEntity<ApiResponse<TechnicianPerformanceDTO>> getPerformanceStats(@PathVariable @NonNull Long id) {
        TechnicianPerformanceDTO stats = technicianService.getPerformanceStats(id);
        return ResponseEntity.ok(ApiResponse.success(stats, "Performance statistics retrieved successfully"));
    }
}
