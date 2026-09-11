package com.keystone.service;

import com.keystone.entity.Notification;
import com.keystone.entity.User;
import com.keystone.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.lang.NonNull;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public List<Notification> getNotificationsForUser(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Notification> getUnreadNotificationsForUser(User user) {
        return notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false);
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndIsRead(user, false);
    }

    @Transactional
    public void createNotification(User user, String message) {
        Notification notification = new Notification(
                null,
                user,
                message,
                false,
                LocalDateTime.now()
        );
        Notification saved = notificationRepository.save(notification);

        // Broadcast notification to user topic via WebSocket
        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + user.getUsername(), saved);
        } catch (Exception e) {
            // Log warning but don't break operation in case of WebSocket messaging errors
            System.err.println("Could not broadcast notification via WebSocket: " + e.getMessage());
        }
    }

    @Transactional
    public Notification markAsRead(@NonNull Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Error: Notification not found."));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false);
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
