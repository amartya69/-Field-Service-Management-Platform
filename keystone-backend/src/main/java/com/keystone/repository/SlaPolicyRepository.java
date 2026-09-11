package com.keystone.repository;

import com.keystone.entity.SlaPolicy;
import com.keystone.entity.WorkOrderPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SlaPolicyRepository extends JpaRepository<SlaPolicy, Long> {
    Optional<SlaPolicy> findByPriority(WorkOrderPriority priority);
}
