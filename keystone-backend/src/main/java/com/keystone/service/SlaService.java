package com.keystone.service;

import com.keystone.dto.ResourceNotFoundException;
import com.keystone.dto.SlaMonitoringDTO;
import com.keystone.dto.SlaPolicyRequest;
import com.keystone.entity.*;
import com.keystone.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class SlaService {
    private static final Logger logger = LoggerFactory.getLogger(SlaService.class);

    @Autowired
    private SlaPolicyRepository slaPolicyRepository;

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    // --- SLA Policies CRUD ---

    public List<SlaPolicy> getAllPolicies() {
        return slaPolicyRepository.findAll();
    }

    public Optional<SlaPolicy> getPolicyById(@NonNull Long id) {
        return slaPolicyRepository.findById(id);
    }

    @Transactional
    public SlaPolicy createPolicy(SlaPolicyRequest request) {
        WorkOrderPriority priority = WorkOrderPriority.valueOf(request.getPriority().toUpperCase());
        if (slaPolicyRepository.findByPriority(priority).isPresent()) {
            throw new IllegalArgumentException("SLA Policy for priority " + priority + " already exists.");
        }

        SlaPolicy policy = new SlaPolicy(
                null,
                request.getName(),
                priority,
                request.getResponseTimeHours(),
                request.getResolutionTimeHours()
        );
        return slaPolicyRepository.save(policy);
    }

    @Transactional
    public SlaPolicy updatePolicy(@NonNull Long id, SlaPolicyRequest request) {
        SlaPolicy policy = slaPolicyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SLA Policy not found: " + id));

        policy.setName(request.getName());
        policy.setPriority(WorkOrderPriority.valueOf(request.getPriority().toUpperCase()));
        policy.setResponseTimeHours(request.getResponseTimeHours());
        policy.setResolutionTimeHours(request.getResolutionTimeHours());

        return slaPolicyRepository.save(policy);
    }

    @Transactional
    public void deletePolicy(@NonNull Long id) {
        SlaPolicy policy = slaPolicyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SLA Policy not found: " + id));
        slaPolicyRepository.delete(Objects.requireNonNull(policy));
    }

    // --- Monitoring & Verification ---

    public List<SlaMonitoringDTO> getSlaMonitoringData() {
        List<WorkOrder> activeOrders = workOrderRepository.findAll().stream()
                .filter(o -> o.getStatus() == WorkOrderStatus.OPEN || o.getStatus() == WorkOrderStatus.IN_PROGRESS)
                .toList();

        List<SlaMonitoringDTO> result = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (WorkOrder order : activeOrders) {
            SlaPolicy policy = getPolicyForPriority(order.getPriority());
            LocalDateTime deadline = order.getCreatedAt().plusHours(policy.getResolutionTimeHours());
            Duration remaining = Duration.between(now, deadline);
            double hoursRemaining = remaining.toMinutes() / 60.0;

            boolean isCompliant = hoursRemaining >= 0;
            boolean isEscalated = hoursRemaining < 0;

            result.add(new SlaMonitoringDTO(
                    order.getId(),
                    order.getTitle(),
                    order.getPriority().name(),
                    order.getStatus().name(),
                    order.getCreatedAt(),
                    deadline,
                    hoursRemaining,
                    isCompliant,
                    isEscalated
            ));
        }

        return result;
    }

    public SlaPolicy getPolicyForPriority(WorkOrderPriority priority) {
        return slaPolicyRepository.findByPriority(priority)
                .orElseGet(() -> {
                    // Fallback defaults
                    int resHours = switch (priority) {
                        case CRITICAL -> 4;
                        case HIGH -> 12;
                        case MEDIUM -> 24;
                        case LOW -> 48;
                    };
                    int respHours = switch (priority) {
                        case CRITICAL -> 1;
                        case HIGH -> 2;
                        case MEDIUM -> 4;
                        case LOW -> 8;
                    };
                    return new SlaPolicy(null, "Default " + priority + " Policy", priority, respHours, resHours);
                });
    }

    // Runs every 5 minutes automatically to check escalations
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void checkAndTriggerEscalations() {
        logger.info("Starting SLA escalation verification check...");
        List<SlaMonitoringDTO> monitoringList = getSlaMonitoringData();
        List<User> staff = userRepository.findByRole(Role.ROLE_DISPATCHER);
        staff.addAll(userRepository.findByRole(Role.ROLE_ADMIN));

        for (SlaMonitoringDTO dto : monitoringList) {
            if (dto.isEscalated()) {
                logger.warn("SLA Breached for Work Order #{}: '{}'. Deadline was: {}", dto.getWorkOrderId(), dto.getWorkOrderTitle(), dto.getDeadline());

                // Broadcast warning to all dispatchers and admins
                for (User employee : staff) {
                    notificationService.createNotification(
                            employee,
                            "SLA ESCALATION WARNING: Work Order #" + dto.getWorkOrderId() + " ('" + dto.getWorkOrderTitle() + "') has breached SLA targets."
                    );
                }
            }
        }
    }
}
