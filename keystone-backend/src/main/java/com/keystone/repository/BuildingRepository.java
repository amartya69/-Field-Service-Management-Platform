package com.keystone.repository;

import com.keystone.entity.Building;
import com.keystone.entity.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {
    List<Building> findByCustomerProfile(CustomerProfile customerProfile);
}
