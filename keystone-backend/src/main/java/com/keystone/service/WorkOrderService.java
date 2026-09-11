package com.keystone.service;

import com.keystone.dto.ResourceNotFoundException;
import com.keystone.dto.WorkOrderRequest;
import com.keystone.entity.*;
import com.keystone.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class WorkOrderService {

    @Autowired
    private WorkOrderRepository workOrderRepository;

    @Autowired
    private TechnicianRepository technicianRepository;

    @Autowired
    private CustomerRequestRepository customerRequestRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    public List<WorkOrder> getAllWorkOrders() {
        return workOrderRepository.findAllByOrderByCreatedAtDesc();
    }

    public Page<WorkOrder> getWorkOrdersFiltered(String search, WorkOrderStatus status, WorkOrderPriority priority, Pageable pageable) {
        return workOrderRepository.findByFilters(search, status, priority, pageable);
    }

    public Page<WorkOrder> getWorkOrdersFilteredAndTechnician(String search, WorkOrderStatus status, WorkOrderPriority priority, Technician technician, Pageable pageable) {
        return workOrderRepository.findByFiltersAndTechnician(search, status, priority, technician, pageable);
    }

    public List<WorkOrder> getWorkOrdersByTechnician(Technician technician) {
        return workOrderRepository.findByAssignedTechnicianOrderByCreatedAtDesc(technician);
    }

    public Optional<WorkOrder> getWorkOrderById(@NonNull Long id) {
        return workOrderRepository.findById(id);
    }

    @Transactional
    public WorkOrder createWorkOrder(WorkOrderRequest request) {
        WorkOrder workOrder = new WorkOrder();
        workOrder.setTitle(request.getTitle());
        workOrder.setDescription(request.getDescription());
        workOrder.setPriority(WorkOrderPriority.valueOf(request.getPriority().toUpperCase()));
        workOrder.setStatus(WorkOrderStatus.valueOf(request.getStatus().toUpperCase()));
        workOrder.setLocation(request.getLocation());
        workOrder.setScheduledDate(request.getScheduledDate());
        workOrder.setPartsUsed(request.getPartsUsed());
        workOrder.setTimeSpentMinutes(request.getTimeSpentMinutes() != null ? request.getTimeSpentMinutes() : 0);
        workOrder.setCreatedAt(LocalDateTime.now());

        Long technicianId = request.getTechnicianId();
        if (technicianId != null) {
            Technician tech = technicianRepository.findById(technicianId)
                    .orElseThrow(() -> new ResourceNotFoundException("Error: Technician not found."));
            workOrder.setAssignedTechnician(tech);
            // Alert technician
            notificationService.createNotification(
                    tech.getUser(),
                    "New Work Order Assigned: '" + workOrder.getTitle() + "' scheduled for " + workOrder.getScheduledDate()
            );
        }

        Long customerRequestId = request.getCustomerRequestId();
        if (customerRequestId != null) {
            CustomerRequest customerReq = customerRequestRepository.findById(customerRequestId)
                    .orElseThrow(() -> new ResourceNotFoundException("Error: Customer request not found."));
            workOrder.setCustomerRequest(customerReq);
            // Mark request as APPROVED
            customerReq.setStatus(CustomerRequestStatus.APPROVED);
            customerRequestRepository.save(customerReq);

            // Alert customer
            notificationService.createNotification(
                    customerReq.getCustomer(),
                    "Your service request has been approved and scheduled as Work Order: '" + workOrder.getTitle() + "'"
            );
        }

        return workOrderRepository.save(workOrder);
    }

    @Transactional
    public WorkOrder updateWorkOrder(@NonNull Long id, WorkOrderRequest request) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Error: Work order not found."));

        workOrder.setTitle(request.getTitle());
        workOrder.setDescription(request.getDescription());
        workOrder.setLocation(request.getLocation());
        workOrder.setScheduledDate(request.getScheduledDate());
        workOrder.setPartsUsed(request.getPartsUsed());
        workOrder.setTimeSpentMinutes(request.getTimeSpentMinutes() != null ? request.getTimeSpentMinutes() : 0);

        WorkOrderPriority newPriority = WorkOrderPriority.valueOf(request.getPriority().toUpperCase());
        workOrder.setPriority(newPriority);

        WorkOrderStatus oldStatus = workOrder.getStatus();
        WorkOrderStatus newStatus = WorkOrderStatus.valueOf(request.getStatus().toUpperCase());
        workOrder.setStatus(newStatus);

        // Manage Status Changes and Technician Availability
        Technician oldTech = workOrder.getAssignedTechnician();
        Technician newTech = null;

        Long reqTechId = request.getTechnicianId();
        if (reqTechId != null) {
            newTech = technicianRepository.findById(reqTechId)
                    .orElseThrow(() -> new ResourceNotFoundException("Error: Technician not found."));
        }

        workOrder.setAssignedTechnician(newTech);

        // Log completions
        if (newStatus == WorkOrderStatus.COMPLETED && oldStatus != WorkOrderStatus.COMPLETED) {
            workOrder.setCompletedDate(LocalDateTime.now());
            if (newTech != null) {
                newTech.setStatus(TechnicianStatus.AVAILABLE);
                technicianRepository.save(newTech);
            }
            if (workOrder.getCustomerRequest() != null) {
                notificationService.createNotification(
                        workOrder.getCustomerRequest().getCustomer(),
                        "Service completed: Work order '" + workOrder.getTitle() + "' is marked as resolved."
                );
            }
        }

        // Handle Tech assignment alerts
        if (newTech != null && (oldTech == null || !oldTech.getId().equals(newTech.getId()))) {
            notificationService.createNotification(
                    newTech.getUser(),
                    "You have been assigned to Work Order: '" + workOrder.getTitle() + "'"
            );
        }

        // Manage active states
        if (newTech != null) {
            if (newStatus == WorkOrderStatus.IN_PROGRESS) {
                newTech.setStatus(TechnicianStatus.ON_SITE);
                technicianRepository.save(newTech);
            } else if (newStatus == WorkOrderStatus.OPEN) {
                newTech.setStatus(TechnicianStatus.AVAILABLE);
                technicianRepository.save(newTech);
            }
        }

        return workOrderRepository.save(workOrder);
    }

    @Transactional
    public void deleteWorkOrder(@NonNull Long id) {
        WorkOrder order = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Error: Work order not found."));
        workOrderRepository.delete(Objects.requireNonNull(order));
    }

    // --- Work Order Lifecycle Transitions ---

    @Transactional
    public WorkOrder acceptWorkOrder(@NonNull Long id) {
        WorkOrder order = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found: " + id));

        // Alert dispatchers/admin
        List<User> staff = userRepository.findByRole(Role.ROLE_DISPATCHER);
        staff.addAll(userRepository.findByRole(Role.ROLE_ADMIN));
        String techName = order.getAssignedTechnician() != null ? order.getAssignedTechnician().getName() : "Technician";

        for (User user : staff) {
            notificationService.createNotification(
                    user,
                    "Work order #" + order.getId() + " acknowledged and accepted by " + techName
            );
        }

        return order;
    }

    @Transactional
    public WorkOrder rejectWorkOrder(@NonNull Long id) {
        WorkOrder order = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found: " + id));

        Technician assigned = order.getAssignedTechnician();
        order.setAssignedTechnician(null);
        order.setScheduledDate(null);

        // Alert dispatchers/admin
        List<User> staff = userRepository.findByRole(Role.ROLE_DISPATCHER);
        staff.addAll(userRepository.findByRole(Role.ROLE_ADMIN));
        String techName = assigned != null ? assigned.getName() : "Technician";

        for (User user : staff) {
            notificationService.createNotification(
                    user,
                    "ALERT: Work order #" + order.getId() + " rejected by " + techName + ". Reason: Unavailability."
            );
        }

        return workOrderRepository.save(order);
    }

    @Transactional
    public WorkOrder startWorkOrder(@NonNull Long id) {
        WorkOrder order = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found: " + id));

        order.setStatus(WorkOrderStatus.IN_PROGRESS);

        Technician tech = order.getAssignedTechnician();
        if (tech != null) {
            tech.setStatus(TechnicianStatus.ON_SITE);
            technicianRepository.save(tech);
        }

        return workOrderRepository.save(order);
    }

    @Transactional
    public WorkOrder pauseWorkOrder(@NonNull Long id) {
        WorkOrder order = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found: " + id));

        order.setStatus(WorkOrderStatus.OPEN);

        Technician tech = order.getAssignedTechnician();
        if (tech != null) {
            tech.setStatus(TechnicianStatus.AVAILABLE);
            technicianRepository.save(tech);
        }

        return workOrderRepository.save(order);
    }

    @Transactional
    public WorkOrder completeWorkOrder(@NonNull Long id) {
        WorkOrder order = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found: " + id));

        order.setStatus(WorkOrderStatus.COMPLETED);
        order.setCompletedDate(LocalDateTime.now());

        Technician tech = order.getAssignedTechnician();
        if (tech != null) {
            tech.setStatus(TechnicianStatus.AVAILABLE);
            technicianRepository.save(tech);
        }

        if (order.getCustomerRequest() != null) {
            notificationService.createNotification(
                    order.getCustomerRequest().getCustomer(),
                    "Service completed: Work order '" + order.getTitle() + "' is marked as resolved."
            );
        }

        return workOrderRepository.save(order);
    }

    @Transactional
    public WorkOrder verifyWorkOrder(@NonNull Long id) {
        WorkOrder order = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found: " + id));

        // Mark details or log verification
        if (order.getCustomerRequest() != null) {
            notificationService.createNotification(
                    order.getCustomerRequest().getCustomer(),
                    "Your verification has been recorded for service request: '" + order.getCustomerRequest().getTitle() + "'"
            );
        }
        return order;
    }

    @Transactional
    public WorkOrder closeWorkOrder(@NonNull Long id) {
        WorkOrder order = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found: " + id));

        order.setStatus(WorkOrderStatus.COMPLETED);
        return workOrderRepository.save(order);
    }

    @Transactional
    public WorkOrder cancelWorkOrder(@NonNull Long id) {
        WorkOrder order = workOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work order not found: " + id));

        order.setStatus(WorkOrderStatus.CANCELLED);

        Technician tech = order.getAssignedTechnician();
        if (tech != null) {
            tech.setStatus(TechnicianStatus.AVAILABLE);
            technicianRepository.save(tech);
        }

        return workOrderRepository.save(order);
    }
}
