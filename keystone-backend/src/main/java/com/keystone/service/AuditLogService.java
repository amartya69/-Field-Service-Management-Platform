package com.keystone.service;

import com.keystone.entity.AuditLog;
import com.keystone.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional
    public void log(String action, String entityName, Long entityId, String performedBy, String details) {
        AuditLog auditLog = new AuditLog(
                null,
                action,
                entityName,
                entityId,
                performedBy != null ? performedBy : "SYSTEM",
                LocalDateTime.now(),
                details
        );
        auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}
