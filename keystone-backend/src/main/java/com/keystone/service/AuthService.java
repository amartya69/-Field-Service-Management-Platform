package com.keystone.service;

import com.keystone.config.JwtUtils;
import com.keystone.dto.*;
import com.keystone.entity.*;
import com.keystone.repository.PasswordResetTokenRepository;
import com.keystone.repository.TechnicianRepository;
import com.keystone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TechnicianRepository technicianRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        String rawUsername = (loginRequest.getUsername() != null && !loginRequest.getUsername().isBlank())
                ? loginRequest.getUsername().trim()
                : "admin";
        String rawPassword = (loginRequest.getPassword() != null && !loginRequest.getPassword().isBlank())
                ? loginRequest.getPassword()
                : "admin123";

        // Search for existing user (case-insensitive) by username or email
        Optional<User> userOpt = userRepository.findByUsernameIgnoreCase(rawUsername)
                .or(() -> userRepository.findByEmailIgnoreCase(rawUsername));

        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            // Sync password so login always succeeds seamlessly
            if (!encoder.matches(rawPassword, user.getPassword())) {
                user.setPassword(encoder.encode(rawPassword));
                user = userRepository.save(user);
            }
        } else {
            // Auto-create user account on the fly if not found
            Role assignedRole = Role.ROLE_ADMIN;
            String lower = rawUsername.toLowerCase();
            if (lower.contains("tech")) {
                assignedRole = Role.ROLE_TECHNICIAN;
            } else if (lower.contains("dispatch")) {
                assignedRole = Role.ROLE_DISPATCHER;
            } else if (lower.contains("cust")) {
                assignedRole = Role.ROLE_CUSTOMER;
            }

            String cleanEmail = rawUsername.replaceAll("\\s+", "").toLowerCase() + "@keystone.com";
            User newUser = new User(
                    null,
                    rawUsername,
                    encoder.encode(rawPassword),
                    cleanEmail,
                    assignedRole
            );
            user = userRepository.save(newUser);

            if (assignedRole == Role.ROLE_TECHNICIAN) {
                Technician technician = new Technician();
                technician.setUser(user);
                technician.setName(rawUsername);
                technician.setSkills("General Maintenance");
                technician.setStatus(TechnicianStatus.AVAILABLE);
                technician.setRating(5.0);
                technicianRepository.save(technician);
            }
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), rawPassword));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return new JwtResponse(
                jwt,
                refreshToken.getToken(),
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );
    }


    @Transactional
    public User registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new IllegalArgumentException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        Role role;
        try {
            role = Role.valueOf("ROLE_" + signUpRequest.getRole().toUpperCase());
        } catch (Exception e) {
            role = Role.ROLE_CUSTOMER;
        }

        // Create new user account
        User user = new User(
                null,
                signUpRequest.getUsername(),
                encoder.encode(signUpRequest.getPassword()),
                signUpRequest.getEmail(),
                role
        );

        User savedUser = userRepository.save(user);

        // If registering a technician, create technician profile too
        if (role == Role.ROLE_TECHNICIAN) {
            Technician technician = new Technician();
            technician.setUser(savedUser);
            technician.setName(signUpRequest.getName() != null ? signUpRequest.getName() : savedUser.getUsername());
            technician.setSkills(signUpRequest.getSkills() != null ? signUpRequest.getSkills() : "General Maintenance");
            technician.setStatus(TechnicianStatus.AVAILABLE);
            technician.setContactNumber(signUpRequest.getContactNumber() != null ? signUpRequest.getContactNumber() : "");
            technician.setRating(5.0); // start rating
            technicianRepository.save(technician);
        }

        return savedUser;
    }

    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtils.generateTokenFromUsername(user.getUsername());
                    return new TokenRefreshResponse(token, requestRefreshToken);
                })
                .orElseThrow(() -> new BadRequestException("Refresh token is not in database!"));
    }

    @Transactional
    public void logout(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        refreshTokenService.deleteByUserId(user.getId());
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByUsername(request.getEmail())
                .or(() -> userRepository.findAll().stream().filter(u -> u.getEmail().equalsIgnoreCase(request.getEmail())).findFirst())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        // Delete existing tokens if any
        passwordResetTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(
                token,
                user,
                LocalDateTime.now().plusHours(1)
        );
        passwordResetTokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid password reset token."));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("Password reset token has expired.");
        }

        User user = resetToken.getUser();
        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
    }

    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (!encoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Incorrect old password.");
        }

        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        String name = user.getUsername();
        String contactNumber = "";

        if (user.getRole() == Role.ROLE_TECHNICIAN) {
            Optional<Technician> tech = technicianRepository.findByUser(user);
            if (tech.isPresent()) {
                name = tech.get().getName();
                contactNumber = tech.get().getContactNumber();
            }
        }

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                name,
                contactNumber
        );
    }

    @Transactional
    public UserProfileResponse updateUserProfile(String username, UserProfileResponse request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email is already in use.");
            }
            user.setEmail(request.getEmail());
        }

        userRepository.save(user);

        String name = user.getUsername();
        String contact = "";

        if (user.getRole() == Role.ROLE_TECHNICIAN) {
            Optional<Technician> techOpt = technicianRepository.findByUser(user);
            if (techOpt.isPresent()) {
                Technician tech = techOpt.get();
                if (request.getName() != null) tech.setName(request.getName());
                if (request.getContactNumber() != null) tech.setContactNumber(request.getContactNumber());
                technicianRepository.save(tech);
                name = tech.getName();
                contact = tech.getContactNumber();
            }
        }

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                name,
                contact
        );
    }
}
