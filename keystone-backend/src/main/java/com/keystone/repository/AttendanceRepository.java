package com.keystone.repository;

import com.keystone.entity.Attendance;
import com.keystone.entity.Technician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByTechnicianOrderByDateDesc(Technician technician);
    Optional<Attendance> findByTechnicianAndDate(Technician technician, LocalDate date);
}
