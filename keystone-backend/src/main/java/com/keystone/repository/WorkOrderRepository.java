package com.keystone.repository;

import com.keystone.entity.Technician;
import com.keystone.entity.WorkOrder;
import com.keystone.entity.WorkOrderPriority;
import com.keystone.entity.WorkOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {
    List<WorkOrder> findByAssignedTechnicianOrderByCreatedAtDesc(Technician technician);
    List<WorkOrder> findByStatus(WorkOrderStatus status);
    List<WorkOrder> findAllByOrderByCreatedAtDesc();

    @Query("SELECT w FROM WorkOrder w WHERE " +
           "(:status IS NULL OR w.status = :status) AND " +
           "(:priority IS NULL OR w.priority = :priority) AND " +
           "(COALESCE(:search, '') = '' OR " +
           "LOWER(w.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(w.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(w.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<WorkOrder> findByFilters(
            @Param("search") String search,
            @Param("status") WorkOrderStatus status,
            @Param("priority") WorkOrderPriority priority,
            Pageable pageable);

    @Query("SELECT w FROM WorkOrder w WHERE " +
           "w.assignedTechnician = :technician AND " +
           "(:status IS NULL OR w.status = :status) AND " +
           "(:priority IS NULL OR w.priority = :priority) AND " +
           "(COALESCE(:search, '') = '' OR " +
           "LOWER(w.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(w.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(w.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<WorkOrder> findByFiltersAndTechnician(
            @Param("search") String search,
            @Param("status") WorkOrderStatus status,
            @Param("priority") WorkOrderPriority priority,
            @Param("technician") Technician technician,
            Pageable pageable);
}
