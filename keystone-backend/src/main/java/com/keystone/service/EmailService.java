package com.keystone.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String text) {
        logger.info("Sending Email to: {}, Subject: {}", to, subject);
        logger.debug("Email Content:\n{}", text);

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(text);
                message.setFrom("no-reply@keystone.com");
                mailSender.send(message);
                logger.info("Email sent successfully to {}", to);
            } catch (Exception e) {
                logger.error("Failed to send email via JavaMailSender, logged fallback. Error: {}", e.getMessage());
            }
        } else {
            logger.warn("JavaMailSender not configured. Email to {} printed to console log only.", to);
        }
    }

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        String subject = "Keystone - Password Reset Request";
        String body = "You requested a password reset for your Keystone Field Service account.\n\n" +
                "Click the link below to reset your password:\n" + resetUrl + "\n\n" +
                "This link will expire in 1 hour.\n\n" +
                "If you did not request this, please ignore this email.";
        sendEmail(toEmail, subject, body);
    }
}
