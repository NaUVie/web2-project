package com.rainbowforest.orderservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        System.out.println("======> SENDING EMAIL to: " + to);
        System.out.println("Subject: " + subject);
        System.out.println("Body: " + body);
        if (mailSender == null) {
            System.out.println("JavaMailSender not configured. Skipping actual SMTP mail delivery.");
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("Mail sent successfully using JavaMailSender.");
        } catch (Exception e) {
            System.err.println("Failed to send mail via SMTP: " + e.getMessage());
        }
    }
}
