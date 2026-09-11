package com.keystone.repository;

import com.keystone.entity.CustomerRequest;
import com.keystone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomerRequestRepository extends JpaRepository<CustomerRequest, Long> {
    List<CustomerRequest> findByCustomerOrderByCreatedAtDesc(User customer);
    List<CustomerRequest> findAllByOrderByCreatedAtDesc();
}
