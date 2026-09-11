package com.keystone.service;

import com.keystone.dto.WorkOrderRequest;
import com.keystone.entity.*;
import com.keystone.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WorkOrderServiceTest {

    @InjectMocks
    private WorkOrderService workOrderService;

    @Mock
    private WorkOrderRepository workOrderRepository;

    @Mock
    private TechnicianRepository technicianRepository;

    @Mock
    private CustomerRequestRepository customerRequestRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserRepository userRepository;

    private WorkOrder sampleOrder;
    private Technician sampleTech;
    private User sampleUser;

    @BeforeEach
    public void setup() {
        sampleUser = new User(1L, "tech1", "pass", "tech1@keystone.com", Role.ROLE_TECHNICIAN);
        sampleTech = new Technician(1L, sampleUser, "Bob Builder", "HVAC", TechnicianStatus.AVAILABLE, "555-0010", 4.9);
        sampleOrder = new WorkOrder(
                1L, "Roof AC Diagnostic", "AC blowing lukewarm air",
                WorkOrderPriority.HIGH, WorkOrderStatus.OPEN, sampleTech,
                null, "Building A Roof", LocalDateTime.now(), null, "", 0, LocalDateTime.now()
        );
    }

    @Test
    public void testCreateWorkOrder_Success() {
        WorkOrderRequest request = new WorkOrderRequest(
                "Roof AC Diagnostic", "AC blowing lukewarm air",
                "HIGH", "OPEN", 1L, null, "Building A Roof",
                LocalDateTime.now(), null, "", 0
        );

        when(technicianRepository.findById(1L)).thenReturn(Optional.of(sampleTech));
        when(workOrderRepository.save(any(WorkOrder.class))).thenReturn(sampleOrder);

        WorkOrder result = workOrderService.createWorkOrder(request);

        assertNotNull(result);
        assertEquals("Roof AC Diagnostic", result.getTitle());
        assertEquals(WorkOrderStatus.OPEN, result.getStatus());
        assertEquals(sampleTech, result.getAssignedTechnician());
        verify(notificationService, times(1)).createNotification(any(User.class), anyString());
    }

    @Test
    public void testStartWorkOrder_Success() {
        when(workOrderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WorkOrder result = workOrderService.startWorkOrder(1L);

        assertNotNull(result);
        assertEquals(WorkOrderStatus.IN_PROGRESS, result.getStatus());
        assertEquals(TechnicianStatus.ON_SITE, sampleTech.getStatus());
        verify(technicianRepository, times(1)).save(sampleTech);
    }

    @Test
    public void testCompleteWorkOrder_Success() {
        when(workOrderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WorkOrder result = workOrderService.completeWorkOrder(1L);

        assertNotNull(result);
        assertEquals(WorkOrderStatus.COMPLETED, result.getStatus());
        assertNotNull(result.getCompletedDate());
        assertEquals(TechnicianStatus.AVAILABLE, sampleTech.getStatus());
        verify(technicianRepository, times(1)).save(sampleTech);
    }

    @Test
    public void testCancelWorkOrder_Success() {
        when(workOrderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WorkOrder result = workOrderService.cancelWorkOrder(1L);

        assertNotNull(result);
        assertEquals(WorkOrderStatus.CANCELLED, result.getStatus());
        assertEquals(TechnicianStatus.AVAILABLE, sampleTech.getStatus());
        verify(technicianRepository, times(1)).save(sampleTech);
    }

    @Test
    public void testRejectWorkOrder_Success() {
        when(workOrderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        java.util.List<User> dispatchers = new java.util.ArrayList<>();
        dispatchers.add(new User(2L, "disp1", "pass", "disp1@test.com", Role.ROLE_DISPATCHER));
        when(userRepository.findByRole(Role.ROLE_DISPATCHER)).thenReturn(dispatchers);
        when(userRepository.findByRole(Role.ROLE_ADMIN)).thenReturn(new java.util.ArrayList<>());

        WorkOrder result = workOrderService.rejectWorkOrder(1L);

        assertNotNull(result);
        assertNull(result.getAssignedTechnician());
        verify(notificationService, atLeastOnce()).createNotification(any(), anyString());
    }
}
