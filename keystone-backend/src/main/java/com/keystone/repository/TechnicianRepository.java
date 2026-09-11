package com.keystone.repository;

import com.keystone.entity.Technician;
import com.keystone.entity.TechnicianStatus;
import com.keystone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    Optional<Technician> findByUser(User user);
    List<Technician> findByStatus(TechnicianStatus status);
}
