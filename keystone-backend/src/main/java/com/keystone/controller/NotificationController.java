package com.keystone.controller;

import com.keystone.dto.ApiResponse;
import com.keystone.dto.ResourceNotFoundException;
import com.keystone.entity.Notification;
import com.keystone.entity.User;
import com.keystone.repository.UserRepository;
import com.keystone.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Error: Authenticated user not found."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications() {
        List<Notification> list = notificationService.getNotificationsForUser(getAuthenticatedUser());
        return ResponseEntity.ok(ApiResponse.success(list, "Notifications retrieved successfully"));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnreadNotifications() {
        List<Notification> list = notificationService.getUnreadNotificationsForUser(getAuthenticatedUser());
        return ResponseEntity.ok(ApiResponse.success(list, "Unread notifications retrieved successfully"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        long count = notificationService.getUnreadCount(getAuthenticatedUser());
        return ResponseEntity.ok(ApiResponse.success(count, "Unread count retrieved successfully"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable @NonNull Long id) {
        Notification notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(notification, "Notification marked as read"));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead() {
        notificationService.markAllAsRead(getAuthenticatedUser());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read.", "Operation successful"));
    }
}
