package com.keystone.service;

import com.keystone.dto.DispatchRouteDTO;
import com.keystone.dto.ResourceNotFoundException;
import com.keystone.dto.TechnicianAssignmentRequest;
import com.keystone.entity.*;
import com.keystone.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;
import java.util.Objects;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class DispatchService {

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private TechnicianRepository technicianRepository;

    @Autowired
    private NotificationService notificationService;

    public List<WorkOrder> getCalendarWorkOrders(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay();

        return workOrderRepository.findAll().stream()
                .filter(o -> {
                    // Include any active unassigned/unscheduled work orders (non-completed and non-cancelled)
                    if (o.getStatus() != WorkOrderStatus.COMPLETED && o.getStatus() != WorkOrderStatus.CANCELLED) {
                        if (o.getAssignedTechnician() == null || o.getScheduledDate() == null) {
                            return true;
                        }
                    }
                    // Otherwise, only include if scheduled within the calendar date range
                    return o.getScheduledDate() != null &&
                            !o.getScheduledDate().isBefore(start) &&
                            o.getScheduledDate().isBefore(end);
                })
                .sorted((o1, o2) -> {
                    if (o1.getScheduledDate() == null && o2.getScheduledDate() == null) {
                        return o2.getCreatedAt().compareTo(o1.getCreatedAt()); // newer first
                    }
                    if (o1.getScheduledDate() == null) return -1;
                    if (o2.getScheduledDate() == null) return 1;
                    return o1.getScheduledDate().compareTo(o2.getScheduledDate());
                })
                .toList();
    }

    public DispatchRouteDTO getTechnicianRoute(@NonNull Long technicianId, LocalDate date) {
        Technician technician = technicianRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found: " + technicianId));

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();

        List<WorkOrder> dailyOrders = workOrderRepository.findByAssignedTechnicianOrderByCreatedAtDesc(technician).stream()
                .filter(o -> o.getScheduledDate() != null &&
                        !o.getScheduledDate().isBefore(startOfDay) &&
                        o.getScheduledDate().isBefore(endOfDay))
                .sorted(Comparator.comparing(o -> o.getScheduledDate()))
                .toList();

        List<DispatchRouteDTO.RouteStop> stops = new ArrayList<>();
        int count = 1;
        for (WorkOrder order : dailyOrders) {
            // Mock estimated travel time: e.g. 20 minutes for first stop, 15 minutes for subsequent stops
            int travelTime = count == 1 ? 20 : 15;
            stops.add(new DispatchRouteDTO.RouteStop(
                    count++,
                    order.getId(),
                    order.getTitle(),
                    order.getLocation(),
                    order.getScheduledDate(),
                    travelTime
            ));
        }

        return new DispatchRouteDTO(technician.getId(), technician.getName(), date, stops);
    }

    @Transactional
    public WorkOrder assignTechnician(TechnicianAssignmentRequest request) {
        WorkOrder order = workOrderRepository.findById(Objects.requireNonNull(request.getWorkOrderId()))
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found: " + request.getWorkOrderId()));

        Technician technician = technicianRepository.findById(Objects.requireNonNull(request.getTechnicianId()))
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found: " + request.getTechnicianId()));

        order.setAssignedTechnician(technician);
        if (request.getScheduledDate() != null) {
            order.setScheduledDate(request.getScheduledDate());
        }

        // Notify technician
        notificationService.createNotification(
                technician.getUser(),
                "Dispatch alert: You have been assigned to Work Order #" + order.getId() + " ('" + order.getTitle() + "') scheduled for " + order.getScheduledDate()
        );

        return workOrderRepository.save(order);
    }
}
