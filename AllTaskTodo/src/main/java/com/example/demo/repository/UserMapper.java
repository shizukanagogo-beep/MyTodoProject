package com.example.demo.repository;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.entity.User;

@Mapper
public interface UserMapper {

    User findByUsername(@Param("username") String username);

    void insert(User user);
}
