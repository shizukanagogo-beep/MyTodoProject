package com.example.demo.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.entity.User;
import com.example.demo.repository.UserMapper;
import com.example.demo.security.JwtService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            BindingResult result
    ) {
        if (result.hasErrors()) {
            String errorMessage = result.getFieldError().getDefaultMessage();
            return ResponseEntity.badRequest().body(Map.of("error", errorMessage));
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "ユーザー名またはパスワードが違います"));
        }

        String token = jwtService.generateToken(request.getUsername());

        return ResponseEntity.ok(
                new LoginResponse(token, request.getUsername())
        );
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody LoginRequest request,
            BindingResult result
    ) {
        if (result.hasErrors()) {
            String errorMessage = result.getFieldError().getDefaultMessage();
            return ResponseEntity.badRequest().body(Map.of("error", errorMessage));
        }

        User existing = userMapper.findByUsername(request.getUsername());

        if (existing != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "このユーザー名は既に使われています"));
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userMapper.insert(user);

        String token = jwtService.generateToken(user.getUsername());

        return ResponseEntity.ok(
                new LoginResponse(token, user.getUsername())
        );
    }
}
