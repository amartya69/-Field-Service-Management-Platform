package com.keystone.service;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.keystone.config.JwtUtils;
import com.keystone.dto.ChangePasswordRequest;
import com.keystone.dto.JwtResponse;
import com.keystone.dto.LoginRequest;
import com.keystone.dto.SignupRequest;
import com.keystone.dto.TokenRefreshRequest;
import com.keystone.dto.TokenRefreshResponse;
import com.keystone.entity.RefreshToken;
import com.keystone.entity.Role;
import com.keystone.entity.Technician;
import com.keystone.entity.User;
import com.keystone.repository.PasswordResetTokenRepository;
import com.keystone.repository.TechnicianRepository;
import com.keystone.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TechnicianRepository technicianRepository;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private EmailService emailService;

    private User sampleUser;

    @BeforeEach
    public void setup() {
        sampleUser = new User(1L, "john_doe", "hashed_password", "john@test.com", Role.ROLE_TECHNICIAN);
    }

    @Test
    public void testAuthenticateUser_Success() {
        LoginRequest loginRequest = new LoginRequest("john_doe", "password123");
        Authentication auth = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtUtils.generateJwtToken(auth)).thenReturn("jwt.token.string");
        when(userRepository.findByUsernameIgnoreCase(anyString())).thenReturn(Optional.of(sampleUser));
        when(encoder.matches("password123", "hashed_password")).thenReturn(true);

        RefreshToken rt = new RefreshToken();
        rt.setToken("refresh-token-uuid");
        when(refreshTokenService.createRefreshToken(1L)).thenReturn(rt);

        JwtResponse response = authService.authenticateUser(loginRequest);

        assertNotNull(response);
        assertEquals("jwt.token.string", response.getToken());
        assertEquals("refresh-token-uuid", response.getRefreshToken());
        assertEquals("john_doe", response.getUsername());
        assertEquals("ROLE_TECHNICIAN", response.getRole());
    }

    @Test
    public void testRegisterUser_Success_Customer() {
        SignupRequest signup = new SignupRequest("alice", "alice@test.com", "pass123", "customer", null, null, null);

        when(userRepository.existsByUsername("alice")).thenReturn(false);
        when(userRepository.existsByEmail("alice@test.com")).thenReturn(false);
        when(encoder.encode("pass123")).thenReturn("hashed_pass");
        
        User savedUser = new User(2L, "alice", "hashed_pass", "alice@test.com", Role.ROLE_CUSTOMER);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = authService.registerUser(signup);

        assertNotNull(result);
        assertEquals("alice", result.getUsername());
        assertEquals(Role.ROLE_CUSTOMER, result.getRole());
        verify(technicianRepository, never()).save(any(Technician.class));
    }

    @Test
    public void testRegisterUser_Success_Technician() {
        SignupRequest signup = new SignupRequest("tech_bob", "bob@test.com", "pass123", "technician", "Bob Builder", "Carpentry", "555-9080");

        when(userRepository.existsByUsername("tech_bob")).thenReturn(false);
        when(userRepository.existsByEmail("bob@test.com")).thenReturn(false);
        when(encoder.encode("pass123")).thenReturn("hashed_pass");
        
        User savedUser = new User(3L, "tech_bob", "hashed_pass", "bob@test.com", Role.ROLE_TECHNICIAN);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = authService.registerUser(signup);

        assertNotNull(result);
        verify(technicianRepository, times(1)).save(any(Technician.class));
    }

    @Test
    public void testRegisterUser_Fail_UsernameExists() {
        SignupRequest signup = new SignupRequest("john_doe", "john@test.com", "pass123", "customer", null, null, null);
        when(userRepository.existsByUsername("john_doe")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.registerUser(signup));
    }

    @Test
    public void testRefreshToken_Success() {
        TokenRefreshRequest request = new TokenRefreshRequest("refresh-token-uuid");
        RefreshToken rt = new RefreshToken();
        rt.setUser(sampleUser);
        rt.setToken("refresh-token-uuid");
        rt.setExpiryDate(Instant.now().plusSeconds(60));

        when(refreshTokenService.findByToken("refresh-token-uuid")).thenReturn(Optional.of(rt));
        when(refreshTokenService.verifyExpiration(rt)).thenReturn(rt);
        when(jwtUtils.generateTokenFromUsername("john_doe")).thenReturn("new.jwt.token");

        TokenRefreshResponse response = authService.refreshToken(request);

        assertNotNull(response);
        assertEquals("new.jwt.token", response.getAccessToken());
        assertEquals("refresh-token-uuid", response.getRefreshToken());
    }

    @Test
    public void testChangePassword_Success() {
        ChangePasswordRequest request = new ChangePasswordRequest("old_password", "new_hashed_password");
        when(userRepository.findByUsername("john_doe")).thenReturn(Optional.of(sampleUser));
        when(encoder.matches("old_password", "hashed_password")).thenReturn(true);
        when(encoder.encode("new_hashed_password")).thenReturn("encoded_new_password");

        authService.changePassword("john_doe", request);

        verify(userRepository, times(1)).save(sampleUser);
        assertEquals("encoded_new_password", sampleUser.getPassword());
    }
}
