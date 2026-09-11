package com.keystone.service;

import com.keystone.dto.ResourceNotFoundException;
import com.keystone.dto.TechnicianPerformanceDTO;
import com.keystone.entity.*;
import com.keystone.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class TechnicianService {

    @Autowired
    private TechnicianRepository technicianRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private SlaService slaService;

    public List<Technician> getAllTechnicians() {
        return technicianRepository.findAll();
    }

    public Optional<Technician> getTechnicianById(@NonNull Long id) {
        return technicianRepository.findById(id);
    }

    public Optional<Technician> getTechnicianByUser(User user) {
        return technicianRepository.findByUser(user);
    }

    @Transactional
    public Technician updateStatus(@NonNull Long id, TechnicianStatus status) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Error: Technician not found."));
        technician.setStatus(status);
        return technicianRepository.save(Objects.requireNonNull(technician));
    }

    @Transactional
    public Technician updateTechnicianDetails(@NonNull Long id, String skills, String contactNumber, Double rating) {
        Technician technician = technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Error: Technician not found."));
        if (skills != null) technician.setSkills(skills);
        if (contactNumber != null) technician.setContactNumber(contactNumber);
        if (rating != null) technician.setRating(rating);
        return technicianRepository.save(Objects.requireNonNull(technician));
    }

    // --- Attendance Clocking ---

    @Transactional
    public Attendance clockIn(@NonNull Long technicianId) {
        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + technicianId));

        LocalDate today = LocalDate.now();
        Optional<Attendance> attendanceOpt = attendanceRepository.findByTechnicianAndDate(technician, today);
        if (attendanceOpt.isPresent()) {
            throw new IllegalArgumentException("Technician already clocked in for today.");
        }

        Attendance attendance = new Attendance(
                null,
                technician,
                today,
                LocalDateTime.now(),
                null,
                "PRESENT"
        );

        // Update technician status to AVAILABLE
        technician.setStatus(TechnicianStatus.AVAILABLE);
        technicianRepository.save(technician);

        return attendanceRepository.save(attendance);
    }

    @Transactional
    public Attendance clockOut(@NonNull Long technicianId) {
        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + technicianId));

        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByTechnicianAndDate(technician, today)
                .orElseThrow(() -> new IllegalArgumentException("Technician has not clocked in for today yet."));

        attendance.setCheckOut(LocalDateTime.now());

        // Update status to OFF_DUTY
        technician.setStatus(TechnicianStatus.OFF_DUTY);
        technicianRepository.save(technician);

        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getAttendanceLogs(@NonNull Long technicianId) {
        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + technicianId));
        return attendanceRepository.findByTechnicianOrderByDateDesc(technician);
    }

    // --- Performance Tracking ---

    public TechnicianPerformanceDTO getPerformanceStats(@NonNull Long id) {
        Technician tech = technicianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + id));

        List<WorkOrder> workOrders = workOrderRepository.findByAssignedTechnicianOrderByCreatedAtDesc(tech);
        List<WorkOrder> completedOrders = workOrders.stream()
                .filter(o -> o.getStatus() == WorkOrderStatus.COMPLETED)
                .toList();

        long completedCount = completedOrders.size();
        double avgTime = 0.0;
        double complianceRate = 100.0;

        if (completedCount > 0) {
            avgTime = completedOrders.stream()
                    .mapToInt(o -> o.getTimeSpentMinutes() != null ? o.getTimeSpentMinutes() : 0)
                    .average()
                    .orElse(0.0);

            long compliantCount = completedOrders.stream()
                    .filter(o -> o.getCompletedDate() != null && o.getScheduledDate() != null)
                    .filter(o -> o.getCompletedDate().isBefore(o.getScheduledDate().plusHours(
                            slaService.getPolicyForPriority(o.getPriority()).getResolutionTimeHours()
                    )))
                    .count();

            complianceRate = ((double) compliantCount / completedCount) * 100.0;
        }

        return new TechnicianPerformanceDTO(
                tech.getId(),
                tech.getName(),
                tech.getRating(),
                completedCount,
                avgTime,
                complianceRate
        );
    }
}
