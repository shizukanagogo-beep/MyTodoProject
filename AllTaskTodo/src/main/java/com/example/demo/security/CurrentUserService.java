package com.example.demo.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserMapper;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CurrentUserService {

    private final UserMapper userMapper;

    public Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new UsernameNotFoundException("Authenticated user not found");
        }

        User user = userMapper.findByUsername(authentication.getName());

        if (user == null) {
            throw new UsernameNotFoundException("Authenticated user not found");
        }

        return user.getId();
    }
}
