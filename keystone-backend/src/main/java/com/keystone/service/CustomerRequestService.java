package com.keystone.service;

import com.keystone.dto.CustomerRequestRequest;
import com.keystone.dto.ResourceNotFoundException;
import com.keystone.entity.CustomerRequest;
import com.keystone.entity.CustomerRequestStatus;
import com.keystone.entity.RequestAttachment;
import com.keystone.entity.User;
import com.keystone.repository.CustomerRequestRepository;
import com.keystone.repository.RequestAttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.lang.NonNull;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerRequestService {

    @Autowired
    private CustomerRequestRepository customerRequestRepository;

    @Autowired
    private RequestAttachmentRepository requestAttachmentRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private NotificationService notificationService;

    public List<CustomerRequest> getAllRequests() {
        return customerRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<CustomerRequest> getRequestsByCustomer(User customer) {
        return customerRequestRepository.findByCustomerOrderByCreatedAtDesc(customer);
    }

    public Optional<CustomerRequest> getRequestById(@NonNull Long id) {
        return customerRequestRepository.findById(id);
    }

    @Transactional
    public CustomerRequest createRequest(User customer, CustomerRequestRequest requestDto) {
        CustomerRequest customerRequest = new CustomerRequest(
                null,
                customer,
                requestDto.getTitle(),
                requestDto.getDescription(),
                requestDto.getCategory(),
                CustomerRequestStatus.PENDING,
                LocalDateTime.now()
        );
        return customerRequestRepository.save(customerRequest);
    }

    @Transactional
    public CustomerRequest updateStatus(@NonNull Long id, CustomerRequestStatus status) {
        CustomerRequest customerRequest = customerRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Error: Customer request not found."));
        customerRequest.setStatus(status);

        // Notify client about the status change
        notificationService.createNotification(
                customerRequest.getCustomer(),
                "Your request '" + customerRequest.getTitle() + "' has been " + status.name().toLowerCase() + "."
        );

        return customerRequestRepository.save(customerRequest);
    }

    // --- Request Attachments Support ---

    @Transactional
    public RequestAttachment addAttachment(Long requestId, MultipartFile file) {
        CustomerRequest customerRequest = customerRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer request not found: " + requestId));

        String filePath = fileStorageService.storeFile(file);

        RequestAttachment attachment = new RequestAttachment(
                null,
                customerRequest,
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment",
                filePath,
                file.getContentType(),
                LocalDateTime.now()
        );

        return requestAttachmentRepository.save(attachment);
    }

    public List<RequestAttachment> getAttachments(Long requestId) {
        CustomerRequest customerRequest = customerRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer request not found: " + requestId));
        return requestAttachmentRepository.findByCustomerRequest(customerRequest);
    }
}
