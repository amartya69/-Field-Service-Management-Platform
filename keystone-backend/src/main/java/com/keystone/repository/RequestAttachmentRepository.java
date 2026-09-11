package com.keystone.repository;

import com.keystone.entity.CustomerRequest;
import com.keystone.entity.RequestAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RequestAttachmentRepository extends JpaRepository<RequestAttachment, Long> {
    List<RequestAttachment> findByCustomerRequest(CustomerRequest customerRequest);
}
