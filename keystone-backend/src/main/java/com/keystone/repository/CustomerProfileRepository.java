package com.keystone.repository;

import com.keystone.entity.CustomerProfile;
import com.keystone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, Long> {
    Optional<CustomerProfile> findByUser(User user);
    List<CustomerProfile> findByCompanyNameContainingIgnoreCase(String companyName);
}
